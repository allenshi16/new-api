package model

import (
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type RefundRequest struct {
	Id            int    `json:"id" gorm:"primaryKey"`
	UserId        int    `json:"user_id" gorm:"type:int;index"`
	TopUpId       int    `json:"topup_id" gorm:"type:int;index"`
	OrderNo       string `json:"order_no" gorm:"type:varchar(64)"`
	Amount        int64  `json:"amount" gorm:"bigint"`
	Reason        string `json:"reason" gorm:"type:text"`
	Status        int    `json:"status" gorm:"type:int;default:0"` // 0=待处理, 1=已退款, 2=已拒绝
	ProcessedBy   int    `json:"processed_by" gorm:"type:int"`
	ProcessedTime int64  `json:"processed_time" gorm:"bigint"`
	CreatedTime   int64  `json:"created_time" gorm:"bigint"`
	UpdatedTime   int64  `json:"updated_time" gorm:"bigint"`
}

const (
	RefundStatusPending   = 0
	RefundStatusCompleted = 1
	RefundStatusRejected  = 2
)

func GetAllRefundRequests(startIdx int, num int) ([]*RefundRequest, error) {
	var requests []*RefundRequest
	err := DB.Order("id desc").Limit(num).Offset(startIdx).Find(&requests).Error
	return requests, err
}

func GetRefundRequestById(id int) (*RefundRequest, error) {
	var req RefundRequest
	err := DB.First(&req, "id = ?", id).Error
	return &req, err
}

func GetUserRefundRequests(userId int) ([]*RefundRequest, error) {
	var requests []*RefundRequest
	err := DB.Where("user_id = ?", userId).Order("id desc").Find(&requests).Error
	return requests, err
}

func (r *RefundRequest) Insert() error {
	r.CreatedTime = time.Now().Unix()
	r.UpdatedTime = r.CreatedTime
	return DB.Create(r).Error
}

func (r *RefundRequest) Update() error {
	r.UpdatedTime = time.Now().Unix()
	return DB.Model(r).Updates(r).Error
}

func CreateRefundRequest(userId int, topUpId int, reason string) (*RefundRequest, error) {
	topUp := GetTopUpById(topUpId)
	if topUp == nil {
		return nil, errors.New("订单不存在")
	}

	if topUp.UserId != userId {
		return nil, errors.New("无权操作此订单")
	}

	if topUp.Status != "success" {
		return nil, errors.New("只能对已支付的订单申请退款")
	}

	var existingReq RefundRequest
	err := DB.Where("topup_id = ? AND status = ?", topUpId, RefundStatusPending).First(&existingReq).Error
	if err == nil {
		return nil, errors.New("已有待处理的退款申请")
	}

	req := &RefundRequest{
		UserId:  userId,
		TopUpId: topUpId,
		OrderNo: topUp.TradeNo,
		Amount:  topUp.Amount,
		Reason:  reason,
		Status:  RefundStatusPending,
	}

	err = req.Insert()
	return req, err
}

func ProcessRefund(refundId int, adminId int, approve bool) error {
	req, err := GetRefundRequestById(refundId)
	if err != nil {
		return errors.New("退款申请不存在")
	}

	if req.Status != RefundStatusPending {
		return errors.New("退款申请已处理")
	}

	return DB.Transaction(func(tx *gorm.DB) error {
		if approve {
			topUp := GetTopUpById(req.TopUpId)
			if topUp == nil {
				return errors.New("订单不存在")
			}

			err := tx.Model(&TopUp{}).Where("id = ?", req.TopUpId).Update("status", "refunded").Error
			if err != nil {
				return err
			}

			req.Status = RefundStatusCompleted
			RecordLog(req.UserId, LogTypeSystem, fmt.Sprintf("订单 %s 退款成功，金额 %.2f", req.OrderNo, topUp.Money))
		} else {
			req.Status = RefundStatusRejected
		}

		req.ProcessedBy = adminId
		req.ProcessedTime = time.Now().Unix()
		return tx.Save(req).Error
	})
}
