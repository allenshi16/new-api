package model

import (
	"fmt"
	"time"

	"github.com/QuantumNous/new-api/common"
)

const (
	DefaultTopUpExpireSeconds = 1800 // 30分钟
)

func CancelExpiredTopUps() (int64, error) {
	result := DB.Model(&TopUp{}).
		Where("status = ? AND create_time < ?", "pending", time.Now().Unix()-DefaultTopUpExpireSeconds).
		Update("status", "expired")
	if result.Error != nil {
		common.SysError("cancel expired topups failed: " + result.Error.Error())
		return 0, result.Error
	}
	if result.RowsAffected > 0 {
		common.SysLog(fmt.Sprintf("cancelled %d expired topup orders", result.RowsAffected))
	}
	return result.RowsAffected, nil
}

func StartTopUpCleaner(frequency int) {
	common.SysLog(fmt.Sprintf("topup cleaner started with frequency %d seconds", frequency))
	for {
		time.Sleep(time.Duration(frequency) * time.Second)
		CancelExpiredTopUps()
	}
}

func GetPendingTopUpByTradeNo(tradeNo string) (*TopUp, error) {
	var topUp TopUp
	err := DB.Where("trade_no = ? AND status = ?", tradeNo, "pending").First(&topUp).Error
	if err != nil {
		return nil, err
	}
	return &topUp, nil
}
