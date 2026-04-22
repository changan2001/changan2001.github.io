# 💬 AI助手 — 纯前端私人 AI 助手

> 一个纯浏览器运行的轻量级 AI 聊天界面。
> 通过 GitHub Pages 免费部署，随时随地在任何设备上安全调用 AI 模型。


<!-- 🔗 **在线体验**: https://changan2001.github.io/ -->

---

## 🎯 为什么做这个项目

市面上的 AI 聊天工具，要么需要注册账号把数据存到别人的服务器，要么部署流程复杂需要 Docker/Node.js 环境。

**AI助手** 的目标很简单：**用最少的技术门槛，搭建一个完全属于自己的 AI 助手**。

- 不需要服务器，不需要数据库，打开网址就能用。
- 所有敏感数据（API 密钥、聊天记录）**只存在于你的浏览器本地**，关闭页面后别人无法获取。
- **部分 API 调用可能需要反向代理**。

---

## ✨ 核心特性

| 特性 | 说明 |
| :--- | :--- |
| 🛡️ **隐私性** | 纯前端架构，无后端、无数据库、无分析追踪代码。API 密钥和聊天记录仅保存在浏览器 `localStorage` 中。 |
| 📱 **PWA 支持** | 支持"添加到主屏幕"，在手机上以独立 App 形式运行，拥有无地址栏的沉浸式界面。 |
| 🔌 **多 API 配置** | 在设置页可创建多个 API 端点配置，一键切换不同模型供应商（DeepSeek / OpenAI / OpenRouter 等）。 |
| 🎭 **角色预设** | 支持创建多个系统提示词（System Prompt）预设。例如创建"代码助手""翻译官""文案写手"等角色，随时切换。 |
| 🖼️ **图片分析** | 支持在对话中发送图片（需配合支持 Vision 能力的模型，如 `gpt-4o`、`claude-3.5-sonnet`）。图片大小限制 20MB。 |
| ⌨️ **指令系统** | 通过 `/goto`、`/hide`、`/del` 等快捷指令高效管理长对话上下文。 |
| 🔍 **全局搜索** | 支持跨所有对话的全文搜索（快捷键 `Ctrl+F`），快速定位历史内容。 |
| 🌙 **代码高亮** | 内置 10+ 种编程语言的语法高亮，支持一键复制和折叠/展开代码块。 |
| 📊 **Token 估算** | 实时显示当前上下文的 Token 消耗**估算**，帮助你控制对话长度和成本。 |
| 🔧 **调试日志** | 内置调试面板，可查看 API 请求/响应详情，方便排查连接问题。 **PC端需缩小浏览器页面才会显示** 或者使用 **浏览器的开发者工具** 查看。|

---

## 🚀 快速开始

整个过程不需要安装任何软件。

### 第一步：获取项目文件

**方式一：Fork 仓库（推荐）**
1. 点击本页面右上角的 **Fork** 按钮。
2. 在弹出页面中确认仓库名称，点击 **Create fork**。
3. 完成后，你的 GitHub 账号下会出现一个同名仓库。

**方式二：手动上传**
1. 下载本项目的 4 个文件：`index.html`、`style.css`、`script.js`、`manifest.json`。
2. 在 GitHub 上新建一个仓库（建议设为 **Public**）。
3. 在仓库页面点击 **Add file → Upload files**，将 4 个文件拖入上传。
4. 点击 **Commit changes** 提交。

### 第二步：开启 GitHub Pages

1. 进入你的仓库页面，点击顶部菜单栏的 **Settings**。
2. 在左侧侧边栏找到 **Pages**（位于 Code and automation 分类下）。
3. 在 **Build and deployment** 部分：
   - **Source**：选择 `Deploy from a branch`
   - **Branch**：选择 `main`，目录选择 `/ (root)`
4. 点击 **Save**。
5. 等待 1~2 分钟，刷新页面，顶部会出现：
   > ✅ Your site is live at `https://你的用户名.github.io/仓库名/`

点击链接，你的私人 AI 助手就上线了。

### 第三步：配置 API

