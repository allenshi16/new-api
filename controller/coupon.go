package controller

import (
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

func GetAllCoupons(c *gin.Context) {
	coupons, err := model.GetAllCoupons()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取优惠券失败: " + err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    coupons,
	})
}

func GetEnabledCoupons(c *gin.Context) {
	coupons, err := model.GetEnabledCoupons()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取可用优惠券失败: " + err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    coupons,
	})
}

func GetCoupon(c *gin.Context) {
	code := c.Param("code")
	if code == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "优惠券代码不能为空",
		})
		return
	}

	coupon, err := model.GetCouponByCode(code)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "优惠券不存在",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    coupon,
	})
}

func CreateCoupon(c *gin.Context) {
	var coupon model.Coupon
	if err := c.ShouldBindJSON(&coupon); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	if coupon.Code == "" || coupon.Name == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "优惠券代码和名称不能为空",
		})
		return
	}

	err := coupon.Insert()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "创建优惠券失败: " + err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "创建成功",
		"data":    coupon,
	})
}

func UpdateCoupon(c *gin.Context) {
	id := c.Param("id")
	idInt, _ := strconv.Atoi(id)

	var coupon model.Coupon
	if err := c.ShouldBindJSON(&coupon); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	coupon.Id = idInt
	err := coupon.Update()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "更新优惠券失败: " + err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "更新成功",
	})
}

func DeleteCoupon(c *gin.Context) {
	id := c.Param("id")
	idInt, _ := strconv.Atoi(id)

	coupon, err := model.GetCouponById(idInt)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "优惠券不存在",
		})
		return
	}

	err = coupon.Delete()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "删除优惠券失败: " + err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "删除成功",
	})
}

func UseCoupon(c *gin.Context) {
	var req struct {
		Code   string `json:"code"`
		Amount int64  `json:"amount"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	userId := c.GetInt("id")
	discount, err := model.UseCoupon(req.Code, userId, req.Amount)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "使用成功",
		"data": gin.H{
			"discount": discount,
		},
	})
}

func GetUserCoupons(c *gin.Context) {
	userId := c.GetInt("id")
	coupons, err := model.GetUserCoupons(userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取用户优惠券失败: " + err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    coupons,
	})
}
