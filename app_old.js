// 应用状态
let appState = {
    words: [],
    currentCardIndex: 0,
    filterUnknown: false,
    isFlipped: false
};

// DOM 元素
const elements = {
    uploadSection: document.getElementById('upload-section'),
    wordsSection: document.getElementById('words-section'),
    cardSection: document.getElementById('card-section'),
    uploadArea: document.getElementById('upload-area'),
    uploadBtn: document.getElementById('upload-btn'),
    fileInput: document.getElementById('file-input'),
    fileInfo: document.getElementById('file-info'),
    wordsList: document.getElementById('words-list'),
    wordCount: document.getElementById('word-count'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    flashcard: document.getElementById('flashcard'),
    wordDisplay: document.getElementById('word-display'),
    wordDisplayBack: document.getElementById('word-display-back'),
    definitionDisplay: document.getElementById('definition-display'),
    currentCard: document.getElementById('current-card'),
    totalCards: document.getElementById('total-cards'),
    filterUnknownBtn: document.getElementById('filter-unknown'),
    resetProgressBtn: document.getElementById('reset-progress'),
    clearWordsBtn: document.getElementById('clear-words'),
    backToListBtn: document.getElementById('back-to-list'),
    dontKnowBtn: document.getElementById('dont-know'),
    knowBtn: document.getElementById('know'),
    prevCardBtn: document.getElementById('prev-card'),
    nextCardBtn: document.getElementById('next-card')
};

// 初始化
function init() {
    loadWordsFromStorage();
    setupEventListeners();
    if (appState.words.length > 0) {
        showWordsSection();
    }
}

// 事件监听器
function setupEventListeners() {
    // 上传相关
    elements.uploadBtn.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // 拖拽上传
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    
    // 控制按钮
    elements.filterUnknownBtn.addEventListener('click', toggleFilter);
    elements.resetProgressBtn.addEventListener('click', resetProgress);
    elements.clearWordsBtn.addEventListener('click', clearWords);
    elements.backToListBtn.addEventListener('click', showWordsSection);
    
    // 卡片操作
    elements.flashcard.addEventListener('click', flipCard);
    elements.dontKnowBtn.addEventListener('click', () => markWord(false));
    elements.knowBtn.addEventListener('click', () => markWord(true));
    elements.prevCardBtn.addEventListener('click', () => navigateCard(-1));
    elements.nextCardBtn.addEventListener('click', () => navigateCard(1));
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboard);
}

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.yaml') || file.name.endsWith('.yml'))) {
        processYAML(file);
    } else {
        alert('请选择有效的YAML文件（.yaml 或 .yml）');
    }
}

// 拖拽处理
function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.yaml') || file.name.endsWith('.yml'))) {
        processYAML(file);
    } else {
        alert('请选择有效的YAML文件（.yaml 或 .yml）');
    }
}

// 处理YAML文件
async function processYAML(file) {
    elements.fileInfo.textContent = `正在处理: ${file.name}...`;
    elements.fileInfo.classList.remove('hidden');
    
    try {
        const text = await file.text();
        const yamlData = jsyaml.load(text);
        
        // 从YAML中提取文本内容
        const allText = extractTextFromYAML(yamlData);
        
        // 提取单词（不含释义）
        const wordsList = extractWords(allText);
        
        if (wordsList.length === 0) {
            alert('未能从YAML文件中提取到单词');
            return;
        }
        
        elements.fileInfo.textContent = `正在获取 ${wordsList.length} 个单词的释义...`;
        
        // 批量获取单词释义
        const wordsWithDefinitions = await fetchDefinitionsForWords(wordsList);
        
        // 合并新单词到现有单词列表
        mergeWords(wordsWithDefinitions);
        saveWordsToStorage();
        showWordsSection();
        
        elements.fileInfo.textContent = `✓ 成功提取 ${wordsWithDefinitions.length} 个单词！`;
        setTimeout(() => {
            elements.fileInfo.classList.add('hidden');
        }, 3000);
        
    } catch (error) {
        console.error('YAML处理错误:', error);
        alert('YAML文件解析失败，请确保文件格式正确');
        elements.fileInfo.classList.add('hidden');
    }
}

// 从YAML数据中递归提取所有文本
function extractTextFromYAML(data) {
    let text = '';
    
    if (typeof data === 'string') {
        text += data + ' ';
    } else if (Array.isArray(data)) {
        data.forEach(item => {
            text += extractTextFromYAML(item);
        });
    } else if (typeof data === 'object' && data !== null) {
        Object.values(data).forEach(value => {
            text += extractTextFromYAML(value);
        });
    }
    
    return text;
}

