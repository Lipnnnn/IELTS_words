<template>
  <section class="section">
    <div class="words-header">
      <h2>{{ chapterTitle || '单词列表' }} ({{ filteredWords.length }})</h2>
      <div class="controls">
        <button class="btn btn-secondary" @click="toggleFilter">
          {{ showUnknownOnly ? '显示全部' : '只看未掌握' }}
        </button>
        <button class="btn btn-primary" @click="startLearning">开始学习</button>
      </div>
    </div>

    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        <span class="progress-text">已掌握: {{ knownCount }}/{{ words.length }}</span>
      </div>
    </div>

    <div class="words-grid">
      <div 
        v-for="word in filteredWords" 
        :key="word.word"
        class="word-item"
        :class="{ 'known': word.known }"
      >
        <div class="word" @click="startLearning">
          {{ word.word }}
          <button class="speaker-btn" @click.stop="speakWord(word.word)" title="朗读单词">
            🔊
          </button>
        </div>
        <div class="definition" @click="startLearning">{{ word.definition }}</div>
        <div class="status">{{ word.known ? '✓' : '' }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { speechService } from '../utils/speechService'

const props = defineProps({
  words: {
    type: Array,
    required: true
  },
  chapterTitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['start-learning'])

const showUnknownOnly = ref(false)

const speakWord = (word) => {
  speechService.speakWord(word)
}

const filteredWords = computed(() => {
  if (showUnknownOnly.value) {
    return props.words.filter(w => !w.known)
  }
  return props.words
})

const knownCount = computed(() => {
  return props.words.filter(w => w.known).length
})

const progressPercentage = computed(() => {
  if (props.words.length === 0) return 0
  return (knownCount.value / props.words.length) * 100
})

const toggleFilter = () => {
  showUnknownOnly.value = !showUnknownOnly.value
}

const startLearning = () => {
  emit('start-learning')
}
</script>

<style scoped>
.words-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.progress-container {
  margin-bottom: 30px;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background: var(--border-color);
  border-radius: 15px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--secondary-color), #45b368);
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.word-item {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.word-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
  border-color: var(--primary-color);
}

.word-item.known {
  background: #E8F5E9;
  border-color: var(--secondary-color);
  opacity: 0.7;
}

.word {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.speaker-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.speaker-btn:hover {
  transform: scale(1.2);
}

.speaker-btn:active {
  transform: scale(0.95);
}

.definition {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: pre-line;
  cursor: pointer;
}

.status {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .words-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .words-grid {
    grid-template-columns: 1fr;
  }
}
</style>
