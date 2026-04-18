package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

var channelRateLimiters = make(map[int]*ChannelRateLimiter)
var channelRateLimitLock sync.RWMutex

type ChannelRateLimiter struct {
	channelId  int
	maxQPS     int
	tokens     int
	lastRefill time.Time
	mutex      sync.Mutex
}

func NewChannelRateLimiter(channelId int, maxQPS int) *ChannelRateLimiter {
	return &ChannelRateLimiter{
		channelId:  channelId,
		maxQPS:     maxQPS,
		tokens:     maxQPS,
		lastRefill: time.Now(),
	}
}

func (rl *ChannelRateLimiter) Allow() bool {
	if rl.maxQPS <= 0 {
		return true
	}

	rl.mutex.Lock()
	defer rl.mutex.Unlock()

	now := time.Now()
	elapsed := now.Sub(rl.lastRefill).Seconds()

	tokensToAdd := int(elapsed * float64(rl.maxQPS))
	if tokensToAdd > 0 {
		rl.tokens += tokensToAdd
		if rl.tokens > rl.maxQPS {
			rl.tokens = rl.maxQPS
		}
		rl.lastRefill = now
	}

	if rl.tokens > 0 {
		rl.tokens--
		return true
	}

	return false
}

func GetChannelRateLimiter(channelId int, maxQPS int) *ChannelRateLimiter {
	channelRateLimitLock.RLock()
	limiter, exists := channelRateLimiters[channelId]
	channelRateLimitLock.RUnlock()

	if exists {
		if limiter.maxQPS != maxQPS {
			channelRateLimitLock.Lock()
			channelRateLimiters[channelId] = NewChannelRateLimiter(channelId, maxQPS)
			limiter = channelRateLimiters[channelId]
			channelRateLimitLock.Unlock()
		}
		return limiter
	}

	channelRateLimitLock.Lock()
	channelRateLimiters[channelId] = NewChannelRateLimiter(channelId, maxQPS)
	limiter = channelRateLimiters[channelId]
	channelRateLimitLock.Unlock()

	return limiter
}

func ChannelRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		channelId := c.GetInt("channel_id")
		if channelId == 0 {
			c.Next()
			return
		}

		channel, err := model.GetChannelById(channelId, true)
		if err != nil || channel == nil {
			c.Next()
			return
		}

		maxQPS := channel.MaxQPS
		if maxQPS <= 0 {
			c.Next()
			return
		}

		limiter := GetChannelRateLimiter(channelId, maxQPS)
		if !limiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": fmt.Sprintf("渠道 #%d 已达到 QPS 限制 (%d QPS)，请稍后再试", channelId, maxQPS),
				"error": gin.H{
					"type":    "rate_limit_error",
					"message": fmt.Sprintf("Channel #%d rate limit exceeded (max QPS: %d)", channelId, maxQPS),
				},
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func CleanupChannelRateLimiters() {
	channelRateLimitLock.Lock()
	for id, limiter := range channelRateLimiters {
		if time.Since(limiter.lastRefill) > time.Hour {
			delete(channelRateLimiters, id)
		}
	}
	channelRateLimitLock.Unlock()
}

func StartChannelRateLimitCleaner(frequency int) {
	common.SysLog(fmt.Sprintf("channel rate limit cleaner started with frequency %d seconds", frequency))
	for {
		time.Sleep(time.Duration(frequency) * time.Second)
		CleanupChannelRateLimiters()
	}
}
