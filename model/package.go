package model

import (
	"errors"
	"fmt"
	"time"

	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
)

const (
	PackageStatusDisabled = 0
	PackageStatusEnabled  = 1
)

const (
	PackageTypeQuota   = 1 // Token 额度包
	PackageTypeMonthly = 2 // 月卡
	PackageTypeYearly  = 3 // 年卡
)

type Package struct {
	Id          int    `json:"id" gorm:"primaryKey"`
	Name        string `json:"name" gorm:"type:varchar(128)"`
	Description string `json:"description" gorm:"type:text"`
	Type        int    `json:"type" gorm:"type:int;default:1"`     // 1=额度包, 2=月卡, 3=年卡
	Quota       int64  `json:"quota" gorm:"bigint;default:0"`      // Token 额度（单位：quota）
	Price       int64  `json:"price" gorm:"bigint;default:0"`      // 价格（单位：分）
	Duration    int    `json:"duration" gorm:"type:int;default:0"` // 有效期（天），0 表示永久
	Priority    int    `json:"priority" gorm:"type:int;default:0"` // 显示顺序
	Status      int    `json:"status" gorm:"type:int;default:1"`
	CreatedTime int64  `json:"created_time" gorm:"bigint"`
	UpdatedTime int64  `json:"updated_time" gorm:"bigint"`
}

func GetAllPackages(status int) ([]*Package, error) {
	var packages []*Package
	query := DB
	if status > 0 {
		query = query.Where("status = ?", status)
	}
	err := query.Order("priority desc, id asc").Find(&packages).Error
	return packages, err
}

func GetPackageById(id int) (*Package, error) {
	var pkg Package
	err := DB.First(&pkg, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &pkg, nil
}

func GetEnabledPackages() ([]*Package, error) {
	return GetAllPackages(PackageStatusEnabled)
}

func (pkg *Package) Insert() error {
	pkg.CreatedTime = time.Now().Unix()
	pkg.UpdatedTime = pkg.CreatedTime
	return DB.Create(pkg).Error
}

func (pkg *Package) Update() error {
	pkg.UpdatedTime = time.Now().Unix()
	return DB.Model(pkg).Updates(pkg).Error
}

func (pkg *Package) Delete() error {
	return DB.Delete(pkg).Error
}

type UserPackage struct {
	Id          int    `json:"id" gorm:"primaryKey"`
	UserId      int    `json:"user_id" gorm:"type:int;index"`
	PackageId   int    `json:"package_id" gorm:"type:int"`
	PackageName string `json:"package_name" gorm:"type:varchar(128)"`
	Quota       int64  `json:"quota" gorm:"bigint"`       // 剩余额度
	TotalQuota  int64  `json:"total_quota" gorm:"bigint"` // 获得的总额度
	ExpireTime  int64  `json:"expire_time" gorm:"bigint"` // 到期时间
	CreatedTime int64  `json:"created_time" gorm:"bigint"`
	UpdatedTime int64  `json:"updated_time" gorm:"bigint"`
}

func (up *UserPackage) Insert() error {
	up.CreatedTime = time.Now().Unix()
	up.UpdatedTime = up.CreatedTime
	return DB.Create(up).Error
}

func GetUserActivePackage(userId int) (*UserPackage, error) {
	var up UserPackage
	err := DB.Where("user_id = ? AND expire_time > ?", userId, time.Now().Unix()).Order("expire_time desc").First(&up).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &up, err
}

func GetUserPackages(userId int) ([]*UserPackage, error) {
	var ups []*UserPackage
	err := DB.Where("user_id = ?", userId).Order("id desc").Find(&ups).Error
	return ups, err
}

func ConsumeUserPackageQuota(userId int, quota int64) error {
	return DB.Model(&UserPackage{}).Where("user_id = ? AND quota >= ? AND expire_time > ?", userId, quota, time.Now().Unix()).
		Update("quota", gorm.Expr("quota - ?", quota)).Error
}

func PurchasePackage(userId int, packageId int) (*UserPackage, error) {
	pkg, err := GetPackageById(packageId)
	if err != nil {
		return nil, err
	}

	if pkg.Status != PackageStatusEnabled {
		return nil, errors.New("套餐已禁用")
	}

	up := &UserPackage{
		UserId:      userId,
		PackageId:   packageId,
		PackageName: pkg.Name,
		Quota:       pkg.Quota,
		TotalQuota:  pkg.Quota,
	}

	if pkg.Duration > 0 {
		up.ExpireTime = time.Now().AddDate(0, 0, pkg.Duration).Unix()
	} else {
		up.ExpireTime = time.Now().AddDate(10, 0, 0).Unix() // 永久套餐设置为10年
	}

	err = up.Insert()
	if err != nil {
		return nil, err
	}

	IncreaseUserQuota(userId, int(pkg.Quota), false)

	return up, nil
}

func GenerateOrderNo() string {
	return fmt.Sprintf("%d%d%s", time.Now().Unix(), time.Now().Nanosecond(), common.GetRandomString(4))
}
