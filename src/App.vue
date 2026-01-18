<template>
  <div class="container">
    <header>
      <h1>📚 IELTS 单词记忆卡</h1>
      <p class="subtitle">按章节学习，轻松记忆</p>
    </header>

    <!-- 章节菜单 -->
    <ChapterMenu 
      v-if="chapters.length > 0 && currentView !== 'cards'"
      :chapters="chapters"
      :currentChapter="currentChapter"
      @select-chapter="handleSelectChapter"
    />

    <main :class="{ 'with-menu': chapters.length > 0 && currentView !== 'cards' }">
      <!-- 单词列表 -->
      <WordsList 
        v-if="currentView === 'list'"
        :words="currentWords"
        :chapterTitle="currentChapter"
        @start-learning="handleStartLearning"
      />

      <!-- 学习卡片 -->
      <FlashCards 
        v-if="currentView === 'cards'"
        :words="currentWords"
        @back-to-list="currentView = 'list'"
        @update-word="handleUpdateWord"
      />
    </main>

    <footer>
      <p>💡 提示：单词数据保存在浏览器本地存储中 | Vue 3 + Vite</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { parseCSV, groupByChapter } from './utils/csvParser'
import ChapterMenu from './components/ChapterMenu.vue'
import WordsList from './components/WordsList.vue'
import FlashCards from './components/FlashCards.vue'

const currentView = ref('list')
const chapters = ref([])
const currentChapter = ref('')
const allWords = ref([])

// 当前章节的单词
const currentWords = computed(() => {
  if (!currentChapter.value) return []
  const chapter = chapters.value.find(c => c.title === currentChapter.value)
  return chapter ? chapter.words : []
})

// 从 CSV 文件加载单词
const loadWordsFromCSV = async () => {
  try {
    const csvUrl = `${import.meta.env.BASE_URL}static/word_list.csv`
    const data = await parseCSV(csvUrl)
    
    // 转换为单词对象格式
    const words = data.map(item => ({
      word: item.word,
      meaning: item.meaning,
      phonetic: item.phonetic,
      chapter: item.title,
      sort: item.sort,
      definition: item.definition || 'A word in this category',
      simple: item.definition || 'A word in this category',
      chinese: item.meaning,
      known: false
    }))
    
    allWords.value = words
    
    // 按章节分组
    const groupedChapters = groupByChapter(data)
    
    // 为每个章节的单词添加完整信息
    groupedChapters.forEach(chapter => {
      chapter.words = chapter.words.map(item => ({
        word: item.word,
        meaning: item.meaning,
        phonetic: item.phonetic,
        chapter: item.title,
        definition: item.definition || 'A word in this category',
        simple: item.definition || 'A word in this category',
        chinese: item.meaning,
        known: false
      }))
    })
    
    chapters.value = groupedChapters
    
    // 默认选择第一章
    if (chapters.value.length > 0) {
      currentChapter.value = chapters.value[0].title
    }
    
    console.log(`已加载 ${chapters.value.length} 个章节，共 ${words.length} 个单词`)
  } catch (error) {
    console.error('加载单词文件失败:', error)
  }
}

// 页面加载时自动加载单词
onMounted(() => {
  loadWordsFromCSV()
})

// 选择章节
const handleSelectChapter = (chapterTitle) => {
  currentChapter.value = chapterTitle
  currentView.value = 'list'
}

// 开始学习
const handleStartLearning = () => {
  currentView.value = 'cards'
}

// 更新单词状态
const handleUpdateWord = (updatedWord) => {
  const chapter = chapters.value.find(c => c.title === currentChapter.value)
  if (chapter) {
    const index = chapter.words.findIndex(w => w.word === updatedWord.word)
    if (index !== -1) {
      chapter.words[index] = updatedWord
    }
  }
}
</script>

<style>
main.with-menu {
  margin-left: 300px;
  transition: margin-left 0.3s ease;
}

@media (max-width: 768px) {
  main.with-menu {
    margin-left: 0;
  }
}
</style>
