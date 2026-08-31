package model

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// SumUsedQuota is the data source shared by the usage-logs page and the
// dashboard stat cards. Quota/count/tokens must cover the full requested
// window with closed bounds (created_at >= start AND created_at <= end),
// independently of the 60-second window used for the live rpm/tpm figures.
func TestSumUsedQuotaReturnsConsistentWindowTotals(t *testing.T) {
	now := time.Now().Unix()
	logs := []Log{
		{Id: 1, Type: LogTypeConsume, Quota: 100, PromptTokens: 10, CompletionTokens: 20, CreatedAt: now - 3600},
		{Id: 2, Type: LogTypeConsume, Quota: 200, PromptTokens: 30, CompletionTokens: 40, CreatedAt: now - 120},
		{Id: 3, Type: LogTypeConsume, Quota: 300, PromptTokens: 50, CompletionTokens: 60, CreatedAt: now}, // boundary, inclusive
		{Id: 4, Type: LogTypeError, Quota: 999, PromptTokens: 90, CompletionTokens: 90, CreatedAt: now-3600},
		{Id: 5, Type: LogTypeConsume, Quota: 1, PromptTokens: 1, CompletionTokens: 1, CreatedAt: now + 1}, // outside end
	}
	require.NoError(t, LOG_DB.Create(&logs).Error)

	stat, err := SumUsedQuota(LogTypeConsume, now-3600, now, "", "", "", 0, "")
	require.NoError(t, err)
	assert.Equal(t, 600, stat.Quota)
	assert.Equal(t, 3, stat.Count)
	assert.Equal(t, 210, stat.Tokens)
	// rpm/tpm only cover the last 60 seconds: id 3 is in window, id 2 is not
	assert.Equal(t, 1, stat.Rpm)
	assert.Equal(t, 110, stat.Tpm)
}