# 📚 IELTS 单词记忆卡 (Vue 3 + Vite + AI)

一个现代化的单词记忆网站，使用 Vue 3 + Vite 构建，支持上传 YAML 文件提取单词，并通过 AI 生成简单易懂的英文释义，以卡片形式进行记忆训练。

## ✨ 功能特点

- 📄 **YAML文件上传**: 支持拖拽或点击上传YAML文档（.yaml 或 .yml）
- 🤖 **AI智能释义**: 使用Google Gemini AI或本地算法生成简单易懂的英文解释
- 🎴 **翻转卡片学习**: 优雅的3D卡片翻转动画，沉浸式学习体验
- 📊 **学习进度追踪**: 实时显示已掌握单词数量和进度条
- 🎯 **筛选功能**: 可选择只显示未掌握的单词
- 💾 **本地存储**: 数据保存在浏览器本地，无需后端服务器
- ⌨️ **键盘快捷键**: 
  - `空格`/`回车`: 翻转卡片
  - `←` / `→`: 切换上/下一张
  - `1`: 标记不认识
  - `2`: 标记认识
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🚀 **Vite代理**: 解决API跨域问题

## 🛠️ 技术栈

- **Vue 3**: 组合式API，现代化前端框架
- **Vite**: 极速的构建工具和开发服务器
- **js-yaml**: YAML解析库
- **Google Gemini AI** (可选): AI生成简单释义
- **Vite Proxy**: 解决跨域请求问题
- **LocalStorage**: 浏览器本地存储
- **CSS3动画**: 流畅的视觉效果

## 🚀 快速开始

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 配置API Key（可选）

如果你想使用Google Gemini AI生成更智能的释义：

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取API Key
2. 复制 `.env.example` 为 `.env`
3. 在 `.env` 中填入你的API Key：
   \`\`\`
   VITE_GEMINI_API_KEY=your_actual_api_key
   \`\`\`

> **注意**: 如果不配置API Key，系统会自动使用本地算法生成释义，功能完全可用。

### 3. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 `http://localhost:3000` 即可使用。

### 4. 构建生产版本

\`\`\`bash
npm run build
\`\`\`

构建后的文件在 `dist` 目录中。

## 📖 使用说明

1. **上传YAML**: 点击上传区域或拖拽YAML文件到页面
2. **自动解析**: 系统自动提取单词并生成简单的英文释义
3. **查看单词**: 浏览单词列表，查看释义
4. **学习模式**: 点击任意单词卡片进入学习模式
5. **标记掌握**: 点击卡片翻转查看释义，标记是否认识
6. **进度管理**: 查看学习进度，支持重置进度或清空单词

## 📋 YAML文件示例

\`\`\`yaml
vocabulary:
  - word: "academic"
    definition: "学术的"
  - word: "hypothesis" 
    definition: "假设"
  - word: "methodology"
    definition: "方法论"

content: "The comprehensive analysis demonstrates remarkable achievements"
notes: "Students should practice vocabulary consistently"
\`\`\`

## 📁 项目结构

\`\`\`
IELTS_words/
├── src/
│   ├── components/
│   │   ├── UploadSection.vue    # 文件上传组件
│   │   ├── WordsList.vue        # 单词列表组件
│   │   └── FlashCards.vue       # 学习卡片组件
│   ├── utils/
│   │   ├── wordExtractor.js     # 单词提取工具
│   │   └── aiService.js         # AI释义服务
│   ├── App.vue                  # 主应用组件
│   ├── main.js                  # 入口文件
│   └── style.css                # 全局样式
├── index.html                   # HTML模板
├── vite.config.js              # Vite配置
├── package.json                # 项目配置
├── .env.example                # 环境变量示例
└── README.md                   # 项目说明
\`\`\`

## 🔧 配置说明

### Vite代理配置

项目已配置Vite代理解决跨域问题：

\`\`\`javascript
proxy: {
  '/api': {
    target: 'https://api.dictionaryapi.dev',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
\`\`\`

这样所有 `/api` 开头的请求都会被代理到词典API，避免跨域问题。

## 📝 注意事项

- YAML文件需要是有效的YAML格式
- 系统会递归提取YAML中所有字符串值中的英文单词
- AI释义需要配置API Key，否则使用本地算法
- 为避免API调用过多，单次最多提取100个单词
- 数据保存在浏览器LocalStorage中，清除浏览器数据会导致进度丢失
- 首次加载时需要等待API返回释义，请耐心等待

## 🌐 部署到GitHub Pages

1. 修改 `vite.config.js`，添加 base 路径：
   \`\`\`javascript
   export default defineConfig({
     base: '/IELTS_words/', // 仓库名
     // ...其他配置
   })
   \`\`\`

2. 构建项目：
   \`\`\`bash
   npm run build
   \`\`\`

3. 将 `dist` 目录内容推送到 `gh-pages` 分支：
   \`\`\`bash
   cd dist
   git init
   git add -A
   git commit -m 'deploy'
   git push -f git@github.com:你的用户名/IELTS_words.git main:gh-pages
   \`\`\`

4. 在GitHub仓库Settings → Pages中选择 `gh-pages` 分支

## 🔮 未来计划

- [ ] 集成更多AI模型选项
- [ ] 添加单词发音功能
- [ ] 支持导出/导入学习数据
- [ ] 添加每日学习统计图表
- [ ] 支持自定义单词分组
- [ ] 间隔重复记忆算法(Spaced Repetition)
- [ ] PWA支持，离线使用

## 📄 许可证

MIT License - 自由使用和修改

---

💡 **提示**: 
- 本地开发使用 Vite 代理解决跨域
- AI释义可选，本地算法同样好用
- 欢迎贡献代码和提出建议！
