/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

export interface DocSection {
  id: string
  title: string
  content: string
}

export interface DocCategory {
  id: string
  title: string
  sections: DocSection[]
}

const en: DocCategory[] = [
  {
    id: 'overview',
    title: 'Overview',
    sections: [
      {
        id: 'overview',
        title: 'User Guide Overview',
        content: `New API is an AI API gateway that aggregates multiple AI provider APIs into a standard OpenAI-compatible interface, letting you access dozens of models through a single endpoint.

## Roles

The platform has three roles with different permission levels:

- **Regular User**: Default role after registration. Can create tokens, call APIs, view usage, top up and subscribe.
- **Admin**: Elevated by Root. Has all user permissions plus channel management, user management, redemption codes, logs, models, and groups.
- **Root (Super Admin)**: Highest privilege. Has all admin permissions plus system settings, custom OAuth, and performance monitoring.

## Quick Start

1. **Register** an account or log in via third-party OAuth
2. **Create a Token** in the console — this is your API key
3. **Use the API** — Replace your OpenAI client's \`base_url\` with the platform address and use your token as \`api_key\`
`,
      },
    ],
  },
  {
    id: 'auth',
    title: 'Registration & Login',
    sections: [
      {
        id: 'auth',
        title: 'Registration & Login',
        content: `Supports password registration and multiple third-party OAuth logins (GitHub, Discord, LinuxDO, Telegram, OIDC, and more).

## Password Login

1. Visit \`/login\` or click "Sign In" in the top-right corner
2. Enter your username and password, then click "Sign In"

## Third-Party OAuth Login

Click the corresponding platform icon at the bottom of the login page (GitHub, Discord, LinuxDO, etc.), complete authorization on the third-party page, and you will be logged in automatically.

## Registration

1. Click "Sign Up" on the login page, or visit \`/register\`
2. Enter a username, password, and email address
3. Click "Send Code" and enter the verification code you received
4. Click "Sign Up" to complete account creation

## Forgot Password

Click "Forgot Password" on the login page, enter your registered email address, and the system will send a reset link. Click the link to set a new password.
`,
      },
    ],
  },
  {
    id: 'personal',
    title: 'Personal Settings',
    sections: [
      {
        id: 'personal',
        title: 'Personal Settings',
        content: `Manage account information, security settings, and third-party account bindings. After logging in, click your avatar in the top-right corner and select "Profile", or visit \`/profile\`.

## Basic Information

- **Change Username**: Enter a new username and save
- **Bind Email**: Enter your email address, send verification code, enter the code, then bind
- **Change Password**: Enter current password, new password, and confirm

## Two-Factor Authentication (2FA)

Enabling 2FA requires a dynamic code from an authenticator app at each login:

1. Install an authenticator app (Google Authenticator or Microsoft Authenticator)
2. In Profile settings, find the "Two-Factor Authentication" section and click "Enable 2FA"
3. Scan the QR code with your authenticator app
4. Enter the 6-digit code from the app and confirm
5. **Save the backup codes** — they are shown only once

## Passkey (Passwordless Login)

Supports login via device fingerprint, face recognition, or hardware security keys:

1. In Profile settings, find the "Passkey" section
2. Click "Register Passkey" and complete your device's verification
3. Use Passkey for future logins — no password required

## Third-Party Account Binding

Bind GitHub, Discord, or other accounts for one-click login without a password:

1. In Profile settings, find the "Third-Party Account Binding" section
2. Click "Bind" next to the platform you want
3. Complete authorization on that platform's page
`,
      },
    ],
  },
  {
    id: 'token',
    title: 'Token Management',
    sections: [
      {
        id: 'token',
        title: 'Token Management',
        content: `Tokens are API credentials. Each token can have its own permission scope and quota limit. Click "Keys" in the sidebar, or visit \`/keys\`.

## Create a Token

1. Click "Create Key" in the top-right of the keys page
2. Enter a name (e.g., "Production" or "Testing")
3. Configure the following options as needed:

| Option | Description |
|--------|-------------|
| Expiration | Set an expiry date; leave blank for no expiration |
| Remaining Quota | Max quota this token can consume; auto-disabled when exceeded |
| Unlimited Quota | No quota limit (still subject to account total) |
| Model Restrictions | Restrict to specific models; leave blank for all |
| IP Allowlist | Restrict source IPs; leave blank for any IP |
| Group | Specify the channel group this token uses |

4. Click "Submit" — the full token key is displayed **only once**. Copy and save it immediately.

> ⚠️ Token keys have full API access permissions. Do not share them or commit them to code repositories.
`,
      },
    ],
  },
  {
    id: 'api',
    title: 'Using the API',
    sections: [
      {
        id: 'api',
        title: 'Using the API',
        content: `Replace your OpenAI client's \`base_url\` with the platform address and use your token as \`api_key\` to start calling.

## Playground

Playground is a built-in online testing tool. Test models directly without writing any code:

1. Click "Playground" in the sidebar or visit \`/playground\`
2. Select a model from the left panel
3. Type a message and click Send
4. The model's response appears in the conversation area

## Get the API Address

Your API base URL is displayed on the dashboard homepage. Click the copy button to copy it.

## Code Examples

### Python (OpenAI SDK)

\`\`\`python
from openai import OpenAI

client = OpenAI(
    api_key="sk-xxxxxxxxxxxxxxxx",
    base_url="https://your-platform.com/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
\`\`\`

### cURL

\`\`\`bash
curl https://your-platform.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-xxxxxxxx" \\
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello!"}]}'
\`\`\`

## Supported Endpoints

| Endpoint | Path | Description |
|----------|------|-------------|
| Chat Completions | \`POST /v1/chat/completions\` | Conversational generation with streaming |
| Embeddings | \`POST /v1/embeddings\` | Text vectorization |
| Image Generation | \`POST /v1/images/generations\` | Text-to-image |
| Speech-to-Text | \`POST /v1/audio/transcriptions\` | Audio transcription |
| Text-to-Speech | \`POST /v1/audio/speech\` | TTS |
| Rerank | \`POST /v1/rerank\` | Document reranking |
| Responses | \`POST /v1/responses\` | OpenAI Responses format |
| Realtime | WebSocket \`/v1/realtime\` | OpenAI Realtime API |
| Models | \`GET /v1/models\` | List available models |
`,
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing',
    sections: [
      {
        id: 'pricing',
        title: 'Pricing',
        content: `The pricing page shows billing details for all available models. Visit \`/pricing\` — no login required.

The page lists all available models with their input and output prices.

## Understanding Pricing

- **Input Price**: Quota consumed per input tokens
- **Output Price**: Quota consumed per output tokens
- Actual consumption = token count × model multiplier × group multiplier
- Different user groups may have different billing multipliers

Use the search box at the top to quickly locate a specific model's pricing.
`,
      },
    ],
  },
  {
    id: 'logs',
    title: 'Usage Logs',
    sections: [
      {
        id: 'logs',
        title: 'Usage Logs',
        content: `View detailed information for each API call with filtering by time, model, and token. Click "Usage Logs" in the sidebar or visit \`/usage-logs\`. Regular users can only see their own records.

Each log entry shows: call time, model used, token count consumed, quota deducted, and call status.

## Search & Filter

1. Use the filter controls at the top of the page
2. Set conditions: time range, model name keyword, token name
3. Results update automatically

## Data Statistics

Visit \`/dashboard\` to see daily API call volume and quota consumption trends as charts. Hover over the chart to view detailed data for a specific date.
`,
      },
    ],
  },
  {
    id: 'topup',
    title: 'Quota & Top Up',
    sections: [
      {
        id: 'topup',
        title: 'Quota & Top Up',
        content: `Quota is the platform's internal billing unit. Consumption = actual token count × model multiplier. Click "Wallet" in the sidebar or visit \`/wallet\`.

## Top Up Methods

| Method | Description |
|--------|-------------|
| Redemption Code | Enter an admin-generated code to add quota |
| EPay | Domestic aggregated payment |
| Stripe | International credit card payment |
| Creem / Waffo | International payment platforms |

## Online Payment

1. Select or enter a top-up amount
2. Choose a payment method
3. Click "Top Up" — you will be redirected to the payment platform
4. Complete payment — your balance updates automatically

## Redemption Code

1. Paste or type the redemption code provided by an admin
2. Click "Redeem" — quota is added to your balance immediately

## Referral Rewards

Every account has a unique referral code. When someone you refer makes purchases, you earn reward quota.

1. Find your referral code in Wallet or Profile settings
2. Share it with others — they enter it when registering
3. When referred users make purchases, your reward quota increases
4. Click "Transfer to Balance" to move rewards into your main balance
`,
      },
    ],
  },
  {
    id: 'subscription',
    title: 'Subscription Plans',
    sections: [
      {
        id: 'subscription',
        title: 'Subscription Plans',
        content: `Subscriptions are periodic quota packages. After purchase, you enjoy the included quota or privileges for the duration. Click "Subscriptions" in the sidebar or visit \`/subscriptions\`.

## Purchase a Subscription

1. Browse available plans — review price, duration, and included quota
2. Click "Purchase" on the plan you want
3. Select a payment method and confirm payment
4. After payment, subscription status updates to active

## View Subscription Status

After purchasing, the subscription page shows:
- Plan name and expiration date
- Remaining quota in the plan
- Auto-renewal toggle
`,
      },
    ],
  },
]

const zh: DocCategory[] = [
  {
    id: 'overview',
    title: '概述',
    sections: [
      {
        id: 'overview',
        title: '用户指南概述',
        content: `New API 是一个 AI API 网关，聚合多家 AI 服务商 API 为统一的 OpenAI 兼容接口，通过单一端点即可访问数十种模型。

## 角色说明

平台共有三种角色，权限级别不同：

- **普通用户**：注册后的默认角色。可创建令牌、调用 API、查看用量、充值、订阅。
- **管理员**：由超级管理员提升。拥有用户全部权限，外加渠道管理、用户管理、兑换码、日志、模型、分组管理。
- **超级管理员 (Root)**：最高权限。拥有管理员全部权限，外加系统设置、自定义 OAuth、性能监控。

## 快速上手

1. **注册**账号或通过第三方 OAuth 登录
2. 在控制台**创建令牌 (Key)** — 这就是你的 API 密钥
3. **调用 API** — 将 OpenAI 客户端的 \`base_url\` 替换为平台地址，使用令牌作为 \`api_key\`
`,
      },
    ],
  },
  {
    id: 'auth',
    title: '注册与登录',
    sections: [
      {
        id: 'auth',
        title: '注册与登录',
        content: `支持密码注册和多种第三方 OAuth 一键登录（GitHub、Discord、LinuxDO、Telegram、OIDC 等）。

## 密码登录

1. 访问 \`/login\` 或点击右上角「登录」
2. 输入用户名和密码，点击「登录」

## 第三方 OAuth 登录

在登录页面底部点击对应平台图标（GitHub、Discord、LinuxDO 等），在第三方页面完成授权后自动登录。

## 注册

1. 在登录页面点击「注册」，或直接访问 \`/register\`
2. 输入用户名、密码和邮箱地址
3. 点击「发送验证码」，输入收到的验证码
4. 点击「注册」完成账号创建

## 忘记密码

在登录页面点击「忘记密码」，输入注册邮箱，系统会发送重置链接。点击链接即可设置新密码。
`,
      },
    ],
  },
  {
    id: 'personal',
    title: '个人设置',
    sections: [
      {
        id: 'personal',
        title: '个人设置',
        content: `管理账户信息、安全设置和第三方账号绑定。登录后点击右上角头像，选择「个人设置」，或访问 \`/profile\`。

## 基本信息

- **修改用户名**：输入新用户名并保存
- **绑定邮箱**：输入邮箱地址，发送验证码，输入验证码后绑定
- **修改密码**：输入当前密码、新密码并确认

## 两步验证 (2FA)

开启后每次登录需要输入验证器 App 的动态码：

1. 安装验证器 App（推荐 Google Authenticator 或 Microsoft Authenticator）
2. 在个人设置中找到「两步验证」，点击「开启 2FA」
3. 用验证器 App 扫描页面上的二维码
4. 输入 App 显示的 6 位数字并确认
5. **务必保存备用恢复码** — 仅显示一次，关闭后无法再次查看

## Passkey 免密登录

支持通过设备指纹、人脸识别或硬件密钥登录，无需密码：

1. 在个人设置中找到「Passkey」区域
2. 点击「注册 Passkey」，完成设备的验证
3. 之后即可使用 Passkey 免密登录

## 第三方账号绑定

绑定 GitHub、Discord 等账号后，可直接使用该账号一键登录：

1. 在个人设置中找到「第三方账号绑定」区域
2. 点击对应平台的「绑定」按钮
3. 在第三方页面完成授权
`,
      },
    ],
  },
  {
    id: 'token',
    title: 'Token 管理',
    sections: [
      {
        id: 'token',
        title: 'Token 管理',
        content: `Token 是 API 调用的凭证。每个 Token 可独立配置权限范围和额度限制。点击侧边栏「密钥」，或访问 \`/keys\`。

## 创建 Token

1. 在密钥页面点击「创建 Key」
2. 输入名称（如「生产环境」或「测试」）
3. 根据需要配置以下选项：

| 选项 | 说明 |
|------|------|
| 过期时间 | 设置到期日期；留空为永不过期 |
| 剩余额度 | 限制此 Token 最大消耗额度；超出后自动禁用 |
| 无限额度 | 开启后不限制额度（仍受账户总额限制） |
| 模型限制 | 限制可调用的模型；留空为所有模型 |
| IP 白名单 | 限制来源 IP；留空为不限制 |
| 分组 | 指定使用的渠道分组 |

4. 点击「提交」— 完整的 Token Key **仅显示一次**，请立即复制保存。

> ⚠️ Token Key 拥有完整的 API 调用权限，请勿分享给他人或提交到代码仓库。
`,
      },
    ],
  },
  {
    id: 'api',
    title: '使用 API',
    sections: [
      {
        id: 'api',
        title: '使用 API',
        content: `将 OpenAI 客户端的 \`base_url\` 替换为平台地址，使用你的 Token 作为 \`api_key\` 即可开始调用。

## Playground 在线测试

Playground 是内置的在线测试工具，无需编写代码即可与模型对话：

1. 点击侧边栏「Playground」或访问 \`/playground\`
2. 在左侧面板选择要测试的模型
3. 在底部输入框输入消息并发送
4. 模型回复会显示在右侧对话区

## 获取 API 地址

你的 API 地址显示在控制台首页，点击复制按钮即可复制。

## 代码示例

### Python (OpenAI SDK)

\`\`\`python
from openai import OpenAI

client = OpenAI(
    api_key="sk-xxxxxxxxxxxxxxxx",
    base_url="https://your-platform.com/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "你好！"}]
)
print(response.choices[0].message.content)
\`\`\`

### cURL

\`\`\`bash
curl https://your-platform.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-xxxxxxxx" \\
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "你好！"}]}'
\`\`\`

## 支持的端点

| 端点 | 路径 | 说明 |
|------|------|------|
| 对话补全 | \`POST /v1/chat/completions\` | 对话生成，支持流式 |
| 嵌入 | \`POST /v1/embeddings\` | 文本向量化 |
| 图片生成 | \`POST /v1/images/generations\` | 文生图 |
| 语音转文字 | \`POST /v1/audio/transcriptions\` | 音频转录 |
| 文字转语音 | \`POST /v1/audio/speech\` | TTS |
| 重排序 | \`POST /v1/rerank\` | 文档重排序 |
| Responses | \`POST /v1/responses\` | OpenAI Responses 格式 |
| Realtime | WebSocket \`/v1/realtime\` | OpenAI 实时 API |
| 模型列表 | \`GET /v1/models\` | 获取可用模型 |
`,
      },
    ],
  },
  {
    id: 'pricing',
    title: '定价',
    sections: [
      {
        id: 'pricing',
        title: '定价',
        content: `定价页面展示所有可用模型的计费信息。访问 \`/pricing\` — 无需登录。

页面以列表形式展示所有可用模型及其输入/输出价格。

## 价格说明

- **输入价格**：每单位输入 Token 消耗的额度
- **输出价格**：每单位输出 Token 消耗的额度
- 实际消耗 = Token 数量 × 模型倍率 × 分组倍率
- 不同分组的用户可能有不同的计费倍率

顶部搜索框可输入模型名称关键词，快速定位特定模型的定价。
`,
      },
    ],
  },
  {
    id: 'logs',
    title: '用量日志',
    sections: [
      {
        id: 'logs',
        title: '用量日志',
        content: `查看每次 API 调用的详细信息，支持按时间、模型、Token 等条件筛选。点击侧边栏「用量日志」或访问 \`/usage-logs\`。普通用户只能查看自己的调用记录。

每条日志记录包含：调用时间、使用的模型、消耗 Token 数、扣除额度、调用状态。

## 搜索与筛选

1. 使用页面顶部的筛选控件
2. 设置条件：时间范围、模型名称关键词、Token 名称
3. 结果自动更新

## 数据统计

访问 \`/dashboard\` 可查看每日 API 调用量和额度消耗趋势图表。鼠标悬停在图表上可查看具体日期的详细数据。
`,
      },
    ],
  },
  {
    id: 'topup',
    title: '充值',
    sections: [
      {
        id: 'topup',
        title: '充值',
        content: `额度是平台的内部计费单位。消耗量 = 实际 Token 数 × 模型倍率。点击侧边栏「钱包」或访问 \`/wallet\`。

## 充值方式

| 方式 | 说明 |
|------|------|
| 兑换码 | 输入管理员生成的兑换码，直接获得额度 |
| EPay | 国内聚合支付 |
| Stripe | 国际信用卡支付 |
| Creem / Waffo | 国际支付平台 |

## 在线支付充值

1. 选择或输入充值金额
2. 选择支付方式
3. 点击「充值」— 跳转至支付平台
4. 完成支付后余额自动更新

## 兑换码充值

1. 粘贴管理员提供的兑换码
2. 点击「兑换」— 额度立即到账

## 邀请奖励

每个账户有唯一的邀请码。受邀用户消费后，邀请人可获得奖励额度。

1. 在钱包或个人设置页面找到你的邀请码
2. 分享给他人，对方注册时填写
3. 受邀用户消费后，你的奖励额度自动增加
4. 点击「转入余额」将奖励额度转入主账户
`,
      },
    ],
  },
  {
    id: 'subscription',
    title: '订阅',
    sections: [
      {
        id: 'subscription',
        title: '订阅',
        content: `订阅是周期性额度套餐，购买后在有效期内享受包含的额度或权益。点击侧边栏「订阅」或访问 \`/subscriptions\`。

## 购买订阅

1. 浏览可用的订阅套餐 — 了解价格、时长和包含额度
2. 点击想要的套餐「购买」
3. 选择支付方式并确认支付
4. 支付成功后订阅状态更新为生效中

## 查看订阅状态

购买后，订阅页面顶部显示当前套餐详情：
- 套餐名称和到期时间
- 套餐剩余额度
- 自动续费开关
`,
      },
    ],
  },
]

export function getDocsContent(lang: string): DocCategory[] {
  if (lang.startsWith('zh')) return zh
  return en
}