// 提取单词
function extractWords(text) {
    // 提取所有英文单词（3个字母以上）
    const wordMatches = text.match(/\b[a-zA-Z]{3,}\b/g);
    if (!wordMatches) return [];
    
    // 统计词频并去重
    const wordFrequency = {};
    wordMatches.forEach(word => {
        const lower = word.toLowerCase();
        wordFrequency[lower] = (wordFrequency[lower] || 0) + 1;
    });
    
    // 过滤常见词并转换为对象数组
    const commonWords = new Set([
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one',
        'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old',
        'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too',
        'use', 'this', 'that', 'with', 'have', 'from', 'they', 'what', 'been', 'more', 'when',
        'will', 'would', 'there', 'their', 'which', 'about', 'could', 'these', 'first', 'other',
        'than', 'then', 'them', 'some', 'time', 'very', 'were', 'said', 'each', 'tell', 'does',
        'must', 'upon', 'also', 'into', 'many', 'most', 'over', 'such', 'take', 'only', 'year',
        'come', 'work', 'made', 'make', 'well', 'back', 'call', 'came', 'down', 'even', 'find',
        'give', 'good', 'just', 'keep', 'know', 'last', 'left', 'like', 'long', 'look', 'much'
    ]);
    
    const words = Object.entries(wordFrequency)
        .filter(([word, freq]) => !commonWords.has(word) && freq >= 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100) // 限制最多100个单词（因为需要调用API）
        .map(([word]) => word);
    
    return words;
}

// 批量获取单词释义
async function fetchDefinitionsForWords(wordsList) {
    const wordsWithDefinitions = [];
    const batchSize = 3; // 每次处理3个单词（减少批量大小以适应AI API）
    
    for (let i = 0; i < wordsList.length; i += batchSize) {
        const batch = wordsList.slice(i, i + batchSize);
        const promises = batch.map(word => fetchSimpleDefinition(word));
        const results = await Promise.all(promises);
        wordsWithDefinitions.push(...results);
        
        // 更新进度
        const progress = Math.min(i + batchSize, wordsList.length);
        elements.fileInfo.textContent = `正在获取简单释义... ${progress}/${wordsList.length}`;
    }
    
    return wordsWithDefinitions;
}

// 使用AI生成简单易懂的释义
async function fetchSimpleDefinition(word) {
    try {
        // 添加超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
        
        // 方法1: 先尝试使用词典API获取基础定义，然后简化
        const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (dictResponse.ok) {
            const data = await dictResponse.json();
            const firstEntry = data[0];
            
            let simpleDefinition = '';
            
            if (firstEntry.meanings && firstEntry.meanings.length > 0) {
                const firstMeaning = firstEntry.meanings[0];
                const partOfSpeech = firstMeaning.partOfSpeech || '';
                
                if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
                    const originalDef = firstMeaning.definitions[0].definition;
                    
                    // 简化定义：移除复杂词汇，使用更简单的表达
                    simpleDefinition = simplifyDefinition(originalDef, word, partOfSpeech);
                    
                    // 添加例句（如果有且不太长）
                    if (firstMeaning.definitions[0].example) {
                        const example = firstMeaning.definitions[0].example;
                        if (example.length < 80) {
                            simpleDefinition += `\n\nExample: ${example}`;
                        }
                    }
                }
            }
            
            return {
                word: word,
                definition: simpleDefinition || getBasicDefinition(word),
                known: false,
                timestamp: Date.now()
            };
        } else {
            // 如果词典API失败，使用备用简化方法
            return {
                word: word,
                definition: getBasicDefinition(word),
                known: false,
                timestamp: Date.now()
            };
        }
    } catch (error) {
        console.warn(`获取单词 "${word}" 释义失败，使用备用方案:`, error.message);
        // 网络错误或超时，使用本地生成的简单定义
        return {
            word: word,
            definition: getBasicDefinition(word),
            known: false,
            timestamp: Date.now()
        };
    }
}

