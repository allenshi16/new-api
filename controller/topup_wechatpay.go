package controller

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
	"github.com/thanhpk/randstr"
	"github.com/wechatpay-apiv3/wechatpay-go/core"
	"github.com/wechatpay-apiv3/wechatpay-go/core/auth/verifiers"
	"github.com/wechatpay-apiv3/wechatpay-go/core/downloader"
	"github.com/wechatpay-apiv3/wechatpay-go/core/notify"
	"github.com/wechatpay-apiv3/wechatpay-go/core/option"
	"github.com/wechatpay-apiv3/wechatpay-go/services/payments"
	"github.com/wechatpay-apiv3/wechatpay-go/services/payments/native"
	"github.com/wechatpay-apiv3/wechatpay-go/utils"
)

var wechatPayClient *core.Client

func getWeChatPayClient() (*core.Client, error) {
	if wechatPayClient != nil {
		return wechatPayClient, nil
	}

	if setting.WeChatPayMchID == "" || setting.WeChatPayAPIv3Key == "" || setting.WeChatPayPrivateKeyPath == "" {
		return nil, fmt.Errorf("微信支付配置不完整")
	}

	privateKey, err := utils.LoadPrivateKeyWithPath(setting.WeChatPayPrivateKeyPath)
	if err != nil {
		return nil, fmt.Errorf("加载微信支付私钥失败: %w", err)
	}

	ctx := context.Background()
	opts := []core.ClientOption{
		option.WithWechatPayAutoAuthCipher(
			setting.WeChatPayMchID,
			setting.WeChatPayMchCertificateSerialNumber,
			privateKey,
			setting.WeChatPayAPIv3Key,
		),
	}

	client, err := core.NewClient(ctx, opts...)
	if err != nil {
		return nil, fmt.Errorf("初始化微信支付客户端失败: %w", err)
	}

	wechatPayClient = client
	return wechatPayClient, nil
}

func getWeChatPayMoney(amount float64, group string) float64 {
	if operation_setting.GetQuotaDisplayType() == operation_setting.QuotaDisplayTypeTokens {
		amount = amount / common.QuotaPerUnit
	}
	topupGroupRatio := common.GetTopupGroupRatio(group)
	if topupGroupRatio == 0 {
		topupGroupRatio = 1
	}
	discount := 1.0
	if ds, ok := operation_setting.GetPaymentSetting().AmountDiscount[int(amount)]; ok {
		if ds > 0 {
			discount = ds
		}
	}
	return amount * setting.WeChatPayUnitPrice * topupGroupRatio * discount
}

type WeChatPayRequest struct {
	Amount int64 `json:"amount"`
}

func RequestWeChatPayAmount(c *gin.Context) {
	var req WeChatPayRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "参数错误"})
		return
	}

	minTopup := int64(setting.WeChatPayMinTopUp)
	if req.Amount < minTopup {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": fmt.Sprintf("充值数量不能小于 %d", minTopup)})
		return
	}

	id := c.GetInt("id")
	group, err := model.GetUserGroup(id, true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "获取用户分组失败"})
		return
	}

	payMoney := getWeChatPayMoney(float64(req.Amount), group)
	if payMoney <= 0.01 {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "充值金额过低"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "success", "data": fmt.Sprintf("%.2f", payMoney)})
}

func RequestWeChatPay(c *gin.Context) {
	if !setting.WeChatPayEnabled {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "微信支付未启用"})
		return
	}

	var req WeChatPayRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "参数错误"})
		return
	}

	minTopup := int64(setting.WeChatPayMinTopUp)
	if req.Amount < minTopup {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": fmt.Sprintf("充值数量不能小于 %d", minTopup)})
		return
	}

	id := c.GetInt("id")
	_, err := model.GetUserById(id, false)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "用户不存在"})
		return
	}

	group, _ := model.GetUserGroup(id, true)
	payMoney := getWeChatPayMoney(float64(req.Amount), group)
	if payMoney < 0.01 {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "充值金额过低"})
		return
	}

	merchantOrderId := fmt.Sprintf("WXPAY-%d-%d-%s", id, time.Now().UnixMilli(), randstr.String(6))

	amount := req.Amount
	if operation_setting.GetQuotaDisplayType() == operation_setting.QuotaDisplayTypeTokens {
		amount = int64(decimal.NewFromInt(req.Amount).Div(decimal.NewFromFloat(common.QuotaPerUnit)).IntPart())
		if amount < 1 {
			amount = 1
		}
	}

	topUp := &model.TopUp{
		UserId:        id,
		Amount:        amount,
		Money:         payMoney,
		TradeNo:       merchantOrderId,
		PaymentMethod: model.PaymentMethodWeChatPay,
		CreateTime:    time.Now().Unix(),
		Status:        common.TopUpStatusPending,
	}
	if err := topUp.Insert(); err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("微信支付创建充值订单失败 user_id=%d trade_no=%s amount=%d error=%q", id, merchantOrderId, req.Amount, err.Error()))
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "创建订单失败"})
		return
	}

	client, err := getWeChatPayClient()
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("微信支付客户端初始化失败 user_id=%d trade_no=%s error=%q", id, merchantOrderId, err.Error()))
		topUp.Status = common.TopUpStatusFailed
		_ = topUp.Update()
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "支付配置错误"})
		return
	}

	callbackAddr := service.GetCallbackAddress()
	notifyUrl := callbackAddr + "/api/wechatpay/webhook"
	if setting.WeChatPayNotifyUrl != "" {
		notifyUrl = setting.WeChatPayNotifyUrl
	}

	totalCents := int64(payMoney * 100)
	if totalCents < 1 {
		totalCents = 1
	}

	svc := native.NativeApiService{Client: client}
	resp, _, err := svc.Prepay(c.Request.Context(),
		native.PrepayRequest{
			Appid:       core.String(setting.WeChatPayAppID),
			Mchid:       core.String(setting.WeChatPayMchID),
			Description: core.String(fmt.Sprintf("充值 %d 额度", amount)),
			OutTradeNo:  core.String(merchantOrderId),
			NotifyUrl:   core.String(notifyUrl),
			Amount: &native.Amount{
				Total:    core.Int64(totalCents),
				Currency: core.String("CNY"),
			},
		},
	)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("微信支付创建预付订单失败 user_id=%d trade_no=%s error=%q", id, merchantOrderId, err.Error()))
		topUp.Status = common.TopUpStatusFailed
		_ = topUp.Update()
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "拉起支付失败"})
		return
	}

	codeUrl := ""
	if resp.CodeUrl != nil {
		codeUrl = *resp.CodeUrl
	}

	logger.LogInfo(c.Request.Context(), fmt.Sprintf("微信支付充值订单创建成功 user_id=%d trade_no=%s amount=%d money=%.2f", id, merchantOrderId, req.Amount, payMoney))

	c.JSON(http.StatusOK, gin.H{
		"message": "success",
		"data": gin.H{
			"code_url": codeUrl,
			"order_id": merchantOrderId,
		},
	})
}

