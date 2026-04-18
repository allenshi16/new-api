package controller

import (
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

func GetAllRefunds(c *gin.Context) {
	startStr := c.DefaultQuery("start", "0")
	numStr := c.DefaultQuery("num", "10")

	start, _ := strconv.Atoi(startStr)
	num, _ := strconv.Atoi(numStr)

	requests, err := model.GetAllRefundRequests(start, num)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取退款申请失败: " + err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    requests,
	})
}

func GetUserRefunds(c *gin.Context) {
	userId := c.GetInt("id")
	requests, err := model.GetUserRefundRequests(userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取用户退款申请失败: " + err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    requests,
	})
}

func CreateRefund(c *gin.Context) {
	userId := c.GetInt("id")
	var req struct {
		TopUpId int    `json:"topup_id"`
		Reason  string `json:"reason"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	refund, err := model.CreateRefundRequest(userId, req.TopUpId, req.Reason)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "申请成功",
		"data":    refund,
	})
}

func ProcessRefund(c *gin.Context) {
	adminId := c.GetInt("id")
	id := c.Param("id")
	idInt, _ := strconv.Atoi(id)

	var req struct {
		Approve bool `json:"approve"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	err := model.ProcessRefund(idInt, adminId, req.Approve)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "处理成功",
	})
}