// 简化定义文本
function simplifyDefinition(definition, word, partOfSpeech) {
    // 移除复杂的语法结构和难词
    let simplified = definition;
    
    // 替换复杂词汇为简单词汇
    const replacements = {
        'pertaining to': 'about',
        'relating to': 'about',
        'regarding': 'about',
        'concerning': 'about',
        'associated with': 'connected to',
        'characterized by': 'having',
        'possessing': 'having',
        'utilize': 'use',
        'obtain': 'get',
        'acquire': 'get',
        'demonstrate': 'show',
        'indicate': 'show',
        'represent': 'show',
        'constitute': 'make up',
        'comprise': 'include',
        'facilitate': 'help',
        'implement': 'do',
        'execute': 'do',
        'perform': 'do',
        'conduct': 'do',
        'establish': 'set up',
        'designate': 'name',
        'denote': 'mean',
        'signify': 'mean',
        'exemplify': 'show',
        'illustrate': 'show',
        'manifest': 'show',
        'exhibit': 'show'
    };
    
    for (const [complex, simple] of Object.entries(replacements)) {
        const regex = new RegExp(complex, 'gi');
        simplified = simplified.replace(regex, simple);
    }
    
    // 移除过于技术性的短语
    simplified = simplified.replace(/\(.*?\)/g, ''); // 移除括号内容
    simplified = simplified.replace(/;.*$/, ''); // 移除分号后内容
    
    // 确保首字母大写
    simplified = simplified.trim();
    if (simplified.length > 0) {
        simplified = simplified.charAt(0).toUpperCase() + simplified.slice(1);
    }
    
    // 如果定义太长，截取前80个字符
    if (simplified.length > 120) {
        simplified = simplified.substring(0, 120).trim() + '...';
    }
    
    return simplified;
}

// 备用：生成基础定义
function getBasicDefinition(word) {
    // 基于单词常见模式生成简单定义
    const lowerWord = word.toLowerCase();
    
    // 检查动词形式
    if (lowerWord.endsWith('ing')) {
        const base = lowerWord.slice(0, -3);
        return `Doing the action of ${base}`;
    }
    if (lowerWord.endsWith('ed')) {
        const base = lowerWord.slice(0, -2);
        return `Did the action of ${base} in the past`;
    }
    
    // 检查名词/形容词后缀
    const patterns = {
        'tion$': 'The action or result of doing something',
        'sion$': 'The action or result of doing something',
        'ment$': 'The result or state of something',
        'ness$': 'The quality or state of being something',
        'able$': 'Can be done or is possible to do',
        'ible$': 'Can be done or is possible to do',
        'ful$': 'Full of this quality or having this',
        'less$': 'Without this quality',
        'ize$': 'To make or become something',
        'ise$': 'To make or become something',
        'ify$': 'To make something into this',
        'ly$': 'In this kind of way',
        'er$': 'A person or thing that does this',
        'or$': 'A person or thing that does this',
        'ist$': 'A person who does or studies this',
        'ism$': 'A belief or system about this',
        'ive$': 'Related to or tending to do this',
        'ous$': 'Having the quality of this',
        'al$': 'Related to or about this',
        'ic$': 'Related to or like this'
    };
    
    for (const [pattern, meaning] of Object.entries(patterns)) {
        if (new RegExp(pattern).test(lowerWord)) {
            return meaning;
        }
    }
    
    // 检查复数形式
    if (lowerWord.endsWith('s') && lowerWord.length > 3) {
        return `More than one of something`;
    }
    
    // 默认释义
    return `A word with meaning related to "${word}"`;
}

// 合并单词
function mergeWords(newWords) {
    const existingWords = new Map(appState.words.map(w => [w.word.toLowerCase(), w]));
    
    newWords.forEach(word => {
        const key = word.word.toLowerCase();
        if (!existingWords.has(key)) {
            appState.words.push(word);
        }
    });
    
    // 按字母排序
    appState.words.sort((a, b) => a.word.localeCompare(b.word));
}

// 显示单词列表
function showWordsSection() {
    elements.uploadSection.classList.add('hidden');
    elements.cardSection.classList.add('hidden');
    elements.wordsSection.classList.remove('hidden');
    
    renderWordsList();
    updateProgress();
}

// 渲染单词列表
function renderWordsList() {
    const wordsToShow = appState.filterUnknown 
        ? appState.words.filter(w => !w.known)
        : appState.words;
    
    elements.wordCount.textContent = wordsToShow.length;
    elements.wordsList.innerHTML = '';
    
    wordsToShow.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = `word-item ${word.known ? 'known' : ''}`;
        wordItem.innerHTML = `
            <div class="word">${word.word}</div>
            <div class="definition">${word.definition}</div>
            <div class="status">${word.known ? '✓' : ''}</div>
        `;
        wordItem.addEventListener('click', () => startCardMode(index));
        elements.wordsList.appendChild(wordItem);
    });
}

