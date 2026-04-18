package deepl

import (
	"strings"

	"github.com/QuantumNous/new-api/dto"
)

type DeepLRequest struct {
	Text           []string `json:"text"`
	SourceLang     string   `json:"source_lang,omitempty"`
	TargetLang     string   `json:"target_lang"`
	Formality      string   `json:"formality,omitempty"`
	PreserveFormat bool     `json:"preserve_formatting,omitempty"`
}

type DeepLResponse struct {
	Translations []Translation `json:"translations"`
}

type Translation struct {
	DetectedSourceLanguage string `json:"detected_source_language"`
	Text                   string `json:"text"`
}

func ConvertRequest(request *dto.GeneralOpenAIRequest) *DeepLRequest {
	var texts []string
	for _, msg := range request.Messages {
		if msg.Content != nil {
			content := msg.StringContent()
			if content != "" {
				texts = append(texts, content)
			}
		}
	}

	if len(texts) == 0 {
		return nil
	}

	targetLang := "EN"
	if strings.Contains(request.Model, "zh") || strings.Contains(request.Model, "chinese") {
		targetLang = "ZH"
	} else if strings.Contains(request.Model, "ja") || strings.Contains(request.Model, "japanese") {
		targetLang = "JA"
	} else if strings.Contains(request.Model, "de") || strings.Contains(request.Model, "german") {
		targetLang = "DE"
	} else if strings.Contains(request.Model, "fr") || strings.Contains(request.Model, "french") {
		targetLang = "FR"
	} else if strings.Contains(request.Model, "es") || strings.Contains(request.Model, "spanish") {
		targetLang = "ES"
	} else if strings.Contains(request.Model, "it") || strings.Contains(request.Model, "italian") {
		targetLang = "IT"
	} else if strings.Contains(request.Model, "pt") || strings.Contains(request.Model, "portuguese") {
		targetLang = "PT"
	} else if strings.Contains(request.Model, "ru") || strings.Contains(request.Model, "russian") {
		targetLang = "RU"
	}

	return &DeepLRequest{
		Text:       texts,
		TargetLang: targetLang,
	}
}
