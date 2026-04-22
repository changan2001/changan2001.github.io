document.addEventListener('DOMContentLoaded', () => {
    // ========================================
    // DOM 元素
    // ========================================
    const $ = id => document.getElementById(id);

    const elements = {
        chatWindow: $('chat-window'),
        messageInput: $('message-input'),
        sendButton: $('send-button'),
        stopButton: $('stop-button'),
        apiUrl: $('api-url'),
        apiKey: $('api-key'),
        apiModel: $('api-model'),
        apiConfigName: $('api-config-name'),
        apiConfigSelect: $('api-config-select'),
        addApiConfigBtn: $('add-api-config-btn'),
        deleteApiConfigBtn: $('delete-api-config-btn'),
        saveApiConfigBtn: $('save-api-config-btn'),
        testApiBtn: $('test-api-btn'),
        fetchModelsBtn: $('fetch-models-btn'),
        modelSelect: $('model-select'),
        modelSelectGroup: $('model-select-group'),
        modelCount: $('model-count'),
        authType: $('auth-type'),
        useStream: $('use-stream'),
        requestTimeout: $('request-timeout'),
        presetSelect: $('preset-select'),
        presetName: $('preset-name'),
        addPresetBtn: $('add-preset-btn'),
        deletePresetBtn: $('delete-preset-btn'),
        savePresetBtn: $('save-preset-btn'),
        temperature: $('temperature'),
        topP: $('top-p'),
        frequencyPenalty: $('frequency-penalty'),
        presencePenalty: $('presence-penalty'),
        maxTokens: $('max-tokens'),
        maxTokensValue: $('max-tokens-value'),
        systemPrompt: $('system-prompt'),
        importFileInput: $('import-file-input'),
        tempValue: $('temp-value'),
        toppValue: $('topp-value'),
        freqValue: $('freq-value'),
        presValue: $('pres-value'),
        currentTokens: $('current-tokens'),
        lastResponseTokens: $('last-response-tokens'),
        sessionsList: $('sessions-list'),
        sessionSearch: $('session-search'),
        newChatBtn: $('new-chat-btn'),
        sessionsSidebar: $('sessions-sidebar'),
        configSidebar: $('config-sidebar'),
        overlay: $('overlay'),
        menuBtn: $('menu-btn'),
        configBtn: $('config-btn'),
        searchBtn: $('search-btn'),
        debugBtn: $('debug-btn'),
        mobileTitle: $('mobile-title'),
        toggleConfigBtn: $('toggle-config-btn'),
        closeConfigBtn: $('close-config-btn'),
        modalOverlay: $('modal-overlay'),
        modalMessage: $('modal-message'),
        modalCancel: $('modal-cancel'),
        modalConfirm: $('modal-confirm'),
        selectModeBtn: $('select-mode-btn'),
        selectionBar: $('selection-bar'),
        selectionCount: $('selection-count'),
        selShowBtn: $('sel-show-btn'),
        selHideBtn: $('sel-hide-btn'),
        selDeleteBtn: $('sel-delete-btn'),
        selCancelBtn: $('sel-cancel-btn'),
        inputArea: $('input-area'),
        inputSideButtons: $('input-side-buttons'),
        contextMenu: $('context-menu'),
        renameModal: $('rename-modal'),
        renameInput: $('rename-input'),
        renameCancel: $('rename-cancel'),
        renameConfirm: $('rename-confirm'),
        editModal: $('edit-modal'),
        editContent: $('edit-content'),
        editResend: $('edit-resend'),
        editCancel: $('edit-cancel'),
        editConfirm: $('edit-confirm'),
        createModal: $('create-modal'),
        createModalTitle: $('create-modal-title'),
        createInput: $('create-input'),
        createCancel: $('create-cancel'),
        createConfirm: $('create-confirm'),
        searchPanel: $('search-panel'),
        globalSearchInput: $('global-search-input'),
        searchClearBtn: $('search-clear-btn'),
        searchCloseBtn: $('search-close-btn'),
        searchResults: $('search-results'),
        debugPanel: $('debug-panel'),
        debugContent: $('debug-content'),
        debugClearBtn: $('debug-clear-btn'),
        debugCopyBtn: $('debug-copy-btn'),
        debugCloseBtn: $('debug-close-btn'),
        imageBtn: $('image-btn'),
        imageFileInput: $('image-file-input'),
        imagePreviewBar: $('image-preview-bar'),
        imagePreviewList: $('image-preview-list'),
        imageViewer: $('image-viewer'),
        imageViewerClose: $('image-viewer-close'),
        imageViewerImg: $('image-viewer-img'),
        noticeContainer: $('notice-container'),
        clearAllDataBtn: $('clear-all-data-btn')
    };

    // ========================================
    // 状态管理
    // ========================================
    let sessions = [];
    let currentSessionId = null;
    let lastResponseTokens = 0;
    let modalResolve = null;
    let isSelectMode = false;
    let selectedFloors = new Set();
    let contextTargetFloor = null;
    let contextTargetRole = null;
    let lastTitleClickTime = 0;
    let abortController = null;
    let isGenerating = false;
    let editingFloor = null;
    let presets = [];
    let currentPresetId = null;
    let apiConfigs = [];
    let currentApiConfigId = null;
    let createModalCallback = null;
    let cachedModels = [];
    let pendingImages = [];
    let searchDebounceTimer = null;
    let debugLogs = [];
    let renderBatchId = 0;

    // ========================================
    // 调试日志系统
    // ========================================
    function log(type, message, details = null) {
        const entry = {
            time: new Date().toLocaleTimeString(),
            type: type,
            message: message,
            details: details
        };

        debugLogs.push(entry);
        if (debugLogs.length > 500) {
            debugLogs.shift();
        }

        if (elements.debugPanel.classList.contains('active')) {
            appendDebugEntry(entry);
        }

        const consoleMethod = type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log';
        console[consoleMethod](`[${type.toUpperCase()}] ${message}`, details || '');
    }

    function appendDebugEntry(entry) {
        const div = document.createElement('div');
        div.className = `debug-entry ${entry.type}`;

        let html = `
            <span class="debug-time">${entry.time}</span>
            <span class="debug-type">${entry.type}</span>
            <span class="debug-message">${escapeHtml(entry.message)}</span>
        `;

        if (entry.details) {
            const detailsStr = typeof entry.details === 'object'
                ? JSON.stringify(entry.details, null, 2)
                : String(entry.details);
            html += `<div class="debug-details">${escapeHtml(detailsStr)}</div>`;
        }

        div.innerHTML = html;
        elements.debugContent.appendChild(div);
        elements.debugContent.scrollTop = elements.debugContent.scrollHeight;
    }

    function renderDebugLogs() {
        elements.debugContent.innerHTML = '';
        debugLogs.forEach(entry => appendDebugEntry(entry));
    }

    function clearDebugLogs() {
        debugLogs = [];
        elements.debugContent.innerHTML = '';
    }

    function copyDebugLogs() {
        const text = debugLogs.map(e => {
            let line = `[${e.time}] [${e.type.toUpperCase()}] ${e.message}`;
            if (e.details) {
                line += '\n' + (typeof e.details === 'object' ? JSON.stringify(e.details, null, 2) : e.details);
            }
            return line;
        }).join('\n\n');

        navigator.clipboard.writeText(text).then(() => {
            showNotice('日志已复制到剪贴板');
        }).catch(() => {
            showNotice('复制失败');
        });
    }

    function toggleDebugPanel() {
        if (elements.debugPanel.classList.contains('active')) {
            elements.debugPanel.classList.remove('active');
        } else {
            renderDebugLogs();
            elements.debugPanel.classList.add('active');
        }
    }

    // ========================================
    // 初始化
    // ========================================
    function initialize() {
        log('info', '应用初始化开始');

        configureMarked();
        loadAllData();
        bindEvents();
        updateSliderDisplays();

        if (sessions.length === 0) {
            createNewSession();
        } else {
            switchSession(sessions[0].id);
        }

        log('success', '应用初始化完成', {
            sessionsCount: sessions.length,
            presetsCount: presets.length,
            apiConfigsCount: apiConfigs.length
        });
    }

    function configureMarked() {
        if (window.marked) {
            marked.setOptions({
                breaks: true,
                gfm: true,
                highlight: function(code, lang) {
                    if (window.hljs && lang) {
                        try {
                            return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
                        } catch (e) {
                            log('warning', '代码高亮失败', { lang, error: e.message });
                        }
                    }
                    return code;
                }
            });
            log('info', 'Marked 配置完成');
        } else {
            log('warning', 'Marked 库未加载');
        }

        if (!window.DOMPurify) {
            log('warning', 'DOMPurify 库未加载，XSS防护可能受影响');
        }
    }

    function loadAllData() {
        sessions = JSON.parse(localStorage.getItem('sessions')) || [];
        lastResponseTokens = parseInt(localStorage.getItem('lastResponseTokens')) || 0;

        presets = JSON.parse(localStorage.getItem('presets')) || [];
        currentPresetId = localStorage.getItem('currentPresetId');

        if (presets.length === 0) {
            const defaultPreset = {
                id: 'default',
                name: '默认助手',
                systemPrompt: ''
            };
            presets.push(defaultPreset);
            currentPresetId = 'default';
            savePresets();
        }

        apiConfigs = JSON.parse(localStorage.getItem('apiConfigs')) || [];
        currentApiConfigId = localStorage.getItem('currentApiConfigId');

        if (apiConfigs.length === 0) {
            const defaultConfig = {
                id: 'default',
                name: '默认配置',
                url: '',
                key: '',
                model: 'gpt-4o',
                authType: 'bearer',
                useStream: true,
                timeout: 120
            };
            apiConfigs.push(defaultConfig);
            currentApiConfigId = 'default';
            saveApiConfigs();
        }

        elements.temperature.value = localStorage.getItem('temperature') || '0.7';
        elements.topP.value = localStorage.getItem('topP') || '1';
        elements.frequencyPenalty.value = localStorage.getItem('frequencyPenalty') || '0';
        elements.presencePenalty.value = localStorage.getItem('presencePenalty') || '0';
        elements.maxTokens.value = localStorage.getItem('maxTokens') || '0';

        renderApiConfigSelect();
        renderPresetSelect();
        loadCurrentApiConfig();
        loadCurrentPreset();
    }

    function savePresets() {
        localStorage.setItem('presets', JSON.stringify(presets));
        localStorage.setItem('currentPresetId', currentPresetId || '');
    }

    function saveApiConfigs() {
        localStorage.setItem('apiConfigs', JSON.stringify(apiConfigs));
        localStorage.setItem('currentApiConfigId', currentApiConfigId || '');
    }

    function saveSessions() {
        const cleanedSessions = sessions.map(session => ({
            ...session,
            messages: session.messages.map(msg => {
                const clean = { role: msg.role, content: msg.content };
                if (msg.hidden) clean.hidden = true;
                if (msg.images) clean.images = msg.images;
                return clean;
            })
        }));
        localStorage.setItem('sessions', JSON.stringify(cleanedSessions));
    }

    function saveConfig(key, value) {
        localStorage.setItem(key, value);
    }

    // ========================================
    // 清除所有本地数据
    // ========================================
    async function clearAllLocalData() {
        const confirmed = await showModal('⚠️ 这将删除所有本地数据（对话记录、API配置、预设等），确定继续吗？此操作不可撤销！');
        if (!confirmed) return;

        const doubleConfirm = await showModal('再次确认：真的要清除所有数据吗？');
        if (!doubleConfirm) return;

        localStorage.clear();
        showNotice('所有本地数据已清除，页面即将刷新...');
        setTimeout(() => {
            location.reload();
        }, 1500);
    }

    // ========================================
    // URL 验证与规范化
    // ========================================
    function normalizeApiUrl(rawUrl) {
        if (!rawUrl) return '';

        let url = rawUrl.trim();

        url = url.replace(/\/+$/, '');

        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
            log('info', 'URL自动补全协议头', { original: rawUrl, normalized: url });
        }

        try {
            new URL(url);
        } catch (e) {
            log('error', 'URL格式无效', { url: url, error: e.message });
            return '';
        }

        if (!url.includes('/chat/completions')) {
            if (/\/v\d+\/?$/i.test(url)) {
                url = url + '/chat/completions';
                log('info', 'URL自动补全路径', { original: rawUrl, normalized: url });
            }
        }

        return url;
    }

    function validateApiUrl(url) {
        if (!url) {
            return { valid: false, message: 'URL不能为空' };
        }

        try {
            const parsed = new URL(url);

            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return { valid: false, message: 'URL必须使用 http 或 https 协议' };
            }

            if (!parsed.hostname) {
                return { valid: false, message: 'URL缺少主机名' };
            }

            if (!url.includes('/chat/completions')) {
                return {
                    valid: true,
                    warning: 'URL中不包含 /chat/completions 路径，请确认是否正确'
                };
            }

            return { valid: true };
        } catch (e) {
            return { valid: false, message: `URL格式无效: ${e.message}` };
        }
    }

    // ========================================
    // 认证头构建
    // ========================================
    function buildAuthHeaders(apiKey, authType) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (authType === 'x-api-key') {
            headers['x-api-key'] = apiKey;
        } else {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        return headers;
    }

    // ========================================
    // API 配置管理
    // ========================================
    function renderApiConfigSelect() {
        elements.apiConfigSelect.innerHTML = '';
        apiConfigs.forEach(config => {
            const option = document.createElement('option');
            option.value = config.id;
            option.textContent = config.name;
            if (config.id === currentApiConfigId) {
                option.selected = true;
            }
            elements.apiConfigSelect.appendChild(option);
        });
    }

    function loadCurrentApiConfig() {
        const config = apiConfigs.find(c => c.id === currentApiConfigId);
        if (config) {
            elements.apiConfigName.value = config.name;
            elements.apiUrl.value = config.url;
            elements.apiKey.value = config.key;
            elements.apiModel.value = config.model;
            elements.authType.value = config.authType || 'bearer';
            elements.useStream.checked = config.useStream !== false;
            elements.requestTimeout.value = config.timeout || 120;
        }
        hideModelSelect();
    }

    function saveCurrentApiConfig() {
        const config = apiConfigs.find(c => c.id === currentApiConfigId);
        if (config) {
            const rawUrl = elements.apiUrl.value.trim();
            const normalizedUrl = normalizeApiUrl(rawUrl);

            const validation = validateApiUrl(normalizedUrl);
            if (!validation.valid) {
                showNotice(`URL错误: ${validation.message}`);
                log('error', 'API URL验证失败', { url: rawUrl, message: validation.message });
                return;
            }

            if (validation.warning) {
                log('warning', validation.warning, { url: normalizedUrl });
            }

            if (normalizedUrl !== rawUrl) {
                elements.apiUrl.value = normalizedUrl;
            }

            config.name = elements.apiConfigName.value.trim() || '未命名配置';
            config.url = normalizedUrl;
            config.key = elements.apiKey.value.trim();
            config.model = elements.apiModel.value.trim();
            config.authType = elements.authType.value;
            config.useStream = elements.useStream.checked;
            config.timeout = parseInt(elements.requestTimeout.value) || 120;
            saveApiConfigs();
            renderApiConfigSelect();
            showNotice('API配置已保存');
            log('info', 'API配置已保存', {
                name: config.name,
                url: config.url,
                model: config.model,
                authType: config.authType,
                useStream: config.useStream
            });
        }
    }

    function switchApiConfig(configId) {
        currentApiConfigId = configId;
        saveApiConfigs();
        loadCurrentApiConfig();
    }

    async function addApiConfig() {
        const name = await showCreateModal('新建API配置', '输入配置名称');
        if (!name) return;

        const newConfig = {
            id: Date.now().toString(),
            name: name,
            url: '',
            key: '',
            model: 'gpt-4o',
            authType: 'bearer',
            useStream: true,
            timeout: 120
        };
        apiConfigs.push(newConfig);
        currentApiConfigId = newConfig.id;
        saveApiConfigs();
        renderApiConfigSelect();
        loadCurrentApiConfig();
        showNotice('已创建新配置');
    }

    async function deleteApiConfig() {
        if (apiConfigs.length <= 1) {
            showNotice('至少保留一个配置');
            return;
        }

        const confirmed = await showModal('确定删除当前API配置吗？');
        if (!confirmed) return;

        const index = apiConfigs.findIndex(c => c.id === currentApiConfigId);
        if (index > -1) {
            apiConfigs.splice(index, 1);
            currentApiConfigId = apiConfigs[0].id;
            saveApiConfigs();
            renderApiConfigSelect();
            loadCurrentApiConfig();
            showNotice('配置已删除');
        }
    }

    // ========================================
    // API 连接测试
    // ========================================
    async function testApiConnection() {
        const rawUrl = elements.apiUrl.value.trim();
        const apiKey = elements.apiKey.value.trim();
        const model = elements.apiModel.value.trim();
        const authType = elements.authType.value;

        if (!rawUrl) {
            showNotice('请先填写 API URL');
            return;
        }

        if (!apiKey) {
            showNotice('请先填写 API Key');
            return;
        }

        const normalizedUrl = normalizeApiUrl(rawUrl);
        const validation = validateApiUrl(normalizedUrl);
        if (!validation.valid) {
            showNotice(`URL错误: ${validation.message}`);
            return;
        }

        if (normalizedUrl !== rawUrl) {
            elements.apiUrl.value = normalizedUrl;
        }

        elements.testApiBtn.disabled = true;
        elements.testApiBtn.textContent = '🔗 测试中...';

        log('info', '开始测试API连接', { url: normalizedUrl, model: model || 'gpt-4o', authType: authType });

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const requestBody = {
                model: model || 'gpt-4o',
                messages: [{ role: 'user', content: 'Hi' }],
                max_tokens: 5,
                stream: false
            };

            const headers = buildAuthHeaders(apiKey, authType);
            headers['Accept'] = 'application/json';

            const response = await fetch(normalizedUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            log('info', '测试连接响应', {
                status: response.status,
                statusText: response.statusText,
                contentType: response.headers.get('content-type')
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices?.[0]?.message?.content || '';
                showNotice(`✅ 连接成功！模型 ${model} 已响应`);
                log('success', '连接测试成功', {
                    model: data.model || model,
                    response: content.substring(0, 100)
                });
            } else {
                const errorText = await response.text();
                log('error', '连接测试失败', {
                    status: response.status,
                    body: errorText.substring(0, 500)
                });

                let errorMsg = `HTTP ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.error) {
                        errorMsg = typeof errorJson.error === 'string'
                            ? errorJson.error
                            : (errorJson.error.message || errorMsg);
                    }
                } catch (e) {
                    errorMsg = errorText.substring(0, 200);
                }

                showNotice(`❌ 连接失败: ${errorMsg}`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                showNotice('❌ 连接超时');
                log('error', '连接测试超时');
            } else {
                showNotice(`❌ 连接错误: ${error.message}`);
                log('error', '连接测试错误', { error: error.message });
            }
        } finally {
            elements.testApiBtn.disabled = false;
            elements.testApiBtn.textContent = '🔗 测试连接';
        }
    }

    // ========================================
    // 模型列表查询
    // ========================================
    function getModelsEndpoint(chatUrl) {
        try {
            const url = new URL(chatUrl);
            let pathname = url.pathname.replace(/\/+$/, '');

            if (pathname.includes('/chat/completions')) {
                pathname = pathname.replace('/chat/completions', '/models');
            } else if (pathname.includes('/completions')) {
                pathname = pathname.replace('/completions', '/models');
            } else {
                const versionMatch = pathname.match(/(\/v\d+)/);
                if (versionMatch) {
                    pathname = pathname.substring(0, pathname.indexOf(versionMatch[1]) + versionMatch[1].length) + '/models';
                } else {
                    pathname = pathname + '/models';
                }
            }

            url.pathname = pathname;
            return url.toString();
        } catch (e) {
            log('warning', '解析URL失败，使用简单替换', { error: e.message });
            return chatUrl.replace(/\/chat\/completions\/?$/, '/models');
        }
    }

    async function fetchAvailableModels() {
        let apiUrl = elements.apiUrl.value.trim();
        const apiKey = elements.apiKey.value.trim();
        const authType = elements.authType.value;

        if (!apiUrl) {
            showNotice('请先填写 API URL');
            return;
        }

        if (!apiKey) {
            showNotice('请先填写 API Key');
            return;
        }

        apiUrl = normalizeApiUrl(apiUrl);
        if (apiUrl !== elements.apiUrl.value.trim()) {
            elements.apiUrl.value = apiUrl;
        }

        const modelsUrl = getModelsEndpoint(apiUrl);
        log('info', '开始获取模型列表', { chatUrl: apiUrl, modelsUrl: modelsUrl, authType: authType });

        elements.fetchModelsBtn.disabled = true;
        elements.fetchModelsBtn.classList.add('loading');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const headers = buildAuthHeaders(apiKey, authType);
            headers['Accept'] = 'application/json';

            const response = await fetch(modelsUrl, {
                method: 'GET',
                headers: headers,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            log('info', '模型列表响应状态', { status: response.status, statusText: response.statusText });

            if (!response.ok) {
                const errorText = await response.text();
                log('error', '获取模型列表失败', { status: response.status, body: errorText.substring(0, 500) });
                throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
            }

            const data = await response.json();
            log('info', '模型列表原始响应', data);

            let models = [];

            if (Array.isArray(data)) {
                models = data;
            } else if (data.data && Array.isArray(data.data)) {
                models = data.data;
            } else if (data.models && Array.isArray(data.models)) {
                models = data.models;
            } else if (data.object === 'list' && data.data) {
                models = data.data;
            }

            cachedModels = models.map(m => {
                if (typeof m === 'string') return m;
                return m.id || m.name || m.model || (typeof m === 'object' ? JSON.stringify(m) : String(m));
            }).filter(Boolean);

            cachedModels.sort((a, b) => {
                const priority = ['gpt-4', 'gpt-3.5', 'claude', 'gemini', 'llama', 'mistral'];
                const aLower = a.toLowerCase();
                const bLower = b.toLowerCase();

                for (const p of priority) {
                    const aHas = aLower.includes(p);
                    const bHas = bLower.includes(p);
                    if (aHas && !bHas) return -1;
                    if (!aHas && bHas) return 1;
                }
                return a.localeCompare(b);
            });

            if (cachedModels.length === 0) {
                showNotice('未找到可用模型');
                log('warning', '模型列表为空');
                hideModelSelect();
            } else {
                showModelSelect(cachedModels);
                showNotice(`找到 ${cachedModels.length} 个可用模型`);
                log('success', `获取到 ${cachedModels.length} 个模型`, cachedModels.slice(0, 10));
            }

        } catch (error) {
            log('error', '获取模型列表失败', { error: error.message });

            if (error.name === 'AbortError') {
                showNotice('获取模型列表超时');
            } else {
                showNotice(`获取失败: ${error.message}`);
            }
            hideModelSelect();
        } finally {
            elements.fetchModelsBtn.disabled = false;
            elements.fetchModelsBtn.classList.remove('loading');
        }
    }

    function showModelSelect(models) {
        elements.modelSelect.innerHTML = '<option value="">-- 选择模型 --</option>';

        const currentModel = elements.apiModel.value.trim().toLowerCase();

        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;

            if (model.toLowerCase() === currentModel) {
                option.selected = true;
            }

            elements.modelSelect.appendChild(option);
        });

        elements.modelCount.textContent = `(${models.length}个)`;
        elements.modelSelectGroup.style.display = 'flex';
    }

    function hideModelSelect() {
        elements.modelSelectGroup.style.display = 'none';
        cachedModels = [];
    }

    function onModelSelectChange() {
        const selectedModel = elements.modelSelect.value;
        if (selectedModel) {
            elements.apiModel.value = selectedModel;
        }
    }

    // ========================================
    // 预设管理
    // ========================================
    function renderPresetSelect() {
        elements.presetSelect.innerHTML = '';
        presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.name;
            if (preset.id === currentPresetId) {
                option.selected = true;
            }
            elements.presetSelect.appendChild(option);
        });
    }

    function loadCurrentPreset() {
        const preset = presets.find(p => p.id === currentPresetId);
        if (preset) {
            elements.presetName.value = preset.name;
            elements.systemPrompt.value = preset.systemPrompt;
        }
    }

    function saveCurrentPreset() {
        const preset = presets.find(p => p.id === currentPresetId);
        if (preset) {
            preset.name = elements.presetName.value.trim() || '未命名预设';
            preset.systemPrompt = elements.systemPrompt.value;
            savePresets();
            renderPresetSelect();
            showNotice('预设已保存');
        }
    }

    function switchPreset(presetId) {
        currentPresetId = presetId;
        savePresets();
        loadCurrentPreset();
        updateTokenDisplay();
    }

    async function addPreset() {
        const name = await showCreateModal('新建预设', '输入预设名称');
        if (!name) return;

        const newPreset = {
            id: Date.now().toString(),
            name: name,
            systemPrompt: ''
        };
        presets.push(newPreset);
        currentPresetId = newPreset.id;
        savePresets();
        renderPresetSelect();
        loadCurrentPreset();
        showNotice('已创建新预设');
    }

    async function deletePreset() {
        if (presets.length <= 1) {
            showNotice('至少保留一个预设');
            return;
        }

        const confirmed = await showModal('确定删除当前预设吗？');
        if (!confirmed) return;

        const index = presets.findIndex(p => p.id === currentPresetId);
        if (index > -1) {
            presets.splice(index, 1);
            currentPresetId = presets[0].id;
            savePresets();
            renderPresetSelect();
            loadCurrentPreset();
            showNotice('预设已删除');
        }
    }

    // ========================================
    // 弹窗系统
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

    function showCreateModal(title, placeholder) {
        return new Promise((resolve) => {
            createModalCallback = resolve;
            elements.createModalTitle.textContent = title;
            elements.createInput.placeholder = placeholder;
            elements.createInput.value = '';
            elements.createModal.classList.add('active');
            setTimeout(() => elements.createInput.focus(), 100);
        });
    }

    function closeCreateModal(result) {
        elements.createModal.classList.remove('active');
        if (createModalCallback) {
            createModalCallback(result);
            createModalCallback = null;
        }
    }

    function showRenameModal() {
        const session = getCurrentSession();
        if (!session) return;

        elements.renameInput.value = session.title;
        elements.renameModal.classList.add('active');
        setTimeout(() => {
            elements.renameInput.focus();
            elements.renameInput.select();
        }, 100);
    }

    function closeRenameModal() {
        elements.renameModal.classList.remove('active');
    }

    function confirmRename() {
        const newTitle = elements.renameInput.value.trim();
        if (newTitle) {
            renameSession(newTitle);
            showNotice(`已重命名为：${newTitle}`);
        }
        closeRenameModal();
    }

    function showEditModal(floor) {
        const session = getCurrentSession();
        if (!session) return;

        const msg = session.messages[floor - 1];
        if (!msg) return;

        editingFloor = floor;
        elements.editContent.value = msg.content;
        elements.editResend.checked = false;

        const editOptionEl = elements.editResend.closest('.edit-option');
        if (editOptionEl) {
            editOptionEl.style.display = msg.role === 'user' ? '' : 'none';
        }

        elements.editModal.classList.add('active');
        setTimeout(() => {
            elements.editContent.focus();
            elements.editContent.setSelectionRange(
                elements.editContent.value.length,
                elements.editContent.value.length
            );
        }, 100);
    }

    function closeEditModal() {
        elements.editModal.classList.remove('active');
        editingFloor = null;
    }

    async function confirmEdit() {
        const session = getCurrentSession();
        if (!session || editingFloor === null) return;

        const newContent = elements.editContent.value.trim();
        if (!newContent) {
            showNotice('消息内容不能为空');
            return;
        }

        const idx = editingFloor - 1;
        const msg = session.messages[idx];
        const shouldResend = elements.editResend.checked && msg.role === 'user';

        if (shouldResend) {
            session.messages = session.messages.slice(0, idx);
            saveSessions();
            closeEditModal();

            elements.messageInput.value = newContent;
            await sendMessage();
        } else {
            msg.content = newContent;
            delete msg._renderedHtml;
            delete msg._renderedSource;
            saveSessions();

            const anchorFloor = editingFloor;
            const anchorOffset = getFloorOffset(anchorFloor);
            renderMessages(false, anchorFloor, anchorOffset);
            updateTokenDisplay();
            closeEditModal();
            showNotice('消息已修改');
        }
    }

    // ========================================
    // 滚动位置管理
    // ========================================
    function getFirstVisibleFloor() {
        const chatWindow = elements.chatWindow;
        const msgs = chatWindow.querySelectorAll('.message[data-floor]');
        const containerRect = chatWindow.getBoundingClientRect();

        for (const msgDiv of msgs) {
            const rect = msgDiv.getBoundingClientRect();
            if (rect.top >= containerRect.top - 10 || rect.bottom > containerRect.top + 10) {
                return parseInt(msgDiv.dataset.floor);
            }
        }

        if (msgs.length > 0) {
            return parseInt(msgs[msgs.length - 1].dataset.floor);
        }
        return null;
    }

    function getFloorOffset(floor) {
        const chatWindow = elements.chatWindow;
        const msgDiv = chatWindow.querySelector(`.message[data-floor="${floor}"]`);
        if (msgDiv) {
            const containerRect = chatWindow.getBoundingClientRect();
            const msgRect = msgDiv.getBoundingClientRect();
            return msgRect.top - containerRect.top;
        }
        return 0;
    }

    function scrollToFloorWithOffset(floor, offset) {
        const chatWindow = elements.chatWindow;
        const msgDiv = chatWindow.querySelector(`.message[data-floor="${floor}"]`);
        if (msgDiv) {
            const containerRect = chatWindow.getBoundingClientRect();
            const msgRect = msgDiv.getBoundingClientRect();
            const currentOffset = msgRect.top - containerRect.top;
            chatWindow.scrollTop += (currentOffset - offset);
        }
    }

    function findNearestFloor(targetFloor, totalMessages) {
        if (totalMessages === 0) return null;
        if (targetFloor >= 1 && targetFloor <= totalMessages) {
            return targetFloor;
        }
        if (targetFloor > totalMessages) {
            return totalMessages;
        }
        return 1;
    }

    // ========================================
    // 全局搜索
    // ========================================
    function openSearchPanel() {
        elements.searchPanel.classList.add('active');
        elements.globalSearchInput.value = '';
        elements.searchResults.innerHTML = `
            <div class="search-placeholder">
                <span class="search-placeholder-icon">💬</span>
                <p>输入关键词搜索对话内容</p>
            </div>
        `;
        setTimeout(() => elements.globalSearchInput.focus(), 100);
    }

    function closeSearchPanel() {
        elements.searchPanel.classList.remove('active');
        elements.globalSearchInput.value = '';
    }

    function performSearch(keyword) {
        if (!keyword.trim()) {
            elements.searchResults.innerHTML = `
                <div class="search-placeholder">
                    <span class="search-placeholder-icon">💬</span>
                    <p>输入关键词搜索对话内容</p>
                </div>
            `;
            return;
        }

        const results = [];
        const lowerKeyword = keyword.toLowerCase();

        sessions.forEach(session => {
            if (session.title.toLowerCase().includes(lowerKeyword)) {
                results.push({
                    sessionId: session.id,
                    sessionTitle: session.title,
                    floor: null,
                    content: session.title,
                    type: 'title'
                });
            }

            session.messages.forEach((msg, index) => {
                if (msg.content && msg.content.toLowerCase().includes(lowerKeyword)) {
                    results.push({
                        sessionId: session.id,
                        sessionTitle: session.title,
                        floor: index + 1,
                        content: msg.content,
                        role: msg.role,
                        type: 'message'
                    });
                }
            });
        });

        renderSearchResults(results, keyword);
    }

    function renderSearchResults(results, keyword) {
        if (results.length === 0) {
            elements.searchResults.innerHTML = `
                <div class="search-no-results">
                    <div class="search-no-results-icon">🔍</div>
                    <p>未找到相关内容</p>
                </div>
            `;
            return;
        }

        elements.searchResults.innerHTML = '';

        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'search-result-item';

            const header = document.createElement('div');
            header.className = 'search-result-header';

            const title = document.createElement('span');
            title.className = 'search-result-title';
            title.textContent = result.sessionTitle;

            const meta = document.createElement('span');
            meta.className = 'search-result-meta';
            if (result.type === 'title') {
                meta.textContent = '对话标题';
            } else {
                meta.textContent = `${result.floor}楼 · ${result.role === 'user' ? '用户' : 'AI'}`;
            }

            header.appendChild(title);
            header.appendChild(meta);

            const content = document.createElement('div');
            content.className = 'search-result-content';
            content.innerHTML = highlightKeyword(result.content, keyword);

            item.appendChild(header);
            item.appendChild(content);

            item.addEventListener('click', () => {
                closeSearchPanel();
                switchSession(result.sessionId);

                if (result.floor) {
                    setTimeout(() => {
                        scrollToFloor(result.floor);
                    }, 300);
                }
            });

            elements.searchResults.appendChild(item);
        });
    }

    function highlightKeyword(text, keyword) {
        if (!keyword) return escapeHtml(text);

        const lowerText = text.toLowerCase();
        const lowerKeyword = keyword.toLowerCase();
        const index = lowerText.indexOf(lowerKeyword);

        if (index === -1) return escapeHtml(text.substring(0, 200));

        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + keyword.length + 100);

        let excerpt = text.substring(start, end);
        if (start > 0) excerpt = '...' + excerpt;
        if (end < text.length) excerpt = excerpt + '...';

        const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi');
        return escapeHtml(excerpt).replace(regex, '<mark>$1</mark>');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function scrollToFloor(floor) {
        const msgDiv = elements.chatWindow.querySelector(`.message[data-floor="${floor}"]`);
        if (msgDiv) {
            msgDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            msgDiv.classList.add('highlight');
            setTimeout(() => msgDiv.classList.remove('highlight'), 2000);
        } else {
            showNotice(`找不到第 ${floor} 楼`);
        }
    }

    function filterSessionsList(keyword) {
        const items = elements.sessionsList.querySelectorAll('.session-item');
        const lowerKeyword = keyword.toLowerCase();

        items.forEach(item => {
            const title = item.querySelector('.session-title').textContent.toLowerCase();
            if (title.includes(lowerKeyword)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    // ========================================
    // 图片处理
    // ========================================
    function openImagePicker() {
        elements.imageFileInput.click();
    }

    function handleImageSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                showNotice('只支持图片文件');
                return;
            }

            if (file.size > 20 * 1024 * 1024) {
                showNotice('图片大小不能超过20MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                pendingImages.push({
                    id: Date.now() + Math.random(),
                    data: e.target.result,
                    name: file.name,
                    type: file.type
                });
                updateImagePreview();
            };
            reader.readAsDataURL(file);
        });

        event.target.value = '';
    }

    function updateImagePreview() {
        if (pendingImages.length === 0) {
            elements.imagePreviewBar.classList.remove('active');
            elements.imageBtn.classList.remove('has-images');
            return;
        }

        elements.imagePreviewBar.classList.add('active');
        elements.imageBtn.classList.add('has-images');

        elements.imagePreviewList.innerHTML = '';

        pendingImages.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'image-preview-item';

            const thumb = document.createElement('img');
            thumb.className = 'image-preview-thumb';
            thumb.src = img.data;
            thumb.alt = img.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'image-preview-remove';
            removeBtn.textContent = '✕';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                pendingImages.splice(index, 1);
                updateImagePreview();
            };

            item.appendChild(thumb);
            item.appendChild(removeBtn);
            elements.imagePreviewList.appendChild(item);
        });
    }

    function clearPendingImages() {
        pendingImages = [];
        updateImagePreview();
    }

    function openImageViewer(src) {
        elements.imageViewerImg.src = src;
        elements.imageViewer.classList.add('active');
    }

    function closeImageViewer() {
        elements.imageViewer.classList.remove('active');
        elements.imageViewerImg.src = '';
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
            exitSelectMode();
            clearPendingImages();
            renderMessages(true);
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

            const meta = document.createElement('span');
            meta.className = 'session-meta';
            meta.textContent = `${session.messages.length}条`;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'session-delete';
            deleteBtn.textContent = '✕';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteSession(session.id);
            };

            item.appendChild(title);
            item.appendChild(meta);
            item.appendChild(deleteBtn);
            item.onclick = () => switchSession(session.id);

            elements.sessionsList.appendChild(item);
        });
    }

    // ========================================
    // 选择模式
    // ========================================
    function enterSelectMode() {
        isSelectMode = true;
        selectedFloors.clear();
        elements.selectModeBtn.classList.add('active');
        elements.selectionBar.classList.add('active');
        elements.inputArea.classList.add('hidden');
        elements.imagePreviewBar.classList.remove('active');
        updateSelectionUI();

        const anchorFloor = getFirstVisibleFloor();
        const anchorOffset = anchorFloor ? getFloorOffset(anchorFloor) : 0;
        renderMessages(false, anchorFloor, anchorOffset);
    }

    function exitSelectMode() {
        if (!isSelectMode) return;

        const anchorFloor = getFirstVisibleFloor();
        const anchorOffset = anchorFloor ? getFloorOffset(anchorFloor) : 0;

        isSelectMode = false;
        selectedFloors.clear();
        elements.selectModeBtn.classList.remove('active');
        elements.selectionBar.classList.remove('active');
        elements.inputArea.classList.remove('hidden');
        if (pendingImages.length > 0) {
            elements.imagePreviewBar.classList.add('active');
        }

        renderMessages(false, anchorFloor, anchorOffset);
    }

    function toggleSelectMode() {
        if (isSelectMode) {
            exitSelectMode();
        } else {
            const session = getCurrentSession();
            if (session && session.messages.length > 0) {
                enterSelectMode();
            } else {
                showNotice('当前没有消息可选择');
            }
        }
    }

    function toggleFloorSelection(floor) {
        if (selectedFloors.has(floor)) {
            selectedFloors.delete(floor);
        } else {
            selectedFloors.add(floor);
        }
        updateSelectionUI();
        updateMessageSelectionState(floor);
    }

    function updateSelectionUI() {
        const count = selectedFloors.size;
        elements.selectionCount.textContent = `已选择 ${count} 条`;

        const hasSelection = count > 0;
        elements.selShowBtn.disabled = !hasSelection;
        elements.selHideBtn.disabled = !hasSelection;
        elements.selDeleteBtn.disabled = !hasSelection;
    }

    function updateMessageSelectionState(floor) {
        const msgDiv = elements.chatWindow.querySelector(`.message[data-floor="${floor}"]`);
        if (msgDiv) {
            if (selectedFloors.has(floor)) {
                msgDiv.classList.add('selected');
            } else {
                msgDiv.classList.remove('selected');
            }
        }
    }

    async function executeSelectionAction(action) {
        const session = getCurrentSession();
        if (!session || selectedFloors.size === 0) return;

        const anchorFloor = getFirstVisibleFloor();
        const anchorOffset = anchorFloor ? getFloorOffset(anchorFloor) : 0;

        const floors = Array.from(selectedFloors).sort((a, b) => a - b);

        if (action === 'delete') {
            const confirmed = await showModal(`确定删除选中的 ${floors.length} 条消息吗？`);
            if (!confirmed) return;
        }

        let count = 0;

        if (action === 'delete') {
            const sortedDesc = floors.sort((a, b) => b - a);
            sortedDesc.forEach(floor => {
                const idx = floor - 1;
                if (idx >= 0 && idx < session.messages.length) {
                    session.messages.splice(idx, 1);
                    count++;
                }
            });
            showNotice(`已删除 ${count} 条消息`);
        } else if (action === 'hide') {
            floors.forEach(floor => {
                const idx = floor - 1;
                if (idx >= 0 && idx < session.messages.length) {
                    session.messages[idx].hidden = true;
                    count++;
                }
            });
            showNotice(`已隐藏 ${count} 条消息`);
        } else if (action === 'show') {
            floors.forEach(floor => {
                const idx = floor - 1;
                if (idx >= 0 && idx < session.messages.length && session.messages[idx].hidden) {
                    session.messages[idx].hidden = false;
                    count++;
                }
            });
            showNotice(`已显示 ${count} 条消息`);
        }

        saveSessions();

        isSelectMode = false;
        selectedFloors.clear();
        elements.selectModeBtn.classList.remove('active');
        elements.selectionBar.classList.remove('active');
        elements.inputArea.classList.remove('hidden');
        if (pendingImages.length > 0) {
            elements.imagePreviewBar.classList.add('active');
        }

        let restoreFloor = anchorFloor;
        if (action === 'delete' && anchorFloor) {
            restoreFloor = findNearestFloor(anchorFloor, session.messages.length);
        }

        renderMessages(false, restoreFloor, anchorOffset);
        updateTokenDisplay();
    }

    // ========================================
    // 右键菜单
    // ========================================
    function showContextMenu(x, y, floor, role) {
        const session = getCurrentSession();
        if (!session) return;

        contextTargetFloor = floor;
        contextTargetRole = role;
        const msg = session.messages[floor - 1];
        if (!msg) return;

        const showBtn = elements.contextMenu.querySelector('[data-action="show"]');
        const hideBtn = elements.contextMenu.querySelector('[data-action="hide"]');
        const regenerateBtn = elements.contextMenu.querySelector('[data-action="regenerate"]');
        const editBtn = elements.contextMenu.querySelector('[data-action="edit"]');

        if (msg.hidden) {
            showBtn.classList.remove('hidden');
            hideBtn.classList.add('hidden');
        } else {
            showBtn.classList.add('hidden');
            hideBtn.classList.remove('hidden');
        }

        if (role === 'assistant') {
            regenerateBtn.classList.remove('hidden');
        } else {
            regenerateBtn.classList.add('hidden');
        }

        editBtn.classList.remove('hidden');

        elements.contextMenu.style.left = `${x}px`;
        elements.contextMenu.style.top = `${y}px`;
        elements.contextMenu.classList.add('active');

        requestAnimationFrame(() => {
            const rect = elements.contextMenu.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                elements.contextMenu.style.left = `${window.innerWidth - rect.width - 10}px`;
            }
            if (rect.bottom > window.innerHeight) {
                elements.contextMenu.style.top = `${window.innerHeight - rect.height - 10}px`;
            }
        });
    }

    function hideContextMenu() {
        elements.contextMenu.classList.remove('active');
        contextTargetFloor = null;
        contextTargetRole = null;
    }

    async function executeContextAction(action) {
        const session = getCurrentSession();
        if (!session || contextTargetFloor === null) return;

        const idx = contextTargetFloor - 1;
        const msg = session.messages[idx];
        if (!msg) return;
        const floor = contextTargetFloor;

        hideContextMenu();

        const anchorFloor = getFirstVisibleFloor();
        const anchorOffset = anchorFloor ? getFloorOffset(anchorFloor) : 0;

        switch (action) {
            case 'copy':
                try {
                    await navigator.clipboard.writeText(msg.content);
                    showNotice('已复制到剪贴板');
                } catch (e) {
                    const textarea = document.createElement('textarea');
                    textarea.value = msg.content;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    try {
                        document.execCommand('copy');
                        showNotice('已复制到剪贴板');
                    } catch (e2) {
                        showNotice('复制失败');
                    }
                    document.body.removeChild(textarea);
                }
                break;
            case 'edit':
                showEditModal(floor);
                break;
            case 'regenerate':
                await regenerateMessage(floor);
                break;
            case 'hide':
                msg.hidden = true;
                delete msg._renderedHtml;
                delete msg._renderedSource;
                saveSessions();
                renderMessages(false, anchorFloor, anchorOffset);
                updateTokenDisplay();
                showNotice(`已隐藏第 ${floor} 楼`);
                break;
            case 'show':
                msg.hidden = false;
                delete msg._renderedHtml;
                delete msg._renderedSource;
                saveSessions();
                renderMessages(false, anchorFloor, anchorOffset);
                updateTokenDisplay();
                showNotice(`已显示第 ${floor} 楼`);
                break;
            case 'delete': {
                const confirmed = await showModal(`确定删除第 ${floor} 楼消息吗？`);
                if (confirmed) {
                    session.messages.splice(idx, 1);
                    saveSessions();
                    const restoreFloor = findNearestFloor(anchorFloor, session.messages.length);
                    renderMessages(false, restoreFloor, anchorOffset);
                    updateTokenDisplay();
                    showNotice(`已删除第 ${floor} 楼`);
                }
                break;
            }
        }
    }

    async function regenerateMessage(floor) {
        const session = getCurrentSession();
        if (!session) return;

        const idx = floor - 1;
        const msg = session.messages[idx];

        if (msg.role !== 'assistant') {
            showNotice('只能重新生成AI的回复');
            return;
        }

        session.messages = session.messages.slice(0, idx);
        saveSessions();
        renderMessages(true);

        await requestAIResponse();
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
    // 输入框高度变化处理
    // ========================================
    function handleInputResize() {
        const input = elements.messageInput;
        input.style.height = 'auto';
        const newHeight = Math.min(input.scrollHeight, 120);
        input.style.height = newHeight + 'px';

        if (newHeight > 60) {
            elements.inputSideButtons.classList.add('vertical');
            elements.inputArea.classList.add('expanded');
        } else {
            elements.inputSideButtons.classList.remove('vertical');
            elements.inputArea.classList.remove('expanded');
        }
    }

    // ========================================
    // 事件绑定
    // ========================================
    function bindEvents() {
        elements.sendButton.addEventListener('click', sendMessage);
        elements.stopButton.addEventListener('click', stopGeneration);

        elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        elements.messageInput.addEventListener('input', handleInputResize);

        elements.newChatBtn.addEventListener('click', createNewSession);

        elements.menuBtn.addEventListener('click', openSessionsSidebar);
        elements.configBtn.addEventListener('click', openConfigSidebar);
        elements.searchBtn.addEventListener('click', openSearchPanel);
        elements.debugBtn.addEventListener('click', toggleDebugPanel);
        elements.toggleConfigBtn.addEventListener('click', () => {
            closeSidebars();
            setTimeout(openConfigSidebar, 150);
        });
        elements.closeConfigBtn.addEventListener('click', closeSidebars);
        elements.overlay.addEventListener('click', closeSidebars);

        elements.debugCloseBtn.addEventListener('click', () => {
            elements.debugPanel.classList.remove('active');
        });
        elements.debugClearBtn.addEventListener('click', clearDebugLogs);
        elements.debugCopyBtn.addEventListener('click', copyDebugLogs);

        elements.sessionSearch.addEventListener('input', (e) => {
            filterSessionsList(e.target.value);
        });

        elements.searchCloseBtn.addEventListener('click', closeSearchPanel);
        elements.searchClearBtn.addEventListener('click', () => {
            elements.globalSearchInput.value = '';
            elements.globalSearchInput.focus();
            performSearch('');
        });
        elements.globalSearchInput.addEventListener('input', (e) => {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                performSearch(e.target.value);
            }, 300);
        });

        elements.modalCancel.addEventListener('click', () => closeModal(false));
        elements.modalConfirm.addEventListener('click', () => closeModal(true));
        elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.modalOverlay) closeModal(false);
        });

        elements.createCancel.addEventListener('click', () => closeCreateModal(null));
        elements.createConfirm.addEventListener('click', () => {
            const value = elements.createInput.value.trim();
            closeCreateModal(value || null);
        });
        elements.createInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const value = elements.createInput.value.trim();
                closeCreateModal(value || null);
            } else if (e.key === 'Escape') {
                closeCreateModal(null);
            }
        });
        elements.createModal.addEventListener('click', (e) => {
            if (e.target === elements.createModal) closeCreateModal(null);
        });

        elements.mobileTitle.addEventListener('click', () => {
            const now = Date.now();
            if (now - lastTitleClickTime < 300) {
                showRenameModal();
                lastTitleClickTime = 0;
            } else {
                lastTitleClickTime = now;
            }
        });

        elements.renameCancel.addEventListener('click', closeRenameModal);
        elements.renameConfirm.addEventListener('click', confirmRename);
        elements.renameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                confirmRename();
            } else if (e.key === 'Escape') {
                closeRenameModal();
            }
        });
        elements.renameModal.addEventListener('click', (e) => {
            if (e.target === elements.renameModal) closeRenameModal();
        });

        elements.editCancel.addEventListener('click', closeEditModal);
        elements.editConfirm.addEventListener('click', confirmEdit);
        elements.editModal.addEventListener('click', (e) => {
            if (e.target === elements.editModal) closeEditModal();
        });

        elements.selectModeBtn.addEventListener('click', toggleSelectMode);
        elements.selShowBtn.addEventListener('click', () => executeSelectionAction('show'));
        elements.selHideBtn.addEventListener('click', () => executeSelectionAction('hide'));
        elements.selDeleteBtn.addEventListener('click', () => executeSelectionAction('delete'));
        elements.selCancelBtn.addEventListener('click', exitSelectMode);

        elements.contextMenu.addEventListener('click', (e) => {
            const item = e.target.closest('.context-item');
            if (item) {
                const action = item.dataset.action;
                if (action) {
                    executeContextAction(action);
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!elements.contextMenu.contains(e.target) && !e.target.classList.contains('msg-edit-btn')) {
                hideContextMenu();
            }
        });

        elements.imageBtn.addEventListener('click', openImagePicker);
        elements.imageFileInput.addEventListener('change', handleImageSelect);
        elements.imageViewerClose.addEventListener('click', closeImageViewer);
        elements.imageViewer.addEventListener('click', (e) => {
            if (e.target === elements.imageViewer) closeImageViewer();
        });

        elements.apiConfigSelect.addEventListener('change', (e) => {
            switchApiConfig(e.target.value);
        });
        elements.addApiConfigBtn.addEventListener('click', addApiConfig);
        elements.deleteApiConfigBtn.addEventListener('click', deleteApiConfig);
        elements.saveApiConfigBtn.addEventListener('click', saveCurrentApiConfig);
        elements.testApiBtn.addEventListener('click', testApiConnection);

        elements.fetchModelsBtn.addEventListener('click', fetchAvailableModels);
        elements.modelSelect.addEventListener('change', onModelSelectChange);

        elements.presetSelect.addEventListener('change', (e) => {
            switchPreset(e.target.value);
        });
        elements.addPresetBtn.addEventListener('click', addPreset);
        elements.deletePresetBtn.addEventListener('click', deletePreset);
        elements.savePresetBtn.addEventListener('click', saveCurrentPreset);

        elements.temperature.addEventListener('input', () => {
            elements.tempValue.textContent = elements.temperature.value;
        });
        elements.temperature.addEventListener('change', () => {
            saveConfig('temperature', elements.temperature.value);
        });

        elements.topP.addEventListener('input', () => {
            elements.toppValue.textContent = elements.topP.value;
        });
        elements.topP.addEventListener('change', () => {
            saveConfig('topP', elements.topP.value);
        });

        elements.frequencyPenalty.addEventListener('input', () => {
            elements.freqValue.textContent = elements.frequencyPenalty.value;
        });
        elements.frequencyPenalty.addEventListener('change', () => {
            saveConfig('frequencyPenalty', elements.frequencyPenalty.value);
        });

        elements.presencePenalty.addEventListener('input', () => {
            elements.presValue.textContent = elements.presencePenalty.value;
        });
        elements.presencePenalty.addEventListener('change', () => {
            saveConfig('presencePenalty', elements.presencePenalty.value);
        });

        elements.maxTokens.addEventListener('input', () => {
            elements.maxTokensValue.textContent = elements.maxTokens.value;
        });
        elements.maxTokens.addEventListener('change', () => {
            saveConfig('maxTokens', elements.maxTokens.value);
        });

        elements.importFileInput.addEventListener('change', handleImport);

        if (elements.clearAllDataBtn) {
            elements.clearAllDataBtn.addEventListener('click', clearAllLocalData);
        }

        elements.apiUrl.addEventListener('blur', () => {
            const rawUrl = elements.apiUrl.value.trim();
            if (rawUrl) {
                const normalized = normalizeApiUrl(rawUrl);
                if (normalized && normalized !== rawUrl) {
                    elements.apiUrl.value = normalized;
                    log('info', 'URL已自动规范化', { from: rawUrl, to: normalized });
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                createNewSession();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                openSearchPanel();
            }
            if (e.key === 'Escape') {
                if (elements.searchPanel.classList.contains('active')) {
                    closeSearchPanel();
                } else if (elements.imageViewer.classList.contains('active')) {
                    closeImageViewer();
                } else if (elements.debugPanel.classList.contains('active')) {
                    elements.debugPanel.classList.remove('active');
                } else {
                    closeSidebars();
                    hideContextMenu();
                    if (isSelectMode) exitSelectMode();
                }
            }
        });
    }

    function updateSliderDisplays() {
        elements.tempValue.textContent = elements.temperature.value;
        elements.toppValue.textContent = elements.topP.value;
        elements.freqValue.textContent = elements.frequencyPenalty.value;
        elements.presValue.textContent = elements.presencePenalty.value;
        elements.maxTokensValue.textContent = elements.maxTokens.value;
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
                if (msg.images && msg.images.length > 0) {
                    total += msg.images.length * 85;
                }
            }
        });

        return total;
    }

    function updateTokenDisplay() {
        elements.currentTokens.textContent = calculateCurrentTokens().toLocaleString();
        elements.lastResponseTokens.textContent = lastResponseTokens.toLocaleString();
    }

    // ========================================
    // 指令系统
    // ========================================
    function executeCommand(input) {
        const session = getCurrentSession();
        if (!session) return;

        const anchorFloor = getFirstVisibleFloor();
        const anchorOffset = anchorFloor ? getFloorOffset(anchorFloor) : 0;

        const parts = input.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const arg = parts.slice(1).join(' ');

        switch (command) {
            case '/goto': {
                if (!arg) {
                    showNotice('用法：/goto 楼层号');
                    return;
                }
                const targetFloor = parseInt(arg);
                if (isNaN(targetFloor) || targetFloor < 1) {
                    showNotice('请输入有效的楼层号');
                    return;
                }
                if (targetFloor > session.messages.length) {
                    showNotice(`最大楼层号为 ${session.messages.length}`);
                    return;
                }
                scrollToFloor(targetFloor);
                return;
            }
            case '/hide':
            case '/del':
            case '/show': {
                if (!arg) {
                    showNotice(`用法：${command} 1-5 或 ${command} 5`);
                    return;
                }
                const range = arg.split('-').map(s => parseInt(s.trim()));
                let [start, end] = range;
                if (isNaN(start)) {
                    showNotice('无效的楼层数字');
                    return;
                }
                end = isNaN(end) ? start : end;
                if (start > end) [start, end] = [end, start];

                start = Math.max(1, start);
                end = Math.min(end, session.messages.length);

                if (start > session.messages.length) {
                    showNotice(`楼层范围超出（最大 ${session.messages.length}）`);
                    return;
                }

                const startIdx = start - 1;
                const endIdx = end;

                if (command === '/hide') {
                    let count = 0;
                    for (let i = startIdx; i < endIdx; i++) {
                        session.messages[i].hidden = true;
                        count++;
                    }
                    showNotice(`已隐藏 ${count} 条消息（${start}-${end}楼）`);
                } else if (command === '/show') {
                    let count = 0;
                    for (let i = startIdx; i < endIdx; i++) {
                        if (session.messages[i].hidden) {
                            session.messages[i].hidden = false;
                            delete session.messages[i]._renderedHtml;
                            delete session.messages[i]._renderedSource;
                            count++;
                        }
                    }
                    showNotice(`已显示 ${count} 条消息（${start}-${end}楼）`);
                } else {
                    const deleteCount = endIdx - startIdx;
                    session.messages.splice(startIdx, deleteCount);
                    showNotice(`已删除 ${deleteCount} 条消息`);
                }
                break;
            }
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
                    showRenameModal();
                }
                return;
            case '/export':
                exportChat();
                return;
            case '/import':
                elements.importFileInput.click();
                return;
            default:
                showNotice(`未知指令：${command}。可用指令：/goto /hide /show /del /clear /rename /export /import`);
                return;
        }

        saveSessions();

        let restoreFloor = anchorFloor;
        if (command === '/del' && anchorFloor) {
            restoreFloor = findNearestFloor(anchorFloor, session.messages.length);
        }

        if (command === '/clear') {
            renderMessages(true);
        } else {
            renderMessages(false, restoreFloor, anchorOffset);
        }
        updateTokenDisplay();
    }

    // ========================================
    // 通知显示
    // ========================================
    function showNotice(text) {
        const notice = document.createElement('div');
        notice.className = 'top-notice';
        notice.textContent = text;
        elements.noticeContainer.appendChild(notice);

        requestAnimationFrame(() => {
            notice.classList.add('show');
        });

        setTimeout(() => {
            notice.classList.remove('show');
            notice.classList.add('hide');
            setTimeout(() => notice.remove(), 300);
        }, 3000);
    }

    // ========================================
    // 导入/导出
    // ========================================
    function exportChat() {
        const session = getCurrentSession();
        if (!session) return;

        const exportData = {
            title: session.title,
            messages: session.messages.map(m => {
                const clean = { role: m.role, content: m.content };
                if (m.hidden) clean.hidden = true;
                if (m.images) clean.images = m.images;
                return clean;
            }),
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
    // 停止生成
    // ========================================
    function stopGeneration() {
        if (abortController) {
            abortController.abort();
            abortController = null;
        }
        setLoading(false);
        showNotice('已停止生成');
        log('info', '用户停止生成');
    }

    // ========================================
    // API 通信
    // ========================================
    async function sendMessage() {
        const session = getCurrentSession();
        if (!session) return;

        const text = elements.messageInput.value.trim();
        const hasImages = pendingImages.length > 0;

        if (!text && !hasImages) return;

        if (text.startsWith('/')) {
            executeCommand(text);
            elements.messageInput.value = '';
            elements.messageInput.style.height = 'auto';
            handleInputResize();
            return;
        }

        const config = apiConfigs.find(c => c.id === currentApiConfigId);
        if (!config || !config.url || !config.key) {
            showNotice('请先在设置中配置 API');
            return;
        }

        const normalizedUrl = normalizeApiUrl(config.url);
        if (!normalizedUrl) {
            showNotice('API URL 格式无效，请检查设置');
            return;
        }

        if (normalizedUrl !== config.url) {
            config.url = normalizedUrl;
            saveApiConfigs();
            log('info', 'API URL已自动规范化', { url: normalizedUrl });
        }

        const userMessage = {
            role: 'user',
            content: text,
            hidden: false
        };

        if (hasImages) {
            userMessage.images = pendingImages.map(img => ({
                data: img.data,
                type: img.type
            }));
        }

        session.messages.push(userMessage);
        autoRenameSession(text);
        renderMessages(true);
        elements.messageInput.value = '';
        elements.messageInput.style.height = 'auto';
        handleInputResize();
        clearPendingImages();

        await requestAIResponse();
    }

    async function requestAIResponse() {
        const session = getCurrentSession();
        if (!session) return;

        const config = apiConfigs.find(c => c.id === currentApiConfigId);
        if (!config || !config.url || !config.key) {
            showNotice('请先配置 API');
            return;
        }

        const apiUrl = normalizeApiUrl(config.url);
        if (!apiUrl) {
            showNotice('API URL 无效');
            return;
        }

        const useStream = config.useStream !== false;
        const timeout = (config.timeout || 120) * 1000;
        const authType = config.authType || 'bearer';

        setLoading(true);
        abortController = new AbortController();

        log('info', '开始请求AI响应', {
            url: apiUrl,
            model: config.model,
            stream: useStream,
            authType: authType,
            timeout: timeout / 1000 + 's',
            messagesCount: session.messages.filter(m => !m.hidden).length
        });

        const timeoutId = setTimeout(() => {
            if (abortController) {
                abortController.abort();
                log('warning', '请求超时');
            }
        }, timeout);

        try {
            const context = [];

            const systemPrompt = elements.systemPrompt.value.trim();
            if (systemPrompt) {
                context.push({ role: 'system', content: systemPrompt });
            }

            session.messages.forEach(m => {
                if (!m.hidden) {
                    if (m.images && m.images.length > 0) {
                        const contentParts = [];

                        m.images.forEach(img => {
                            contentParts.push({
                                type: 'image_url',
                                image_url: {
                                    url: img.data
                                }
                            });
                        });

                        if (m.content) {
                            contentParts.push({
                                type: 'text',
                                text: m.content
                            });
                        }

                        context.push({
                            role: m.role,
                            content: contentParts
                        });
                    } else {
                        context.push({ role: m.role, content: m.content });
                    }
                }
            });

            const requestBody = {
                model: config.model,
                messages: context,
                stream: useStream,
                temperature: parseFloat(elements.temperature.value),
                top_p: parseFloat(elements.topP.value),
                frequency_penalty: parseFloat(elements.frequencyPenalty.value),
                presence_penalty: parseFloat(elements.presencePenalty.value)
            };

            const maxTokens = parseInt(elements.maxTokens.value);
            if (maxTokens > 0) {
                requestBody.max_tokens = maxTokens;
            }

            const headers = buildAuthHeaders(config.key, authType);
            headers['Accept'] = useStream ? 'text/event-stream' : 'application/json';

            log('info', '发送请求', {
                url: apiUrl,
                model: config.model,
                stream: useStream,
                contextLength: context.length
            });

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
                signal: abortController.signal
            });

            clearTimeout(timeoutId);

            log('info', '收到响应', {
                status: response.status,
                statusText: response.statusText,
                contentType: response.headers.get('content-type')
            });

            if (!response.ok) {
                const errorText = await response.text();
                log('error', 'API返回错误', {
                    status: response.status,
                    body: errorText.substring(0, 1000)
                });

                let errorMessage = `API 错误 ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.error) {
                        if (typeof errorJson.error === 'string') {
                            errorMessage = errorJson.error;
                        } else if (errorJson.error.message) {
                            errorMessage = errorJson.error.message;
                        }
                    }
                } catch (e) {
                    errorMessage = errorText.substring(0, 200);
                }

                throw new Error(errorMessage);
            }

            const assistantMsg = { role: 'assistant', content: '', hidden: false };
            session.messages.push(assistantMsg);
            const msgIndex = session.messages.length - 1;

            renderMessages(true);

            if (useStream) {
                await handleStreamResponse(response, session, msgIndex);
            } else {
                await handleNonStreamResponse(response, session, msgIndex);
            }

            delete session.messages[msgIndex]._renderedHtml;
            delete session.messages[msgIndex]._renderedSource;

            lastResponseTokens = estimateTokens(session.messages[msgIndex].content);
            localStorage.setItem('lastResponseTokens', lastResponseTokens.toString());

            log('success', 'AI响应完成', {
                contentLength: session.messages[msgIndex].content.length,
                estimatedTokens: lastResponseTokens
            });

        } catch (err) {
            clearTimeout(timeoutId);

            if (err.name === 'AbortError') {
                log('warning', '请求被中止（超时或用户取消）');
                showNotice('请求超时或已取消');
            } else {
                log('error', '请求失败', { error: err.message });
                showNotice(`请求失败: ${err.message}`);
            }
        } finally {
            abortController = null;
            saveSessions();
            updateTokenDisplay();
            setLoading(false);
        }
    }

    async function handleStreamResponse(response, session, msgIndex) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let receivedAnyContent = false;

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    log('info', '流式响应结束');
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) continue;

                    if (!trimmedLine.startsWith('data: ')) {
                        if (trimmedLine.startsWith('{')) {
                            try {
                                const json = JSON.parse(trimmedLine);
                                const content = json.choices?.[0]?.delta?.content ||
                                               json.choices?.[0]?.message?.content || '';
                                if (content) {
                                    receivedAnyContent = true;
                                    session.messages[msgIndex].content += content;
                                    updateLastMessage(session.messages[msgIndex]);
                                }
                            } catch (e) {
                                // 忽略
                            }
                        }
                        continue;
                    }

                    const dataStr = trimmedLine.slice(6).trim();
                    if (dataStr === '[DONE]') {
                        log('info', '收到[DONE]信号');
                        continue;
                    }

                    try {
                        const json = JSON.parse(dataStr);
                        const content = json.choices?.[0]?.delta?.content || '';
                        if (content) {
                            receivedAnyContent = true;
                            session.messages[msgIndex].content += content;
                            updateLastMessage(session.messages[msgIndex]);
                        }
                    } catch (e) {
                        log('warning', 'SSE数据解析失败', {
                            data: dataStr.substring(0, 200),
                            error: e.message
                        });
                    }
                }
            }
        } catch (e) {
            if (e.name !== 'AbortError') {
                log('error', '流式读取错误', { error: e.message });
            }
            throw e;
        }

        if (!receivedAnyContent) {
            log('warning', '流式响应未收到任何内容');
            session.messages[msgIndex].content = '（未收到响应内容）';
            updateLastMessage(session.messages[msgIndex]);
        }
    }

    async function handleNonStreamResponse(response, session, msgIndex) {
        try {
            const data = await response.json();
            log('info', '非流式响应数据', data);

            const content = data.choices?.[0]?.message?.content ||
                           data.content ||
                           data.response ||
                           '';

            if (content) {
                session.messages[msgIndex].content = content;
                updateLastMessage(session.messages[msgIndex]);
            } else {
                log('warning', '非流式响应无内容', data);
                session.messages[msgIndex].content = '（未收到响应内容）';
                updateLastMessage(session.messages[msgIndex]);
            }
        } catch (e) {
            log('error', '非流式响应解析失败', { error: e.message });
            throw e;
        }
    }

    function setLoading(loading) {
        isGenerating = loading;
        if (loading) {
            elements.sendButton.classList.add('hidden');
            elements.stopButton.classList.remove('hidden');
        } else {
            elements.sendButton.classList.remove('hidden');
            elements.stopButton.classList.add('hidden');
        }
    }

    // ========================================
    // Markdown 渲染（带缓存）
    // ========================================
    function getCachedRenderedContent(msg) {
        if (msg._renderedHtml && msg._renderedSource === msg.content) {
            return msg._renderedHtml;
        }

        const html = renderMarkdown(msg.content);
        msg._renderedHtml = html;
        msg._renderedSource = msg.content;
        return html;
    }

    function renderMarkdown(text) {
        if (!text) return '';

        try {
            if (window.marked) {
                let html = marked.parse(text);
                if (window.DOMPurify) {
                    html = DOMPurify.sanitize(html);
                }
                return html;
            }
        } catch (e) {
            log('warning', 'Markdown渲染失败', { error: e.message });
        }

        return escapeHtml(text)
            .replace(/\n/g, '<br>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    // ========================================
    // 渲染系统
    // ========================================
    function renderMessages(scrollToBottom = true, anchorFloor = null, anchorOffset = 0) {
        const session = getCurrentSession();

        renderBatchId++;
        const currentBatchId = renderBatchId;

        elements.chatWindow.innerHTML = '';

        if (!session || session.messages.length === 0) {
            elements.chatWindow.appendChild(createWelcomeScreen());
            return;
        }

        const messages = session.messages;
        const totalMessages = messages.length;
        const BATCH_SIZE = 30;

        if (totalMessages <= BATCH_SIZE) {
            const fragment = document.createDocumentFragment();
            messages.forEach((msg, index) => {
                fragment.appendChild(createMessageElement(msg, index + 1));
            });
            elements.chatWindow.appendChild(fragment);
            processCodeBlocks();

            if (scrollToBottom) {
                elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
            } else if (anchorFloor !== null) {
                requestAnimationFrame(() => {
                    scrollToFloorWithOffset(anchorFloor, anchorOffset);
                });
            }
            return;
        }

        let index = 0;

        function renderBatch() {
            if (currentBatchId !== renderBatchId) return;

            const fragment = document.createDocumentFragment();
            const end = Math.min(index + BATCH_SIZE, totalMessages);

            for (let i = index; i < end; i++) {
                fragment.appendChild(createMessageElement(messages[i], i + 1));
            }

            elements.chatWindow.appendChild(fragment);
            index = end;

            if (index < totalMessages) {
                requestAnimationFrame(renderBatch);
            } else {
                processCodeBlocks();

                if (scrollToBottom) {
                    elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
                } else if (anchorFloor !== null) {
                    requestAnimationFrame(() => {
                        scrollToFloorWithOffset(anchorFloor, anchorOffset);
                    });
                }
            }
        }

        renderBatch();
    }

    function createWelcomeScreen() {
        const welcome = document.createElement('div');
        welcome.className = 'welcome-screen';
        welcome.innerHTML = `
            <div class="welcome-icon">💬</div>
            <h2>开始新对话</h2>
            <p>输入消息开始聊天，或使用以下快捷操作</p>
            <div class="welcome-tips">
                <div class="tip-item">📝 双击标题可重命名</div>
                <div class="tip-item">✏️ 点击消息右上角铅笔可快速操作</div>
                <div class="tip-item">🖼️ 点击图片按钮可发送图片</div>
                <div class="tip-item">🔍 Ctrl+F 搜索所有对话</div>
                <div class="tip-item">📌 /goto 楼层号 跳转到指定楼层</div>
                <div class="tip-item">🔧 点击调试按钮查看日志</div>
                <div class="tip-item">🔒 所有数据仅存储在本地浏览器</div>
            </div>
        `;
        return welcome;
    }

    function createMessageElement(msg, floor) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${msg.role}`;
        msgDiv.dataset.floor = floor;

        if (msg.hidden) {
            msgDiv.classList.add('hidden-msg');
        }

        if (isSelectMode) {
            msgDiv.classList.add('selectable');
            if (selectedFloors.has(floor)) {
                msgDiv.classList.add('selected');
            }
        }

        const metaDiv = document.createElement('div');
        metaDiv.className = 'message-meta';

        const floorSpan = document.createElement('span');
        floorSpan.className = 'floor-num';
        floorSpan.textContent = `${floor}楼`;

        const tokenSpan = document.createElement('span');
        tokenSpan.className = 'token-count';
        let tokenCount = estimateTokens(msg.content);
        if (msg.images && msg.images.length > 0) {
            tokenCount += msg.images.length * 85;
        }
        tokenSpan.textContent = `${tokenCount} t`;

        metaDiv.appendChild(floorSpan);
        metaDiv.appendChild(tokenSpan);

        if (msg.hidden) {
            const hiddenTag = document.createElement('span');
            hiddenTag.className = 'hidden-tag';
            hiddenTag.textContent = '已隐藏';
            hiddenTag.title = '此消息已隐藏（不计入上下文）';
            metaDiv.appendChild(hiddenTag);
        }

        msgDiv.appendChild(metaDiv);

        if (!isSelectMode) {
            const editBtn = document.createElement('button');
            editBtn.className = 'msg-edit-btn';
            editBtn.textContent = '✏️';
            editBtn.title = '操作菜单';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                const rect = editBtn.getBoundingClientRect();
                showContextMenu(rect.left, rect.bottom + 5, floor, msg.role);
            };
            msgDiv.appendChild(editBtn);
        }

        if (msg.images && msg.images.length > 0) {
            const imagesDiv = document.createElement('div');
            imagesDiv.className = 'message-images';

            msg.images.forEach(img => {
                const imgEl = document.createElement('img');
                imgEl.className = 'message-image';
                imgEl.src = img.data;
                imgEl.alt = '图片';
                imgEl.loading = 'lazy';
                imgEl.onclick = (e) => {
                    e.stopPropagation();
                    openImageViewer(img.data);
                };
                imagesDiv.appendChild(imgEl);
            });

            msgDiv.appendChild(imagesDiv);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';

        if (msg.content) {
            contentDiv.innerHTML = getCachedRenderedContent(msg);
        } else if (!msg.images || msg.images.length === 0) {
            contentDiv.innerHTML = '<span class="typing-indicator">正在思考...</span>';
        }

        msgDiv.appendChild(contentDiv);

        if (isSelectMode) {
            msgDiv.addEventListener('click', (e) => {
                e.preventDefault();
                toggleFloorSelection(floor);
            });
        }

        return msgDiv;
    }

    function updateLastMessage(msg) {
        const messages = elements.chatWindow.querySelectorAll('.message');
        const lastMsgDiv = messages[messages.length - 1];

        if (lastMsgDiv) {
            const contentDiv = lastMsgDiv.querySelector('.content');
            const tokenSpan = lastMsgDiv.querySelector('.token-count');

            contentDiv.innerHTML = renderMarkdown(msg.content);
            tokenSpan.textContent = `${estimateTokens(msg.content)} t`;

            processCodeBlocks();
            elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
        }
    }

    function processCodeBlocks() {
        elements.chatWindow.querySelectorAll('pre code').forEach(codeBlock => {
            const pre = codeBlock.parentElement;

            if (pre.parentElement && pre.parentElement.classList.contains('code-block-wrapper')) return;

            const classes = codeBlock.className.split(' ');
            let lang = '';
            for (const cls of classes) {
                if (cls.startsWith('language-')) {
                    lang = cls.replace('language-', '');
                    break;
                }
            }

            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper collapsed';

            const header = document.createElement('div');
            header.className = 'code-block-header';

            const leftPart = document.createElement('div');
            leftPart.className = 'code-header-left';

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'code-toggle-btn';
            toggleBtn.textContent = '▶';
            toggleBtn.title = '展开/折叠代码';

            const langSpan = document.createElement('span');
            langSpan.className = 'code-block-lang';
            langSpan.textContent = lang || 'code';

            leftPart.appendChild(toggleBtn);
            leftPart.appendChild(langSpan);

            const copyBtn = document.createElement('button');
            copyBtn.className = 'code-copy-btn';
            copyBtn.textContent = '复制';
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    copyBtn.textContent = '已复制';
                    setTimeout(() => copyBtn.textContent = '复制', 2000);
                }).catch(() => {
                    showNotice('复制失败');
                });
            };

            header.appendChild(leftPart);
            header.appendChild(copyBtn);

            header.addEventListener('click', (e) => {
                if (e.target === copyBtn) return;
                wrapper.classList.toggle('collapsed');
                toggleBtn.textContent = wrapper.classList.contains('collapsed') ? '▶' : '▼';
            });

            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(header);
            wrapper.appendChild(pre);

            if (window.hljs && lang) {
                try {
                    hljs.highlightElement(codeBlock);
                } catch (e) {
                    // 忽略不支持的语言
                }
            }
        });
    }

    // ========================================
    // 启动
    // ========================================
    initialize();
});