// 更新进度
function updateProgress() {
    const knownCount = appState.words.filter(w => w.known).length;
    const totalCount = appState.words.length;
    const percentage = totalCount > 0 ? (knownCount / totalCount) * 100 : 0;
    
    elements.progressFill.style.width = `${percentage}%`;
    elements.progressText.textContent = `已掌握: ${knownCount}/${totalCount}`;
}

// 开始卡片模式
function startCardMode(startIndex = 0) {
    const wordsToShow = appState.filterUnknown 
        ? appState.words.filter(w => !w.known)
        : appState.words;
    
    if (wordsToShow.length === 0) {
        alert('没有可学习的单词');
        return;
    }
    
    appState.currentCardIndex = startIndex;
    elements.wordsSection.classList.add('hidden');
    elements.cardSection.classList.remove('hidden');
    elements.totalCards.textContent = wordsToShow.length;
    
    showCard();
}

// 显示卡片
function showCard() {
    const wordsToShow = appState.filterUnknown 
        ? appState.words.filter(w => !w.known)
        : appState.words;
    
    if (wordsToShow.length === 0) {
        showWordsSection();
        return;
    }
    
    // 确保索引有效
    if (appState.currentCardIndex >= wordsToShow.length) {
        appState.currentCardIndex = 0;
    }
    
    const currentWord = wordsToShow[appState.currentCardIndex];
    
    elements.currentCard.textContent = appState.currentCardIndex + 1;
    elements.wordDisplay.textContent = currentWord.word;
    elements.wordDisplayBack.textContent = currentWord.word;
    elements.definitionDisplay.textContent = currentWord.definition;
    
    // 重置翻转状态
    elements.flashcard.classList.remove('flipped');
    appState.isFlipped = false;
}

// 翻转卡片
function flipCard() {
    elements.flashcard.classList.toggle('flipped');
    appState.isFlipped = !appState.isFlipped;
}

// 标记单词
function markWord(known) {
    const wordsToShow = appState.filterUnknown 
        ? appState.words.filter(w => !w.known)
        : appState.words;
    
    const currentWord = wordsToShow[appState.currentCardIndex];
    const originalIndex = appState.words.findIndex(w => w.word === currentWord.word);
    
    appState.words[originalIndex].known = known;
    saveWordsToStorage();
    updateProgress();
    
    // 自动下一张
    navigateCard(1);
}

// 卡片导航
function navigateCard(direction) {
    const wordsToShow = appState.filterUnknown 
        ? appState.words.filter(w => !w.known)
        : appState.words;
    
    appState.currentCardIndex += direction;
    
    if (appState.currentCardIndex < 0) {
        appState.currentCardIndex = wordsToShow.length - 1;
    } else if (appState.currentCardIndex >= wordsToShow.length) {
        appState.currentCardIndex = 0;
    }
    
    showCard();
}

// 切换过滤
function toggleFilter() {
    appState.filterUnknown = !appState.filterUnknown;
    elements.filterUnknownBtn.textContent = appState.filterUnknown ? '显示全部' : '只看未掌握';
    renderWordsList();
}

// 重置进度
function resetProgress() {
    if (confirm('确定要重置所有学习进度吗？')) {
        appState.words.forEach(word => word.known = false);
        saveWordsToStorage();
        renderWordsList();
        updateProgress();
    }
}

// 清空单词
function clearWords() {
    if (confirm('确定要清空所有单词吗？此操作不可恢复！')) {
        appState.words = [];
        saveWordsToStorage();
        elements.wordsSection.classList.add('hidden');
        elements.cardSection.classList.add('hidden');
        elements.uploadSection.classList.remove('hidden');
    }
}

// 键盘快捷键
function handleKeyboard(e) {
    if (elements.cardSection.classList.contains('hidden')) return;
    
    switch(e.key) {
        case ' ':
        case 'Enter':
            e.preventDefault();
            flipCard();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            navigateCard(-1);
            break;
        case 'ArrowRight':
            e.preventDefault();
            navigateCard(1);
            break;
        case '1':
            e.preventDefault();
            markWord(false);
            break;
        case '2':
            e.preventDefault();
            markWord(true);
            break;
    }
}

// 本地存储
function saveWordsToStorage() {
    localStorage.setItem('ielts_words', JSON.stringify(appState.words));
}

function loadWordsFromStorage() {
    const stored = localStorage.getItem('ielts_words');
    if (stored) {
        appState.words = JSON.parse(stored);
    }
}

// 启动应用
init();
