# 七牛上游「上新」模型本地化上线文档

> 生成日期：2026-08-31
>
> 数据来源：七牛 AI 大模型广场 `https://www.qiniu.com/ai/models`
> 完整模型数据接口：`https://web-api.qiniu.com/api/proxy/ai-inference/inapi/v2/models?order=asc&sort=rank`

## 概述

将七牛 AI 推理平台上标记为「上新」的模型，按上游刊例价格在本地下线。共 **6 个**新模型（Kimi-K3 本地原有，不计入）。计费换算规则：

- 本地 `ModelRatio` → 元/M：`元/M = ModelRatio × 13.6`
- tiered 表达式系数（USD/1M）→ 元/M：`元/M = 系数 × 6.8`
- 上游价格单位：`元/K tokens`，`元/M = 元/K × 1000`

## 已上线模型清单

| # | 上游模型 | 本地模型 ID | 计费方式 |
|---|---|---|---|
| 1 | Qwen3.8 Flash | `qwen/qwen3.8-flash-next` | tiered_expr |
| 2 | Hy4 Preview | `tencent/hy4-preview` | ModelRatio |
| 3 | DeepSeek-V4-Pro-0813 | `deepseek/deepseek-v4-pro-0813` | tiered_expr（高峰/空闲） |
| 4 | GLM-5.3 | `z-ai/glm-5.3` | ModelRatio |
| 5 | DeepSeek-V4-Flash-Vision-Exp | `deepseek/deepseek-v4-flash-vision-exp` | tiered_expr（高峰/空闲） |
| 6 | GLM-5.3-Flash | `z-ai/glm-5.3-flash` | ModelRatio |

---

## 1. Qwen3.8 Flash

- **本地模型 ID**：`qwen/qwen3.8-flash-next`
- **别名**：`qwen3.8-flash-next`、`qwen3.8-flash`、`qwen/qwen3.8-flash`
- **计费方式**：`tiered_expr`

| 计费项 | 上游 元/M | 本地 元/M |
|---|---|---|
| 非缓存输入 | 1.0000 | 1.0000 |
| 输出 | 3.0000 | 3.0000 |
| 缓存输入 | 0.1000 | 0.1000 |
| 显式缓存输入 | 0.1000 | （并入 cr 0.1） |
| 缓存创建 | 1.2500 | 1.2500（cc） |

表达式：

```
tier("base", p * 0.147059 + c * 0.441176 + cr * 0.014706 + cc * 0.183824)
```

> 说明：上游「显式缓存输入」与「缓存输入」同价 0.1 元/M，本地用 `cr` 统一处理；缓存创建价 1.25 元/M 通过 `cc` 变量计入。

## 2. Hy4 Preview

- **本地模型 ID**：`tencent/hy4-preview`
- **计费方式**：`ModelRatio`

| 计费项 | 上游 元/M | 本地 元/M |
|---|---|---|
| 非缓存输入 | 6.0000 | 6.0000 |
| 输出 | 18.0000 | 18.0000 |
| 缓存输入 | 0.3000 | 0.3000 |

## 3. DeepSeek-V4-Pro-0813

- **本地模型 ID**：`deepseek/deepseek-v4-pro-0813`
- **别名**：`deepseek-v4-pro-0813`、`deepseek-v4-pro-20260813`、`deepseek/deepseek-v4-pro-20260813`
- **计费方式**：`tiered_expr`（高峰/空闲）

| 计费项 | 上游 元/M | 本地 元/M |
|---|---|---|
| 非缓存输入·高峰 | 9.0000 | 9.0000 |
| 非缓存输入·空闲 | 4.5000 | 4.5000 |
| 输出·高峰 | 27.0000 | 27.0000 |
| 输出·空闲 | 13.5000 | 13.5000 |
| 缓存·高峰 | 0.3000 | 0.3000 |
| 缓存·空闲 | 0.1500 | 0.1500 |

## 4. GLM-5.3

- **本地模型 ID**：`z-ai/glm-5.3`
- **别名**：`glm-5.3`、`GLM-5.3`
- **计费方式**：`ModelRatio`

| 计费项 | 上游 元/M | 本地 元/M |
|---|---|---|
| 非缓存输入 | 8.0000 | 8.0000 |
| 输出 | 28.0000 | 28.0000 |
| 缓存输入 | 2.0000 | 2.0000 |

## 5. DeepSeek-V4-Flash-Vision-Exp

- **本地模型 ID**：`deepseek/deepseek-v4-flash-vision-exp`
- **计费方式**：`tiered_expr`（高峰/空闲）

| 计费项 | 上游 元/M | 本地 元/M |
|---|---|---|
| 非缓存输入·高峰 | 3.0000 | 3.0000 |
| 非缓存输入·空闲 | 1.5000 | 1.5000 |
| 输出·高峰 | 9.0000 | 9.0000 |
| 输出·空闲 | 4.5000 | 4.5000 |
| 缓存·高峰 | 0.1000 | 0.1000 |
| 缓存·空闲 | 0.0500 | 0.0500 |

## 6. GLM-5.3-Flash

- **本地模型 ID**：`z-ai/glm-5.3-flash`
- **计费方式**：`ModelRatio`

| 计费项 | 上游 元/M | 本地 元/M |
|---|---|---|
| 非缓存输入 | 0.4000 | 0.4000 |
| 输出 | 1.4000 | 1.4000 |
| 缓存输入 | 0.1150 | 0.1150 |

---

## 配置落地点

- **options 表**：`ModelRatio`、`CompletionRatio`、`CacheRatio`、`billing_setting.billing_mode`、`billing_setting.billing_expr`
- **channels 表**（channel 1、2）：`models`（各 44 个）、`model_mapping`（别名 → 主模型）
- **备份表**：`_bak_options_newmodels_*`、`_bak_channels_newmodels_*`、`_bak_q38_hy4`、`_bak_q38_hy4_chan`

## 校验结论

6 个模型的价格全部与上游刊例价一致，分时模型的高峰/空闲均精确匹配，冒烟编译通过。
