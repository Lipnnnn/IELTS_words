<template>
  <div class="container">
    <header>
      <h1>📚 IELTS 单词记忆卡</h1>
      <p class="subtitle">上传YAML文档，AI智能解析，轻松记忆</p>
    </header>

    <main>
      <!-- 上传组件 -->
      <UploadSection 
        v-if="currentView === 'upload'"
        @words-loaded="handleWordsLoaded"
      />

      <!-- 单词列表 -->
      <WordsList 
        v-if="currentView === 'list'"
        :words="words"
        @start-learning="handleStartLearning"
        @back-to-upload="currentView = 'upload'"
      />

      <!-- 学习卡片 -->
      <FlashCards 
        v-if="currentView === 'cards'"
        :words="words"
        @back-to-list="currentView = 'list'"
        @update-word="handleUpdateWord"
      />
    </main>

    <footer>
      <p>💡 提示：单词数据保存在浏览器本地存储中 | Vue 3 + Vite + AI驱动</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import yaml from 'js-yaml'
import UploadSection from './components/UploadSection.vue'
import WordsList from './components/WordsList.vue'
import FlashCards from './components/FlashCards.vue'

const currentView = ref('list')
const words = ref([])

// 从 YAML 文件加载单词
const loadWordsFromYAML = async () => {
  try {
    // 使用 import.meta.env.BASE_URL 来适配 GitHub Pages 路径
    const response = await fetch(`${import.meta.env.BASE_URL}static/word-list-01.yaml`)
    const yamlText = await response.text()
    const data = yaml.load(yamlText)
    
    // YAML 数据是对象格式，需要转换为数组
    const wordsList = Object.values(data).map(item => ({
      word: item.title,
      definition: item.simple || item.text || '无释义',
      simple: item.simple || '无释义',
      chinese: item.chinese || '无中文翻译',
      example: item.example || '',
      text: item.text || '',
      known: false
    }))
    
    words.value = wordsList
    console.log(`已加载 ${wordsList.length} 个单词`, wordsList)
  } catch (error) {
    console.error('加载单词文件失败:', error)
  }
}

// 页面加载时自动加载单词
onMounted(() => {
  loadWordsFromYAML()
})

// 处理单词加载完成
const handleWordsLoaded = (loadedWords) => {
  words.value = loadedWords
  localStorage.setItem('ielts_words', JSON.stringify(words.value))
  currentView.value = 'list'
}

// 开始学习
const handleStartLearning = () => {
  currentView.value = 'cards'
}

// 更新单词状态
const handleUpdateWord = (updatedWord) => {
  const index = words.value.findIndex(w => w.word === updatedWord.word)
  if (index !== -1) {
    words.value[index] = updatedWord
    localStorage.setItem('ielts_words', JSON.stringify(words.value))
  }
}
</script>
