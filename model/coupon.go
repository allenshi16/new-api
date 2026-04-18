package model

import (
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

const (
	CouponStatusEnabled  = 1
	CouponStatusDisabled = 2
	CouponStatusUsed     = 3
)

const (
	CouponTypePercent = 1 // 折扣券（百分比）
	CouponTypeFixed   = 2 // 满减券（固定金额）
)

type Coupon struct {
	Id          int     `json:"id" gorm:"primaryKey"`
	Code        string  `json:"code" gorm:"type:varchar(32);uniqueIndex"`
	Name        string  `json:"name" gorm:"type:varchar(128)"`
	Type        int     `json:"type" gorm:"type:int;default:1"`       // 1=折扣, 2=满减
	Discount    float64 `json:"discount" gorm:"default:0"`            // 折扣比例（如0.9表示9折）或减免金额（分）
	MinAmount   int64   `json:"min_amount" gorm:"bigint;default:0"`   // 最低消费金额（分）
	MaxDiscount int64   `json:"max_discount" gorm:"bigint;default:0"` // 最大减免金额（分）
	Quota       int     `json:"quota" gorm:"type:int;default:1"`      // 可用次数
	UsedCount   int     `json:"used_count" gorm:"type:int;default:0"` // 已使用次数
	StartTime   int64   `json:"start_time" gorm:"bigint"`             // 开始时间
	EndTime     int64   `json:"end_time" gorm:"bigint"`               // 结束时间
	Status      int     `json:"status" gorm:"type:int;default:1"`
	CreatedTime int64   `json:"created_time" gorm:"bigint"`
	UpdatedTime int64   `json:"updated_time" gorm:"bigint"`
	Description string  `json:"description" gorm:"type:text"`
}

func GetAllCoupons() ([]*Coupon, error) {
	var coupons []*Coupon
	err := DB.Order("id desc").Find(&coupons).Error
	return coupons, err
}

func GetEnabledCoupons() ([]*Coupon, error) {
	var coupons []*Coupon
	now := time.Now().Unix()
	err := DB.Where("status = ? AND start_time <= ? AND end_time >= ? AND quota > used_count", CouponStatusEnabled, now, now).Find(&coupons).Error
	return coupons, err
}

func GetCouponByCode(code string) (*Coupon, error) {
	var coupon Coupon
	err := DB.Where("code = ?", code).First(&coupon).Error
	return &coupon, err
}

func GetCouponById(id int) (*Coupon, error) {
	var coupon Coupon
	err := DB.First(&coupon, "id = ?", id).Error
	return &coupon, err
}

func (c *Coupon) Insert() error {
	c.CreatedTime = time.Now().Unix()
	c.UpdatedTime = c.CreatedTime
	return DB.Create(c).Error
}

func (c *Coupon) Update() error {
	c.UpdatedTime = time.Now().Unix()
	return DB.Model(c).Updates(c).Error
}

func (c *Coupon) Delete() error {
	return DB.Delete(c).Error
}

func (c *Coupon) CalculateDiscount(amount int64) int64 {
	if c.Type == CouponTypePercent {
		discount := float64(amount) * (1 - c.Discount)
		if c.MaxDiscount > 0 && int64(discount) > c.MaxDiscount {
			return c.MaxDiscount
		}
		return int64(discount)
	} else if c.Type == CouponTypeFixed {
		return int64(c.Discount)
	}
	return 0
}

func (c *Coupon) IsValid() bool {
	now := time.Now().Unix()
	return c.Status == CouponStatusEnabled &&
		c.StartTime <= now &&
		c.EndTime >= now &&
		c.Quota > c.UsedCount
}

func UseCoupon(code string, userId int, amount int64) (int64, error) {
	if code == "" {
		return 0, errors.New("优惠券代码不能为空")
	}

	err := DB.Transaction(func(tx *gorm.DB) error {
		var coupon Coupon
		err := tx.Where("code = ?", code).First(&coupon).Error
		if err != nil {
			return errors.New("优惠券不存在")
		}

		if !coupon.IsValid() {
			return errors.New("优惠券已失效或已用完")
		}

		if amount < coupon.MinAmount {
			return fmt.Errorf("订单金额需满 %d 分才能使用此优惠券", coupon.MinAmount)
		}

		coupon.UsedCount++
		err = tx.Save(&coupon).Error
		if err != nil {
			return err
		}

		RecordLog(userId, LogTypeSystem, fmt.Sprintf("使用优惠券「%s」", coupon.Name))
		return nil
	})

	if err != nil {
		return 0, err
	}

	coupon, _ := GetCouponByCode(code)
	return coupon.CalculateDiscount(amount), nil
}

type UserCoupon struct {
	Id          int    `json:"id" gorm:"primaryKey"`
	UserId      int    `json:"user_id" gorm:"type:int;index"`
	CouponId    int    `json:"coupon_id" gorm:"type:int"`
	CouponCode  string `json:"coupon_code" gorm:"type:varchar(32)"`
	CouponName  string `json:"coupon_name" gorm:"type:varchar(128)"`
	Status      int    `json:"status" gorm:"type:int;default:1"` // 1=未使用, 2=已使用
	UsedTime    int64  `json:"used_time" gorm:"bigint"`
	CreatedTime int64  `json:"created_time" gorm:"bigint"`
}

func GetUserCoupons(userId int) ([]*UserCoupon, error) {
	var coupons []*UserCoupon
	err := DB.Where("user_id = ? AND status = ?", userId, CouponStatusEnabled).Find(&coupons).Error
	return coupons, err
}

func (uc *UserCoupon) Insert() error {
	uc.CreatedTime = time.Now().Unix()
	return DB.Create(uc).Error
}

func GrantCouponToUser(userId int, couponId int) error {
	coupon, err := GetCouponById(couponId)
	if err != nil {
		return err
	}

	userCoupon := &UserCoupon{
		UserId:     userId,
		CouponId:   couponId,
		CouponCode: coupon.Code,
		CouponName: coupon.Name,
		Status:     CouponStatusEnabled,
	}
	return userCoupon.Insert()
}
