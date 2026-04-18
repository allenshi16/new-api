package monitor

import (
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
)

func ShouldDisableChannel(err *dto.OpenAIErrorWithStatusCode, statusCode int) bool {
	if !common.AutomaticDisableChannelEnabled {
		return false
	}
	if err == nil {
		return false
	}
	if statusCode == http.StatusUnauthorized {
		return true
	}
	switch err.Error.Type {
	case "insufficient_quota", "authentication_error", "permission_error", "forbidden":
		return true
	}
	if err.Error.Code == "invalid_api_key" || err.Error.Code == "account_deactivated" {
		return true
	}

	lowerMessage := strings.ToLower(err.Error.Message)
	if strings.Contains(lowerMessage, "your access was terminated") ||
		strings.Contains(lowerMessage, "violation of our policies") ||
		strings.Contains(lowerMessage, "your credit balance is too low") ||
		strings.Contains(lowerMessage, "organization has been disabled") ||
		strings.Contains(lowerMessage, "credit") ||
		strings.Contains(lowerMessage, "balance") ||
		strings.Contains(lowerMessage, "permission denied") ||
		strings.Contains(lowerMessage, "organization has been restricted") ||
		strings.Contains(lowerMessage, "api key not valid") ||
		strings.Contains(lowerMessage, "api key expired") ||
		strings.Contains(lowerMessage, "已欠费") {
		return true
	}
	return false
}

func ShouldEnableChannel(err error, openAIErr *dto.OpenAIErrorWithStatusCode) bool {
	if !common.AutomaticEnableChannelEnabled {
		return false
	}
	if err != nil {
		return false
	}
	if openAIErr != nil {
		return false
	}
	return true
}
