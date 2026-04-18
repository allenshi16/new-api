package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

type DailyStat struct {
	Date       string `json:"date"`
	Revenue    int64  `json:"revenue"`
	OrderCount int64  `json:"order_count"`
}

type ChannelUsageStat struct {
	ChannelId    int   `json:"channel_id"`
	TotalQuota   int64 `json:"total_quota"`
	RequestCount int64 `json:"request_count"`
}

type ModelUsageStat struct {
	ModelName    string `json:"model_name"`
	TotalQuota   int64  `json:"total_quota"`
	RequestCount int64  `json:"request_count"`
}

type TopUserStat struct {
	Id           int    `json:"id"`
	Username     string `json:"username"`
	UsedQuota    int64  `json:"used_quota"`
	RequestCount int    `json:"request_count"`
}

func GetRevenueStats(c *gin.Context) {
	if !model.IsAdmin(c.GetInt("id")) {
		c.JSON(http.StatusOK, gin.H{
			"message": "权限不足",
			"success": false,
		})
		return
	}

	days := c.DefaultQuery("days", "7")
	daysInt, _ := strconv.Atoi(days)
	if daysInt <= 0 {
		daysInt = 7
	}

	startTime := time.Now().AddDate(0, 0, -daysInt).Unix()

	cacheKey := fmt.Sprintf("stats:revenue:%d", daysInt)
	if common.RedisEnabled {
		cached, err := common.RedisGet(cacheKey)
		if err == nil && cached != "" {
			var cachedData gin.H
			if json.Unmarshal([]byte(cached), &cachedData) == nil {
				c.JSON(http.StatusOK, gin.H{
					"message": "",
					"success": true,
					"data":    cachedData,
				})
				return
			}
		}
	}

	var stats []DailyStat
	model.DB.Table("topups").
		Select("DATE(FROM_UNIXTIME(created_time)) as date, SUM(amount) as revenue, COUNT(*) as order_count").
		Where("status = ?", "success").
		Where("created_time >= ?", startTime).
		Group("DATE(FROM_UNIXTIME(created_time))").
		Order("date DESC").
		Find(&stats)

	var result struct {
		Total int64
		Count int64
	}
	model.DB.Model(&model.TopUp{}).
		Where("status = ? AND created_time >= ?", "success", startTime).
		Select("SUM(amount) as total, COUNT(*) as count").
		Scan(&result)

	totalRevenue := result.Total
	totalOrders := result.Count
	avgRevenue := int64(0)
	if daysInt > 0 && totalOrders > 0 {
		avgRevenue = totalRevenue / int64(daysInt)
	}

	data := gin.H{
		"daily_stats":     stats,
		"total_revenue":   totalRevenue,
		"total_orders":    totalOrders,
		"average_revenue": avgRevenue,
	}

	if common.RedisEnabled {
		jsonData, _ := json.Marshal(data)
		common.RedisSet(cacheKey, string(jsonData), 5*time.Minute)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "",
		"success": true,
		"data":    data,
	})
}

func GetUsageStats(c *gin.Context) {
	if !model.IsAdmin(c.GetInt("id")) {
		c.JSON(http.StatusOK, gin.H{
			"message": "权限不足",
			"success": false,
		})
		return
	}

	days := c.DefaultQuery("days", "7")
	daysInt, _ := strconv.Atoi(days)
	if daysInt <= 0 {
		daysInt = 7
	}

	startTime := time.Now().AddDate(0, 0, -daysInt).Unix()

	cacheKey := fmt.Sprintf("stats:usage:%d", daysInt)
	if common.RedisEnabled {
		cached, err := common.RedisGet(cacheKey)
		if err == nil && cached != "" {
			var cachedData gin.H
			if json.Unmarshal([]byte(cached), &cachedData) == nil {
				c.JSON(http.StatusOK, gin.H{
					"message": "",
					"success": true,
					"data":    cachedData,
				})
				return
			}
		}
	}

	var channelStats []ChannelUsageStat
	model.DB.Table("logs").
		Select("channel_id, SUM(quota) as total_quota, COUNT(*) as request_count").
		Where("created_time >= ?", startTime).
		Group("channel_id").
		Order("total_quota DESC").
		Limit(20).
		Find(&channelStats)

	var modelStats []ModelUsageStat
	model.DB.Table("logs").
		Select("model_name, SUM(quota) as total_quota, COUNT(*) as request_count").
		Where("created_time >= ?", startTime).
		Group("model_name").
		Order("total_quota DESC").
		Limit(20).
		Find(&modelStats)

	var result struct {
		Total int64
		Count int64
	}
	model.DB.Table("logs").
		Where("created_time >= ?", startTime).
		Select("SUM(quota) as total, COUNT(*) as count").
		Scan(&result)

	data := gin.H{
		"channel_stats":  channelStats,
		"model_stats":    modelStats,
		"total_quota":    result.Total,
		"total_requests": result.Count,
	}

	if common.RedisEnabled {
		jsonData, _ := json.Marshal(data)
		common.RedisSet(cacheKey, string(jsonData), 5*time.Minute)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "",
		"success": true,
		"data":    data,
	})
}