func WeChatPayWebhook(c *gin.Context) {
	if !setting.WeChatPayEnabled {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("微信支付webhook读取请求体失败 client_ip=%s error=%q", c.ClientIP(), err.Error()))
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	c.Request.Body = io.NopCloser(bytes.NewReader(bodyBytes))

	privateKey, err := utils.LoadPrivateKeyWithPath(setting.WeChatPayPrivateKeyPath)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("微信支付webhook加载私钥失败 client_ip=%s error=%q", c.ClientIP(), err.Error()))
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	ctx := context.Background()
	mgr := downloader.MgrInstance()
	if !mgr.HasDownloader(ctx, setting.WeChatPayMchID) {
		err = mgr.RegisterDownloaderWithPrivateKey(ctx, privateKey, setting.WeChatPayMchCertificateSerialNumber, setting.WeChatPayMchID, setting.WeChatPayAPIv3Key)
		if err != nil {
			logger.LogError(c.Request.Context(), fmt.Sprintf("微信支付webhook注册证书下载器失败 client_ip=%s error=%q", c.ClientIP(), err.Error()))
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
	}
	certVisitor := mgr.GetCertificateVisitor(setting.WeChatPayMchID)
	verifier := verifiers.NewSHA256WithRSAVerifier(certVisitor)

	handler, err := notify.NewRSANotifyHandler(setting.WeChatPayAPIv3Key, verifier)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("微信支付webhook初始化通知处理器失败 client_ip=%s error=%q", c.ClientIP(), err.Error()))
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	transaction := new(payments.Transaction)
	notifyReq, err := handler.ParseNotifyRequest(context.Background(), c.Request, transaction)
	if err != nil {
		logger.LogWarn(c.Request.Context(), fmt.Sprintf("微信支付webhook验签失败 client_ip=%s error=%q", c.ClientIP(), err.Error()))
		c.JSON(http.StatusUnauthorized, gin.H{"code": "FAIL", "message": "验签未通过"})
		return
	}

	if notifyReq.EventType == "TRANSACTION.SUCCESS" && transaction.OutTradeNo != nil {
		tradeNo := *transaction.OutTradeNo

		LockOrder(tradeNo)
		defer UnlockOrder(tradeNo)

		if err := model.RechargeWeChatPay(tradeNo, c.ClientIP()); err != nil {
			logger.LogError(c.Request.Context(), fmt.Sprintf("微信支付充值处理失败 trade_no=%s client_ip=%s error=%q", tradeNo, c.ClientIP(), err.Error()))
			c.JSON(http.StatusInternalServerError, gin.H{"code": "FAIL", "message": err.Error()})
			return
		}
		logger.LogInfo(c.Request.Context(), fmt.Sprintf("微信支付充值成功 trade_no=%s client_ip=%s", tradeNo, c.ClientIP()))
	} else if notifyReq.EventType == "TRANSACTION.CLOSED" && transaction.OutTradeNo != nil {
		tradeNo := *transaction.OutTradeNo
		if err := model.UpdatePendingTopUpStatus(tradeNo, model.PaymentMethodWeChatPay, common.TopUpStatusFailed); err != nil &&
			!errors.Is(err, model.ErrTopUpNotFound) &&
			!errors.Is(err, model.ErrTopUpStatusInvalid) {
			logger.LogError(c.Request.Context(), fmt.Sprintf("微信支付标记失败订单状态失败 trade_no=%s error=%q", tradeNo, err.Error()))
		}
	}

	c.Status(http.StatusNoContent)
}
