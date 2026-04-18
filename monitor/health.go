package monitor

import (
	"fmt"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
)

var healthCheckRunning bool = false
var healthCheckLock sync.Mutex

func StartChannelHealthMonitor(frequency int) {
	common.SysLog(fmt.Sprintf("channel health monitor started with frequency %d seconds", frequency))
	for {
		time.Sleep(time.Duration(frequency) * time.Second)
		CheckAllChannelHealth()
	}
}

func CheckAllChannelHealth() {
	healthCheckLock.Lock()
	if healthCheckRunning {
		healthCheckLock.Unlock()
		return
	}
	healthCheckRunning = true
	healthCheckLock.Unlock()

	channels, err := model.GetAllChannels(0, 0, true, false)
	if err != nil {
		common.SysError("failed to get channels for health check: " + err.Error())
		healthCheckLock.Lock()
		healthCheckRunning = false
		healthCheckLock.Unlock()
		return
	}

	for _, channel := range channels {
		if channel.Status != common.ChannelStatusEnabled {
			continue
		}

		if channel.TestInterval > 0 {
			health, _ := model.GetChannelHealth(channel.Id)
			if health != nil && time.Now().Unix()-health.LastTestTime < int64(channel.TestInterval) {
				continue
			}
		}

		latency := channel.ResponseTime
		success := latency > 0 && latency < 30000

		if latency == 0 {
			latency = 9999
			success = false
		}

		model.UpdateChannelHealth(channel.Id, success, latency)

		if !success && common.AutomaticDisableChannelEnabled {
			DisableChannel(channel.Id, channel.Name, "健康检测失败")
		}

		time.Sleep(time.Duration(common.RequestInterval) * time.Millisecond)
	}

	healthCheckLock.Lock()
	healthCheckRunning = false
	healthCheckLock.Unlock()

	model.InitChannelHealthCache()
	common.SysLog("channel health check completed")
}

func RecordChannelRequest(channelId int, success bool, latency int) {
	model.UpdateChannelHealth(channelId, success, latency)
}
