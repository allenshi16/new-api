package controller

import (
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

func GetChannelHealth(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "missing channel id",
		})
		return
	}

	channelId, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "invalid channel id",
		})
		return
	}

	health, err := model.GetChannelHealth(channelId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "failed to get channel health: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    health,
	})
}

func GetAllChannelHealth(c *gin.Context) {
	channels, err := model.GetAllChannels(0, 0, true, false)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "failed to get channels: " + err.Error(),
		})
		return
	}

	healthData := make([]map[string]interface{}, 0)
	for _, ch := range channels {
		health, _ := model.GetChannelHealth(ch.Id)
		data := map[string]interface{}{
			"channel_id":   ch.Id,
			"channel_name": ch.Name,
			"status":       ch.Status,
		}
		if health != nil {
			data["total_requests"] = health.TotalRequests
			data["success_count"] = health.SuccessCount
			data["fail_count"] = health.FailCount
			data["avg_latency"] = health.AvgLatency
			data["success_rate"] = float64(health.SuccessCount) / float64(health.TotalRequests) * 100
			data["last_test_time"] = health.LastTestTime
		} else {
			data["total_requests"] = 0
			data["success_count"] = 0
			data["fail_count"] = 0
			data["avg_latency"] = 0
			data["success_rate"] = 0
			data["last_test_time"] = 0
		}
		healthData = append(healthData, data)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    healthData,
	})
}
