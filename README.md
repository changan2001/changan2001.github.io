\# 🤖 AI 助手 (Personal AI Assistant)



一个轻量级、响应式、且高度隐私安全的纯前端 AI 聊天界面。通过 GitHub Pages 部署，你可以随时随地在设备上调用主流 AI 模型。



\## ✨ 项目亮点



\- 🛡️ \*\*隐私\*\*：没有后端服务器。所有的 API 密钥和聊天记录都存储在 \*\*你浏览器的 localStorage\*\* 中。

\- 📱 \*\*适配移动端\*\*：支持 PWA，可“添加到主屏幕”作为原生 App 使用，拥有沉浸式界面。

\- 🎭 \*\*多重身份预设\*\*：支持创建多个系统提示词（System Prompt），一键切换 AI 角色。

\- 🔌 \*\*多端点管理\*\*：支持配置多个 API 提供商（如 DeepSeek, OpenAI, OpenRouter 等）。

\- 🖼️ \*\*图片支持\*\*：支持发送图片进行视觉分析（需配合支持 Vision 的模型）。

\- ⌨️ \*\*指令系统\*\*：通过 `/goto`, `/hide`, `/del` 等快捷指令高效管理长对话。

\- 🌙 \*\*代码高亮\*\*：内置多种编程语言的高亮显示及折叠功能。



\## 🚀 快速开始



1\. \*\*部署到 GitHub Pages\*\*：

&#x20;  - Fork 本仓库或上传文件至你的新仓库。

&#x20;  - 在 Settings > Pages 中开启服务。

2\. \*\*配置 API\*\*：

&#x20;  - 打开部署后的网址。

&#x20;  - 点击侧边栏的 \*\*设置 (⚙️)\*\*。

&#x20;  - 输入你的 API 链接（如 `https://api.deepseek.com/v1/chat/completions`）和 API Key。

&#x20;  - 点击 \*\*保存\*\* 并 \*\*测试连接\*\*。

3\. \*\*开始聊天\*\*：

&#x20;  - 在输入框直接输入内容，或者使用 `/` 触发指令。



\## 🛠️ 常用指令



| 指令 | 说明 | 示例 |

| :--- | :--- | :--- |

| `/rename` | 重命名当前对话 | `/rename 学习计划` |

| `/hide` | 隐藏指定楼层（不计入上下文） | `/hide 5-10` |

| `/del` | 永久删除指定楼层 | `/del 3` |

| `/clear` | 清空当前对话的所有消息 | `/clear` |

| `/goto` | 快速跳转到指定楼层 | `/goto 20` |

| `/export` | 导出当前对话为 JSON 文件 | `/export` |



\## 📦 技术栈



\- \*\*Frontend\*\*: 原生 HTML5, CSS3 (CSS Variables), Vanilla JavaScript.

\- \*\*Markdown\*\*: \[Marked.js](https://github.com/markedjs/marked)

\- \*\*Security\*\*: \[DOMPurify](https://github.com/cure53/dompurify)

\- \*\*Highlight\*\*: \[Highlight.js](https://highlightjs.org/)

\- \*\*Icons\*\*: Twemoji



\## 🔒 免责声明



本项目仅供个人学习和使用。开发者无法获取用户输入的任何 API 密钥或对话内容。请妥善保管你的 API 密钥，不要在代码中硬编码任何敏感信息。

