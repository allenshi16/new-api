package monitor

import (
	"github.com/QuantumNous/new-api/common"
)

var store = make(map[int][]bool)
var metricSuccessChan = make(chan int, common.MetricSuccessChanSize)
var metricFailChan = make(chan int, common.MetricFailChanSize)

func consumeSuccess(channelId int) {
	if len(store[channelId]) > common.MetricQueueSize {
		store[channelId] = store[channelId][1:]
	}
	store[channelId] = append(store[channelId], true)
}

func consumeFail(channelId int) (bool, float64) {
	if len(store[channelId]) > common.MetricQueueSize {
		store[channelId] = store[channelId][1:]
	}
	store[channelId] = append(store[channelId], false)
	successCount := 0
	for _, success := range store[channelId] {
		if success {
			successCount++
		}
	}
	successRate := float64(successCount) / float64(len(store[channelId]))
	if len(store[channelId]) < common.MetricQueueSize {
		return false, successRate
	}
	if successRate < common.MetricSuccessRateThreshold {
		store[channelId] = make([]bool, 0)
		return true, successRate
	}
	return false, successRate
}

func metricSuccessConsumer() {
	for {
		select {
		case channelId := <-metricSuccessChan:
			consumeSuccess(channelId)
		}
	}
}

func metricFailConsumer() {
	for {
		select {
		case channelId := <-metricFailChan:
			disable, successRate := consumeFail(channelId)
			if disable {
				go MetricDisableChannel(channelId, successRate)
			}
		}
	}
}

func InitMetricMonitor() {
	if common.EnableMetric {
		go metricSuccessConsumer()
		go metricFailConsumer()
	}
}

func Emit(channelId int, success bool) {
	if !common.EnableMetric {
		return
	}
	go func() {
		if success {
			metricSuccessChan <- channelId
		} else {
			metricFailChan <- channelId
		}
	}()
}
