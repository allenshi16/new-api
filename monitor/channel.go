package monitor

import (
	"fmt"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
)

func DisableChannel(channelId int, channelName string, reason string) {
	model.UpdateChannelStatusById(channelId, common.ChannelStatusAutoDisabled)
	common.SysLog(fmt.Sprintf("channel #%d has been disabled: %s", channelId, reason))

	rootUserEmail := model.GetRootUserEmail()
	if rootUserEmail != "" {
		subject := "渠道状态变更提醒"
		content := common.EmailTemplate(
			subject,
			fmt.Sprintf(`
				<p>您好！</p>
				<p>渠道「<strong>%s</strong>」（#%d）已被禁用。</p>
				<p>禁用原因：</p>
				<p style="background-color: #f8f8f8; padding: 10px; border-radius: 4px;">%s</p>
			`, channelName, channelId, reason),
		)
		err := common.SendEmail(subject, rootUserEmail, content)
		if err != nil {
			common.SysError("failed to send channel disable notification: " + err.Error())
		}
	}
}

func MetricDisableChannel(channelId int, successRate float64) {
	model.UpdateChannelStatusById(channelId, common.ChannelStatusAutoDisabled)
	common.SysLog(fmt.Sprintf("channel #%d has been disabled due to low success rate: %.2f", channelId, successRate*100))

	rootUserEmail := model.GetRootUserEmail()
	if rootUserEmail != "" {
		subject := "渠道状态变更提醒"
		content := common.EmailTemplate(
			subject,
			fmt.Sprintf(`
				<p>您好！</p>
				<p>渠道 #%d 已被系统自动禁用。</p>
				<p>禁用原因：</p>
				<p style="background-color: #f8f8f8; padding: 10px; border-radius: 4px;">该渠道在最近 %d 次调用中成功率为 <strong>%.2f%%</strong>，低于系统阈值 <strong>%.2f%%</strong>。</p>
			`, channelId, common.MetricQueueSize, successRate*100, common.MetricSuccessRateThreshold*100),
		)
		err := common.SendEmail(subject, rootUserEmail, content)
		if err != nil {
			common.SysError("failed to send metric disable notification: " + err.Error())
		}
	}
}

func EnableChannel(channelId int, channelName string) {
	model.UpdateChannelStatusById(channelId, common.ChannelStatusEnabled)
	common.SysLog(fmt.Sprintf("channel #%d has been enabled", channelId))

	rootUserEmail := model.GetRootUserEmail()
	if rootUserEmail != "" {
		subject := "渠道状态变更提醒"
		content := common.EmailTemplate(
			subject,
			fmt.Sprintf(`
				<p>您好！</p>
				<p>渠道「<strong>%s</strong>」（#%d）已被重新启用。</p>
				<p>您现在可以继续使用该渠道了。</p>
			`, channelName, channelId),
		)
		err := common.SendEmail(subject, rootUserEmail, content)
		if err != nil {
			common.SysError("failed to send channel enable notification: " + err.Error())
		}
	}
}
