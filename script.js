document.addEventListener('DOMContentLoaded', () => {
    // ========================================
    // DOM 元素
    // ========================================
    const $ = id => document.getElementById(id);

    const elements = {
        chatWindow: $('chat-window'),
        messageInput: $('message-input'),
        sendButton: $('send-button'),
        apiUrl: $('api-url'),
        apiKey: $('api-key'),
        apiModel: $('api-model'),
        temperature: $('temperature'),
        topP: $('top-p'),
        frequencyPenalty: $('frequency-penalty'),
        presencePenalty: $('presence-penalty'),
        systemPrompt: $('system-prompt'),
        importFileInput: $('import-file-input'),
        tempValue: $('temp-value'),
        toppValue: $('topp-value'),
        freqValue: $('freq-value'),
        presValue: $('pres-value'),
        currentTokens: $('current-tokens'),
        lastResponseTokens: $('last-response-tokens'),
        sessionsList: $('sessions-list'),
        newChatBtn: $('new-chat-btn'),
        sessionsSidebar: $('sessions-sidebar'),
        configSidebar: $('config-sidebar'),
        overlay: $('overlay'),
        menuBtn: $('menu-btn'),
        configBtn: $('config-btn'),
        mobileTitle: $('mobile-title'),
        toggleConfigBtn: $('toggle-config-btn'),
        closeConfigBtn: $('close-config-btn'),
        modalOverlay: $('modal-overlay'),
        modalMessage: $('modal-message'),
        modalCancel: $('modal-cancel'),
        modalConfirm: $('modal-confirm')
    };

    // ========================================
    // 状态管理
    // ========================================
    let sessions = [];
    let currentSessionId = null;
    let lastResponseTokens = 0;
    let modalResolve = null;

    // ========================================
    // 初始化
    // ========================================
    function initialize() {
        configureMarked();
        loadConfig();
        loadSessions();
        bindEvents();
        updateSliderDisplays();

        if (sessions.length === 0) {
            createNewSession();
        } else {
            switchSession(sessions[0].id);
        }
    }

    function configureMarked() {
        if (window.marked) {
            marked.setOptions({
                breaks: true,
                gfm: true
            });
        }
    }

    function loadConfig() {
        elements.apiUrl.value = localStorage.getItem('apiUrl') || '';
        elements.apiKey.value = localStorage.getItem('apiKey') || '';
        elements.apiModel.value = localStorage.getItem('apiModel') || 'gpt-4o';
        elements.temperature.value = localStorage.getItem('temperature') || '0.7';
        elements.topP.value = localStorage.getItem('topP') || '1';
        elements.frequencyPenalty.value = localStorage.getItem('frequencyPenalty') || '0';
        elements.presencePenalty.value = localStorage.getItem('presencePenalty') || '0';
        elements.systemPrompt.value = localStorage.getItem('systemPrompt') || '';
    }

    function loadSessions() {
        sessions = JSON.parse(localStorage.getItem('sessions')) || [];
        lastResponseTokens = parseInt(localStorage.getItem('lastResponseTokens')) || 0;
    }

    function saveSessions() {
        localStorage.setItem('sessions', JSON.stringify(sessions));
    }

    function saveConfig(key, value) {
        localStorage.setItem(key, value);
    }

    // ========================================
    // 自定义弹窗
    // ========================================
    function showModal(message) {
        return new Promise((resolve) => {
            modalResolve = resolve;
            elements.modalMessage.textContent = message;
            elements.modalOverlay.classList.add('active');
        });
    }

    function closeModal(result) {
        elements.modalOverlay.classList.remove('active');
        if (modalResolve) {
            modalResolve(result);
            modalResolve = null;
        }
    }

    // ========================================
    // 会话管理
    // ========================================
    function createNewSession() {
        const session = {
            id: Date.now().toString(),
            title: '新对话',
            messages: [],
            createdAt: new Date().toISOString()
        };
        sessions.unshift(session);
        saveSessions();
        switchSession(session.id);
        renderSessionsList();
    }

    function switchSession(sessionId) {
        currentSessionId = sessionId;
        const session = getCurrentSession();
        if (session) {
            elements.mobileTitle.textContent = session.title;
            renderMessages();
            updateTokenDisplay();
        }
        renderSessionsList();
        closeSidebars();
    }

    function getCurrentSession() {
        return sessions.find(s => s.id === currentSessionId);
    }

    async function deleteSession(sessionId) {
        if (sessions.length <= 1) {
            showNotice('至少保留一个对话');
            return;
        }

        const confirmed = await showModal('确定删除这个对话吗？');
        if (!confirmed) return;

        const index = sessions.findIndex(s => s.id === sessionId);
        if (index > -1) {
            sessions.splice(index, 1);
            saveSessions();

            if (sessionId === currentSessionId) {
                switchSession(sessions[0].id);
            } else {
                renderSessionsList();
            }
        }
    }

    function renameSession(newTitle) {
        const session = getCurrentSession();
        if (session && newTitle.trim()) {
            session.title = newTitle.trim().substring(0, 50);
            elements.mobileTitle.textContent = session.title;
            saveSessions();
            renderSessionsList();
        }
    }

    function autoRenameSession(content) {
        const session = getCurrentSession();
        if (session && session.title === '新对话' && content) {
            session.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
            elements.mobileTitle.textContent = session.title;
            saveSessions();
            renderSessionsList();
        }
    }

    function renderSessionsList() {
        elements.sessionsList.innerHTML = '';

        sessions.forEach(session => {
            const item = document.createElement('div');
            item.className = `session-item${session.id === currentSessionId ? ' active' : ''}`;

            const title = document.createElement('span');
            title.className = 'session-title';
            title.textContent = session.title;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'session-delete';
            deleteBtn.textContent = '✕';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteSession(session.id);
            };

            item.appendChild(title);
            item.appendChild(deleteBtn);
            item.onclick = () => switchSession(session.id);

            elements.sessionsList.appendChild(item);
        });
    }

    // ========================================
    // 侧边栏控制
    // ========================================
    function openSessionsSidebar() {
        elements.sessionsSidebar.classList.add('open');
        elements.overlay.classList.add('active');
    }

    function openConfigSidebar() {
        elements.configSidebar.classList.add('open');
        elements.overlay.classList.add('active');
    }

    function closeSidebars() {
        elements.sessionsSidebar.classList.remove('open');
        elements.configSidebar.classList.remove('open');
        elements.overlay.classList.remove('active');
    }

    // ========================================
    // 事件绑定
    // ========================================
    function bindEvents() {
        elements.sendButton.addEventListener('click', sendMessage);
        elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        elements.messageInput.addEventListener('input', () => {
            elements.messageInput.style.height = 'auto';
            elements.messageInput.style.height = Math.min(elements.messageInput.scrollHeight, 120) + 'px';
        });

        elements.newChatBtn.addEventListener('click', createNewSession);

        elements.menuBtn.addEventListener('click', openSessionsSidebar);
        elements.configBtn.addEventListener('click', openConfigSidebar);
        elements.toggleConfigBtn.addEventListener('click', () => {
            closeSidebars();
            setTimeout(openConfigSidebar, 150);
        });
        elements.closeConfigBtn.addEventListener('click', closeSidebars);
        elements.overlay.addEventListener('click', closeSidebars);

        // 弹窗事件
        elements.modalCancel.addEventListener('click', () => closeModal(false));
        elements.modalConfirm.addEventListener('click', () => closeModal(true));
        elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.modalOverlay) closeModal(false);
        });

        const configFields = [
            { el: elements.apiUrl, key: 'apiUrl' },
            { el: elements.apiKey, key: 'apiKey' },
            { el: elements.apiModel, key: 'apiModel' },
            { el: elements.temperature, key: 'temperature' },
            { el: elements.topP, key: 'topP' },
            { el: elements.frequencyPenalty, key: 'frequencyPenalty' },
            { el: elements.presencePenalty, key: 'presencePenalty' },
            { el: elements.systemPrompt, key: 'systemPrompt' }
        ];

        configFields.forEach(({ el, key }) => {
            el.addEventListener('change', () => saveConfig(key, el.value));
        });

        elements.temperature.addEventListener('input', () => {
            elements.tempValue.textContent = elements.temperature.value;
        });
        elements.topP.addEventListener('input', () => {
            elements.toppValue.textContent = elements.topP.value;
        });
        elements.frequencyPenalty.addEventListener('input', () => {
            elements.freqValue.textContent = elements.frequencyPenalty.value;
        });
        elements.presencePenalty.addEventListener('input', () => {
            elements.presValue.textContent = elements.presencePenalty.value;
        });

        elements.importFileInput.addEventListener('change', handleImport);
    }

    function updateSliderDisplays() {
        elements.tempValue.textContent = elements.temperature.value;
        elements.toppValue.textContent = elements.topP.value;
        elements.freqValue.textContent = elements.frequencyPenalty.value;
        elements.presValue.textContent = elements.presencePenalty.value;
    }

    // ========================================
    // Token 计算
    // ========================================
    function estimateTokens(text) {
        if (!text) return 0;
        const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
        const otherChars = text.length - chineseChars;
        return Math.ceil(chineseChars / 1.5 + otherChars / 4);
    }

    function calculateCurrentTokens() {
        const session = getCurrentSession();
        if (!session) return 0;

        let total = estimateTokens(elements.systemPrompt.value);

        session.messages.forEach(msg => {
            if (!msg.hidden) {
                total += estimateTokens(msg.content);
            }
        });

        return total;
    }

    function updateTokenDisplay() {
        elements.currentTokens.textContent = calculateCurrentTokens().toLocaleString();
        elements.lastResponseTokens.textContent = lastResponseTokens.toLocaleString();
    }

    // ========================================
    // 获取实际消息（不含通知）
    // ========================================
    function getRealMessages() {
        const session = getCurrentSession();
        if (!session) return [];
        return session.messages;
    }

    // ========================================
    // 指令系统
    // ========================================
    function executeCommand(input) {
        const session = getCurrentSession();
        if (!session) return;

        const parts = input.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const arg = parts.slice(1).join(' ');

        switch (command) {
            case '/hide':
            case '/del': {
                if (!arg) {
                    showNotice(`用法：${command} 1-5`);
                    return;
                }
                const range = arg.split('-').map(Number);
                let [start, end] = range;
                if (isNaN(start)) {
                    showNotice('无效的楼层数字');
                    return;
                }
                end = isNaN(end) ? start : end;
                if (start > end) [start, end] = [end, start];

                const startIdx = start - 1;
                const endIdx = end;

                if (command === '/hide') {
                    let count = 0;
                    for (let i = startIdx; i < endIdx && i < session.messages.length; i++) {
                        if (i >= 0) {
                            session.messages[i].hidden = true;
                            count++;
                        }
                    }
                    showNotice(`已隐藏 ${count} 条消息（${start}-${Math.min(end, session.messages.length)}楼）`);
                } else {
                    if (startIdx < 0 || startIdx >= session.messages.length) {
                        showNotice('删除范围无效');
                        return;
                    }
                    const deleteCount = Math.min(endIdx - startIdx, session.messages.length - startIdx);
                    session.messages.splice(startIdx, deleteCount);
                    showNotice(`已删除 ${deleteCount} 条消息`);
                }
                break;
            }
            case '/show':
                if (arg === 'all') {
                    let count = 0;
                    session.messages.forEach(m => {
                        if (m.hidden) {
                            m.hidden = false;
                            count++;
                        }
                    });
                    showNotice(`已显示 ${count} 条隐藏消息`);
                } else {
                    showNotice('用法：/show all');
                }
                break;
            case '/clear':
                session.messages = [];
                lastResponseTokens = 0;
                localStorage.setItem('lastResponseTokens', '0');
                showNotice('对话已清空');
                break;
            case '/rename':
                if (arg) {
                    renameSession(arg);
                    showNotice(`已重命名为：${arg}`);
                } else {
                    showNotice('用法：/rename 新名称');
                }
                break;
            case '/export':
                exportChat();
                return;
            case '/import':
                elements.importFileInput.click();
                return;
            default:
                showNotice(`未知指令：${command}\n输入 /help 查看可用指令`);
                return;
        }

        saveSessions();
        renderMessages();
        updateTokenDisplay();
    }

    // ========================================
    // 通知显示（不存入消息）
    // ========================================
    function showNotice(text) {
        const notice = document.createElement('div');
        notice.className = 'system-notice';
        notice.textContent = text;
        elements.chatWindow.appendChild(notice);
        elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;

        // 5秒后淡出
        setTimeout(() => {
            notice.style.transition = 'opacity 0.5s';
            notice.style.opacity = '0';
            setTimeout(() => notice.remove(), 500);
        }, 5000);
    }

    // ========================================
    // 导入/导出
    // ========================================
    function exportChat() {
        const session = getCurrentSession();
        if (!session) return;

        const exportData = {
            title: session.title,
            messages: session.messages,
            exportTime: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${session.title}-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotice('对话已导出');
    }

    function handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);

                let messages = [];
                if (Array.isArray(imported)) {
                    messages = imported;
                } else if (imported.messages && Array.isArray(imported.messages)) {
                    messages = imported.messages;
                } else {
                    throw new Error('无法识别的格式');
                }

                const newSession = {
                    id: Date.now().toString(),
                    title: imported.title || '导入的对话',
                    messages: messages,
                    createdAt: new Date().toISOString()
                };

                sessions.unshift(newSession);
                saveSessions();
                switchSession(newSession.id);
                showNotice(`成功导入 ${messages.length} 条消息`);
            } catch (err) {
                showNotice('导入失败：' + err.message);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    // ========================================
    // API 通信
    // ========================================
    async function sendMessage() {
        const session = getCurrentSession();
        if (!session) return;

        const text = elements.messageInput.value.trim();
        if (!text) return;

        if (text.startsWith('/')) {
            executeCommand(text);
            elements.messageInput.value = '';
            elements.messageInput.style.height = 'auto';
            return;
        }

        const url = elements.apiUrl.value.trim();
        const key = elements.apiKey.value.trim();
        const model = elements.apiModel.value.trim();

        if (!url || !key) {
            showNotice('请先在设置中填写 API URL 和 Key');
            return;
        }

        session.messages.push({ role: 'user', content: text, hidden: false });
        autoRenameSession(text);
        renderMessages();
        elements.messageInput.value = '';
        elements.messageInput.style.height = 'auto';
        setLoading(true);

        try {
            const context = [];

            const systemPrompt = elements.systemPrompt.value.trim();
            if (systemPrompt) {
                context.push({ role: 'system', content: systemPrompt });
            }

            session.messages.forEach(m => {
                if (!m.hidden) {
                    context.push({ role: m.role, content: m.content });
                }
            });

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`
                },
                body: JSON.stringify({
                    model,
                    messages: context,
                    stream: true,
                    temperature: parseFloat(elements.temperature.value),
                    top_p: parseFloat(elements.topP.value),
                    frequency_penalty: parseFloat(elements.frequencyPenalty.value),
                    presence_penalty: parseFloat(elements.presencePenalty.value)
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API 错误 ${response.status}: ${errorText.substring(0, 200)}`);
            }

            const assistantMsg = { role: 'assistant', content: '', hidden: false };
            session.messages.push(assistantMsg);
            const msgIndex = session.messages.length - 1;

            renderMessages();

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const dataStr = line.slice(6).trim();
                    if (dataStr === '[DONE]') continue;

                    try {
                        const json = JSON.parse(dataStr);
                        const content = json.choices?.[0]?.delta?.content || '';
                        if (content) {
                            session.messages[msgIndex].content += content;
                            updateLastMessage(session.messages[msgIndex]);
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }

            lastResponseTokens = estimateTokens(session.messages[msgIndex].content);
            localStorage.setItem('lastResponseTokens', lastResponseTokens.toString());

        } catch (err) {
            showNotice(`请求失败: ${err.message}`);
            console.error(err);
        } finally {
            saveSessions();
            updateTokenDisplay();
            setLoading(false);
        }
    }

    function setLoading(isLoading) {
        elements.sendButton.disabled = isLoading;
        elements.sendButton.textContent = isLoading ? '...' : '发送';
    }

    // ========================================
    // 渲染
    // ========================================
    function renderMessages() {
        const session = getCurrentSession();
        if (!session) return;

        elements.chatWindow.innerHTML = '';

        session.messages.forEach((msg, index) => {
            const msgDiv = createMessageElement(msg, index + 1);
            elements.chatWindow.appendChild(msgDiv);
        });

        addCopyButtons();
        elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
    }

    function createMessageElement(msg, floor) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${msg.role}${msg.hidden ? ' hidden-msg' : ''}`;
        msgDiv.dataset.floor = floor;

        const metaDiv = document.createElement('div');
        metaDiv.className = 'message-meta';

        const floorSpan = document.createElement('span');
        floorSpan.className = 'floor-num';
        floorSpan.textContent = `${floor}楼`;

        const tokenSpan = document.createElement('span');
        tokenSpan.className = 'token-count';
        tokenSpan.textContent = `${estimateTokens(msg.content)} t`;

        metaDiv.appendChild(floorSpan);
        metaDiv.appendChild(tokenSpan);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';

        if (msg.content) {
            if (window.marked && window.DOMPurify) {
                contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(msg.content));
            } else if (window.marked) {
                contentDiv.innerHTML = marked.parse(msg.content);
            } else {
                contentDiv.textContent = msg.content;
            }
        } else {
            contentDiv.innerHTML = '<span style="color:#666">正在输入...</span>';
        }

        msgDiv.appendChild(metaDiv);
        msgDiv.appendChild(contentDiv);

        return msgDiv;
    }

    function updateLastMessage(msg) {
        const messages = elements.chatWindow.querySelectorAll('.message');
        const lastMsgDiv = messages[messages.length - 1];

        if (lastMsgDiv) {
            const contentDiv = lastMsgDiv.querySelector('.content');
            const tokenSpan = lastMsgDiv.querySelector('.token-count');

            if (window.marked && window.DOMPurify) {
                contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(msg.content));
            } else if (window.marked) {
                contentDiv.innerHTML = marked.parse(msg.content);
            } else {
                contentDiv.textContent = msg.content;
            }

            tokenSpan.textContent = `${estimateTokens(msg.content)} t`;

            addCopyButtons();
            elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
        }
    }

    function addCopyButtons() {
        elements.chatWindow.querySelectorAll('pre').forEach(pre => {
            if (pre.querySelector('.copy-btn')) return;

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = '复制';
            copyBtn.onclick = () => {
                const code = pre.querySelector('code')?.innerText || pre.innerText;
                navigator.clipboard.writeText(code).then(() => {
                    copyBtn.textContent = '✓';
                    setTimeout(() => copyBtn.textContent = '复制', 2000);
                });
            };
            pre.appendChild(copyBtn);
        });
    }

    // ========================================
    // 启动
    // ========================================
    initialize();
});