func GetUserStats(c *gin.Context) {
	if !model.IsAdmin(c.GetInt("id")) {
		c.JSON(http.StatusOK, gin.H{
			"message": "权限不足",
			"success": false,
		})
		return
	}

	cacheKey := "stats:user"
	if common.RedisEnabled {
		cached, err := common.RedisGet(cacheKey)
		if err == nil && cached != "" {
			var cachedData gin.H
			if json.Unmarshal([]byte(cached), &cachedData) == nil {
				c.JSON(http.StatusOK, gin.H{
					"message": "",
					"success": true,
					"data":    cachedData,
				})
				return
			}
		}
	}

	var totalUsers int64
	var activeUsers int64
	var newUsersToday int64

	model.DB.Model(&model.User{}).Count(&totalUsers)
	model.DB.Model(&model.User{}).Where("status = ?", common.UserStatusEnabled).Count(&activeUsers)
	model.DB.Model(&model.User{}).Where("created_time >= ?", time.Now().AddDate(0, 0, -1).Unix()).Count(&newUsersToday)

	var topUsers []TopUserStat
	model.DB.Table("users").
		Select("id, username, used_quota, request_count").
		Where("status = ?", common.UserStatusEnabled).
		Order("used_quota DESC").
		Limit(20).
		Find(&topUsers)

	data := gin.H{
		"total_users":     totalUsers,
		"active_users":    activeUsers,
		"new_users_today": newUsersToday,
		"top_users":       topUsers,
	}

	if common.RedisEnabled {
		jsonData, _ := json.Marshal(data)
		common.RedisSet(cacheKey, string(jsonData), 5*time.Minute)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "",
		"success": true,
		"data":    data,
	})
}

func GetChannelStats(c *gin.Context) {
	if !model.IsAdmin(c.GetInt("id")) {
		c.JSON(http.StatusOK, gin.H{
			"message": "权限不足",
			"success": false,
		})
		return
	}

	channels, err := model.GetAllChannels(0, 0, true, false)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "获取渠道失败",
			"success": false,
		})
		return
	}

	channelStats := make([]map[string]interface{}, 0)
	for _, ch := range channels {
		health, _ := model.GetChannelHealth(ch.Id)
		stat := map[string]interface{}{
			"channel_id":    ch.Id,
			"channel_name":  ch.Name,
			"channel_type":  ch.Type,
			"status":        ch.Status,
			"response_time": ch.ResponseTime,
			"success_rate":  ch.SuccessRate,
			"used_quota":    ch.UsedQuota,
			"max_qps":       ch.MaxQPS,
			"region":        ch.Region,
			"zone":          ch.Zone,
		}
		if health != nil {
			stat["total_requests"] = health.TotalRequests
			stat["success_count"] = health.SuccessCount
			stat["fail_count"] = health.FailCount
			stat["avg_latency"] = health.AvgLatency
			if health.TotalRequests > 0 {
				stat["calculated_success_rate"] = float64(health.SuccessCount) / float64(health.TotalRequests) * 100
			}
		}
		channelStats = append(channelStats, stat)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "",
		"success": true,
		"data":    channelStats,
	})
}