1. 打开你的 AI助手 页面。
2. 点击左下角 **⚙️ 设置**（移动端点击右上角 ⚙️）。
3. 在 **API 配置** 区域填写以下信息：

| 字段 | 说明 | 示例 |
| :--- | :--- | :--- |
| 配置名称 | 自定义名称，方便区分 | `我的 DeepSeek` |
| 聊天补全端点 | 模型提供商的 API 地址（完整 URL） | `https://api.deepseek.com/v1/chat/completions` |
| API Key | 从模型提供商处获取的密钥 | `sk-xxxxxxxx` |
| 模型名称 | 要使用的具体模型 | `deepseek-chat` |

4. 点击 **💾 保存当前配置**。
5. 点击 **🔗 测试连接**，确认显示"连接成功"，**该功能会消耗少量 Token **。
6. 关闭设置面板，开始聊天！

> 💡 **提示**：如果你不确定模型名称，可以在配置好 URL 和 Key 后，点击模型名称旁的 🔍 按钮自动查询可用模型列表。

---

## 📖 使用指南

### 快捷指令

在输入框中输入以下指令并发送：

| 指令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `/rename 新名称` | 重命名当前对话 | `/rename 学习计划` |
| `/hide 楼层范围` | 隐藏指定楼层（不删除，仅从上下文中排除） | `/hide 5-10` |
| `/show 楼层范围` | 重新显示已隐藏的楼层 | `/show 5-10` |
| `/del 楼层范围` | 永久删除指定楼层 | `/del 3` 或 `/del 5-10` |
| `/goto 楼层号` | 快速跳转到指定楼层 | `/goto 20` |
| `/clear` | 清空当前对话的所有消息 | `/clear` |
| `/export` | 导出当前对话为 JSON 文件 | `/export` |
| `/import` | 从 JSON 文件导入对话 | `/import` |

### 消息操作

- **编辑消息**：鼠标悬停在消息上，点击右上角的 ✏️ 按钮，选择"编辑消息"。
- **重新生成**：对 AI 的回复点击 ✏️ → "重新生成"，会删除当前回复并重新请求。
- **批量管理**：点击输入框左侧的 ☑️ 按钮进入选择模式，可批量隐藏/删除消息。
- **全局搜索**：按 `Ctrl+F`（Mac: `Cmd+F`）打开搜索面板，搜索所有对话内容。

### 角色预设管理

1. 打开 **⚙️ 设置**，找到 **🎭 系统预设** 区域。
2. 点击 **+** 按钮新建预设，输入名称（如"代码助手"）。
3. 在"系统提示词"文本框中定义 AI 的角色和行为方式。
4. 点击 **💾 保存当前预设**。
5. 通过下拉菜单随时切换不同角色。

### 手机端 PWA 安装

1. 用手机浏览器打开你的 AI助手 网址。
2. **iOS (Safari)**：点击底部分享按钮 → "添加到主屏幕"。
3. **Android (Chrome)**：点击右上角菜单 → "添加到主屏幕"或"安装应用"。
4. 安装后，主屏幕上会出现"AI助手"图标，点击即可以独立 App 形式打开。

---

## 🛠️ 技术栈

