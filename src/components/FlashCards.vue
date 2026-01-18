<template>
  <section class="section">
    <div class="card-header">
      <button class="btn btn-secondary" @click="backToList">← 返回列表</button>
      <div class="card-progress">
        <span>{{ currentIndex + 1 }}</span> / <span>{{ filteredWords.length }}</span>
      </div>
    </div>

    <div class="flashcard" :class="{ 'flipped': isFlipped }" @click="flipCard">
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="word-display-container">
            <div class="word-display">{{ currentWord.word }}</div>
            <button class="speaker-btn-large" @click.stop="speakWord(currentWord.word)" title="朗读单词">
              🔊
            </button>
          </div>
          <p class="hint">点击卡片查看释义</p>
        </div>
        <div class="flashcard-back">
          <div class="word-display-container">
            <div class="word-display-small">{{ currentWord.word }}</div>
            <button class="speaker-btn-small" @click.stop="speakWord(currentWord.word)" title="朗读单词">
              🔊
            </button>
          </div>
          <div class="definition-section">
            <div class="definition-item">
              <div class="definition-header">
                <span class="definition-label">英文释义：</span>
                <button class="speaker-btn-small" @click.stop="speakSentence(currentWord.simple)" title="朗读释义">
                  🔊
                </button>
              </div>
              <div class="definition-text">{{ currentWord.simple }}</div>
            </div>
            <div class="definition-item">
              <span class="definition-label">中文翻译：</span>
              <div class="definition-text chinese">{{ currentWord.chinese }}</div>
            </div>
          </div>
          <p class="hint">点击卡片返回单词</p>
        </div>
      </div>
    </div>

    <div class="card-actions">
      <button class="btn btn-large btn-danger" @click="markWord(false)">❌ 不认识</button>
      <button class="btn btn-large btn-success" @click="markWord(true)">✓ 认识</button>
    </div>

    <div class="card-navigation">
      <button class="btn" @click="navigate(-1)">← 上一个</button>
      <button class="btn" @click="navigate(1)">下一个 →</button>
    </div>

    <div class="keyboard-hint">
      <p>⌨️ 快捷键: 空格=翻转 | ←→=切换 | 1=不认识 | 2=认识</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { speechService } from '../utils/speechService'

const props = defineProps({
  words: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['back-to-list', 'update-word'])

const currentIndex = ref(0)
const isFlipped = ref(false)
const showUnknownOnly = ref(false)

const speakWord = (word) => {
  speechService.speakWord(word)
}

const speakSentence = (sentence) => {
  speechService.speakSentence(sentence)
}

const filteredWords = computed(() => {
  if (showUnknownOnly.value) {
    return props.words.filter(w => !w.known)
  }
  return props.words
})

const currentWord = computed(() => {
  if (filteredWords.value.length === 0) {
    return { word: '无单词', definition: '没有可学习的单词' }
  }
  if (currentIndex.value >= filteredWords.value.length) {
    currentIndex.value = 0
  }
  return filteredWords.value[currentIndex.value]
})

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const markWord = (known) => {
  const word = { ...currentWord.value, known }
  emit('update-word', word)
  navigate(1)
}

const navigate = (direction) => {
  currentIndex.value += direction
  if (currentIndex.value < 0) {
    currentIndex.value = filteredWords.value.length - 1
  } else if (currentIndex.value >= filteredWords.value.length) {
    currentIndex.value = 0
  }
  isFlipped.value = false
}

const backToList = () => {
  emit('back-to-list')
}

const handleKeyboard = (e) => {
  switch(e.key) {
    case ' ':
    case 'Enter':
      e.preventDefault()
      flipCard()
      break
    case 'ArrowLeft':
      e.preventDefault()
      navigate(-1)
      break
    case 'ArrowRight':
      e.preventDefault()
      navigate(1)
      break
    case '1':
      e.preventDefault()
      markWord(false)
      break
    case '2':
      e.preventDefault()
      markWord(true)
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyboard)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard)
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.card-progress {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
}

.flashcard {
  perspective: 1000px;
  height: 500px;
  margin-bottom: 40px;
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  cursor: pointer;
}

.flashcard.flipped .flashcard-inner {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  box-shadow: var(--shadow-lg);
}

.flashcard-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.flashcard-back {
  background: linear-gradient(135deg, #6ba587 0%, #7fb89a 100%);
  color: white;
  transform: rotateY(180deg);
}

.word-display {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  text-align: center;
}

.word-display-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.speaker-btn-large {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 1.8rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.speaker-btn-large:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.speaker-btn-large:active {
  transform: scale(0.95);
}

.speaker-btn-small {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.speaker-btn-small:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.speaker-btn-small:active {
  transform: scale(0.95);
}

.word-display-small {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.definition-section {
  width: 100%;
  max-width: 600px;
  text-align: left;
}

.definition-item {
  margin-bottom: 20px;
}

.definition-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.definition-label {
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.9;
}

.definition-text {
  font-size: 1.3rem;
  line-height: 1.6;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.definition-text.chinese {
  font-size: 1.4rem;
  font-weight: 500;
}

.hint {
  margin-top: 20px;
  opacity: 0.8;
  font-size: 0.9rem;
}

.card-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 20px;
}

.card-navigation {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.keyboard-hint {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .flashcard {
    min-height: 350px;
  }

  .word-display {
    font-size: 2.5rem;
  }

  .definition-display {
    font-size: 1.2rem;
  }

  .card-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
