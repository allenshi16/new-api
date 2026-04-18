package deepl

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
)

func Handler(c *gin.Context, resp *http.Response, info *relaycommon.RelayInfo) *types.NewAPIError {
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return types.NewError(err, types.ErrorCodeReadResponseBodyFailed)
	}

	var deeplResp DeepLResponse
	err = common.Unmarshal(body, &deeplResp)
	if err != nil {
		return types.NewError(err, types.ErrorCodeBadResponseBody)
	}

	var translatedTexts []string
	for _, t := range deeplResp.Translations {
		translatedTexts = append(translatedTexts, t.Text)
	}

	response := map[string]interface{}{
		"id":      fmt.Sprintf("deepl-%d", common.GetRandomInt(1000000)),
		"object":  "chat.completion",
		"created": common.GetTimestamp(),
		"model":   info.UpstreamModelName,
		"choices": []map[string]interface{}{
			{
				"index": 0,
				"message": map[string]interface{}{
					"role":    "assistant",
					"content": strings.Join(translatedTexts, "\n"),
				},
				"finish_reason": "stop",
			},
		},
		"usage": map[string]interface{}{
			"prompt_tokens":     0,
			"completion_tokens": 0,
			"total_tokens":      0,
		},
	}

	jsonData, err := common.Marshal(response)
	if err != nil {
		return types.NewError(err, types.ErrorCodeJsonMarshalFailed)
	}

	c.Writer.Header().Set("Content-Type", "application/json")
	c.Writer.WriteHeader(http.StatusOK)
	c.Writer.Write(jsonData)

	return nil
}

func handleError(resp *http.Response) *types.NewAPIError {
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return types.NewErrorWithStatusCode(err, types.ErrorCodeReadResponseBodyFailed, resp.StatusCode)
	}

	var errResp map[string]interface{}
	_ = json.Unmarshal(body, &errResp)

	message := "DeepL API error"
	if msg, ok := errResp["message"].(string); ok {
		message = msg
	} else if msg, ok := errResp["error"].(string); ok {
		message = msg
	}

	return types.NewErrorWithStatusCode(
		fmt.Errorf("%s", message),
		types.ErrorCodeBadResponseStatusCode,
		resp.StatusCode,
	)
}