| 类别 | 技术 |
| :--- | :--- |
| 前端框架 | 原生 HTML5 / CSS3 (CSS Variables) / Vanilla JavaScript |
| Markdown 渲染 | [Marked.js](https://github.com/markedjs/marked) v12 |
| XSS 防护 | [DOMPurify](https://github.com/cure53/dompurify) v3 |
| 代码高亮 | [Highlight.js](https://highlightjs.org/) v11 |
| 图标 | [Twemoji](https://github.com/twitter/twemoji) (via CDN) |
| 数据存储 | 浏览器 localStorage（纯本地，无服务端） |

---

## ❓ 常见问题 (FAQ)

<details>
<summary><strong>部署后访问白屏 / 404 怎么办？</strong></summary>

1. 确认 GitHub Pages 的 **Branch** 已设置为 `main`（或 `master`），目录为 `/ (root)`。
2. 确认仓库根目录下包含 `index.html` 文件（而非放在子文件夹中）。
3. 部署后需等待 1~2 分钟生效，尝试刷新页面或清除浏览器缓存。
4. 访问地址格式为 `https://用户名.github.io/仓库名/`，注意末尾的 `/`。
</details>

<details>
<summary><strong>API 测试连接失败怎么排查？</strong></summary>

1. **检查 URL 格式**：必须是完整的 URL，以 `https://` 开头，以 `/chat/completions` 结尾。
2. **检查 API Key**：确认密钥正确且未过期，建议在提供商的控制台重新生成一个。
3. **检查模型名称**：不同提供商的模型名称不同，点击 🔍 按钮查询可用模型。
4. **CORS 问题**：主流提供商（OpenAI、DeepSeek、OpenRouter、Groq）均支持浏览器直接调用。如果使用自建代理或小众中转站，可能需要在服务端配置 CORS 头。
5. **打开调试面板**：点击右上角 🔧 按钮查看详细的请求/响应日志。
</details>

<details>
<summary><strong>聊天记录会丢失吗？怎么备份？</strong></summary>

所有数据存储在浏览器的 `localStorage` 中。以下操作会导致数据丢失：
- 清除浏览器数据/缓存
- 卸载浏览器
- 使用隐私/无痕模式

**备份方法**：在输入框输入 `/export` 可将当前对话导出为 JSON 文件；使用 `/import` 可恢复导入。建议定期备份重要对话。
</details>

<details>
<summary><strong>GitHub 仓库是 Public 的，我的 API Key 安全吗？</strong></summary>

**完全安全。** API Key 仅存储在你浏览器的 `localStorage` 中，不会出现在仓库代码的任何位置。即使仓库是公开的，其他人也无法获取你的密钥。

唯一的风险是：**在代码中硬编码 API Key 并推送到 GitHub**。请务必不要这样做。
</details>

<details>
<summary><strong>支持哪些模型？可以用本地模型吗？</strong></summary>

PageAI 支持任何兼容 OpenAI Chat Completions API 格式的模型，包括但不限于：
- OpenAI (GPT-4o, GPT-4, GPT-3.5)
- DeepSeek (deepseek-chat, deepseek-reasoner)
- Claude (通过 OpenRouter)
- Gemini (通过 OpenRouter)
- Llama、Mistral、Qwen 等开源模型

**本地模型**：如果你在本地运行了 [Ollama](https://ollama.ai/) 或 [LM Studio](https://lmstudio.ai/)，可以将 API 地址设为 `http://localhost:11434/v1/chat/completions`（Ollama 示例）。注意：`localhost` 在浏览器中被视为安全来源，通常可以正常工作。
</details>

<details>
<summary><strong>如何更新到最新版本？</strong></summary>

- 如果是 Fork 的仓库：点击仓库页面的 **Sync fork** 按钮同步上游更新。
- 如果是手动上传的：下载最新版本的文件，在仓库中重新上传覆盖即可。

GitHub Pages 会在文件更新后自动重新部署（约 1~2 分钟生效）。
</details>

---

## 🔒 隐私声明

本项目承诺：

- ✅ **无后端服务器**：所有代码在浏览器本地执行。
- ✅ **无数据上传**：API 密钥、聊天记录、配置参数均存储在 `localStorage`，不会发送至任何第三方。
- ✅ **无追踪代码**：不包含 Google Analytics、百度统计或任何数据采集脚本。
- ✅ **CDN 资源校验**：外部库（Marked.js、DOMPurify、Highlight.js）使用 SRI 完整性校验，防止 CDN 投毒。
- ⚠️ **API 请求**：你的对话内容会发送至你自行配置的 API 端点。请确保使用 HTTPS 协议，并信任你所选择的模型提供商。

---

## 📄 许可证

本项目基于 [Prosperity Public License 3.0](https://prosperitylicense.com/versions/3.0.0) 开源。

- 个人、非盈利组织可免费非商用使用、修改和分发本项目；
- **任何商业用途，需联系作者获取授权**，如需获取商业授权，请联系：zw2076006103@163.com
