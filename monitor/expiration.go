package monitor

import (
	"fmt"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
)

func StartExpirationMonitor(frequency int) {
	common.SysLog(fmt.Sprintf("expiration monitor started with frequency %d seconds", frequency))
	for {
		time.Sleep(time.Duration(frequency) * time.Second)
		CheckExpiringUsers()
		CheckLowQuotaUsers()
	}
}

func CheckExpiringUsers() {
	now := time.Now().Unix()
	threeDaysLater := now + 3*24*60*60

	var users []*model.User
	model.DB.Where("expire_time > ? AND expire_time <= ? AND status = ?", now, threeDaysLater, common.UserStatusEnabled).
		Find(&users)

	for _, user := range users {
		daysLeft := int((user.ExpireTime - now) / (24 * 60 * 60))
		if daysLeft <= 0 {
			continue
		}

		subject := "会员即将到期提醒"
		content := fmt.Sprintf("您的会员将在 %d 天后到期，请及时续费以免影响使用。", daysLeft)

		if user.Email != "" {
			err := common.SendEmail(subject, user.Email, content)
			if err != nil {
				common.SysError(fmt.Sprintf("failed to send expiration notification to user %d: %s", user.Id, err.Error()))
			} else {
				common.SysLog(fmt.Sprintf("sent expiration notification to user %d", user.Id))
			}
		}
	}

	if len(users) > 0 {
		common.SysLog(fmt.Sprintf("checked %d expiring users", len(users)))
	}
}

func CheckLowQuotaUsers() {
	quotaThreshold := common.QuotaForNewUser * 10
	if quotaThreshold <= 0 {
		quotaThreshold = 10000000000
	}

	var users []*model.User
	model.DB.Where("quota < ? AND quota > 0 AND status = ?", quotaThreshold, common.UserStatusEnabled).
		Find(&users)

	for _, user := range users {
		quotaPercent := float64(user.Quota) / float64(quotaThreshold) * 100

		subject := "额度不足预警"
		content := fmt.Sprintf("您的当前额度已低于预警阈值（%.1f%%），请及时充值以免影响使用。", quotaPercent)

		if user.Email != "" {
			err := common.SendEmail(subject, user.Email, content)
			if err != nil {
				common.SysError(fmt.Sprintf("failed to send quota warning to user %d: %s", user.Id, err.Error()))
			} else {
				common.SysLog(fmt.Sprintf("sent quota warning to user %d", user.Id))
			}
		}
	}

	if len(users) > 0 {
		common.SysLog(fmt.Sprintf("checked %d low quota users", len(users)))
	}
}
