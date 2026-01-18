<template>
  <section class="section">
    <div 
      class="upload-area" 
      :class="{ 'drag-over': isDragging }"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <div class="upload-icon">📄</div>
      <h2>上传YAML文件</h2>
      <p>点击或拖拽YAML文件到此处</p>
      <input 
        ref="fileInput" 
        type="file" 
        accept=".yaml,.yml" 
        @change="handleFileSelect"
        hidden
      >
      <button class="btn btn-primary">选择文件</button>
    </div>
    
    <div v-if="fileInfo" class="file-info" :class="{ 'error': isError }">
      {{ fileInfo }}
    </div>

    <div v-if="progress > 0 && progress < 100" class="upload-progress">
      <div class="progress-bar-upload">
        <div class="progress-fill-upload" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="progress-text-upload">{{ progressText }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import yaml from 'js-yaml'
import { generateSimpleDefinition } from '../utils/aiService'
import { extractTextFromYAML, extractWords } from '../utils/wordExtractor'

const emit = defineEmits(['words-loaded'])

const fileInput = ref(null)
const isDragging = ref(false)
const fileInfo = ref('')
const isError = ref(false)
const progress = ref(0)
const progressText = ref('')

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = async (file) => {
  if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
    fileInfo.value = '❌ 请选择有效的YAML文件'
    isError.value = true
    return
  }

  isError.value = false
  fileInfo.value = `正在处理: ${file.name}...`
  progress.value = 10

  try {
    const text = await file.text()
    const yamlData = yaml.load(text)
    progress.value = 30

    // 提取文本和单词
    const allText = extractTextFromYAML(yamlData)
    const wordsList = extractWords(allText)
    
    if (wordsList.length === 0) {
      fileInfo.value = '❌ 未能从YAML文件中提取到单词'
      isError.value = true
      progress.value = 0
      return
    }

    progress.value = 50
    progressText.value = `正在生成 ${wordsList.length} 个单词的简单释义...`

    // 批量生成释义
    const wordsWithDefinitions = []
    const batchSize = 5
    
    for (let i = 0; i < wordsList.length; i += batchSize) {
      const batch = wordsList.slice(i, i + batchSize)
      const promises = batch.map(word => generateSimpleDefinition(word))
      const results = await Promise.all(promises)
      wordsWithDefinitions.push(...results)
      
      const currentProgress = 50 + (i / wordsList.length) * 50
      progress.value = Math.min(currentProgress, 95)
      progressText.value = `已处理 ${Math.min(i + batchSize, wordsList.length)}/${wordsList.length} 个单词`
    }

    progress.value = 100
    fileInfo.value = `✓ 成功提取 ${wordsWithDefinitions.length} 个单词！`
    
    setTimeout(() => {
      emit('words-loaded', wordsWithDefinitions)
    }, 500)

  } catch (error) {
    console.error('处理错误:', error)
    fileInfo.value = '❌ YAML文件解析失败，请确保文件格式正确'
    isError.value = true
    progress.value = 0
  }
}
</script>

<style scoped>
.upload-area {
  border: 3px dashed var(--border-color);
  border-radius: 12px;
  padding: 60px 30px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--primary-color);
  background: #F0F7FF;
}

.upload-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.upload-area h2 {
  color: var(--text-primary);
  margin-bottom: 10px;
}

.upload-area p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.file-info {
  margin-top: 20px;
  padding: 15px;
  background: #E8F5E9;
  border-radius: 8px;
  color: var(--secondary-color);
  font-weight: 600;
}

.file-info.error {
  background: #FFEBEE;
  color: var(--danger-color);
}

.upload-progress {
  margin-top: 20px;
}

.progress-bar-upload {
  width: 100%;
  height: 30px;
  background: var(--border-color);
  border-radius: 15px;
  overflow: hidden;
  position: relative;
}

.progress-fill-upload {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
}

.progress-text-upload {
  text-align: center;
  margin-top: 10px;
  color: var(--text-primary);
  font-weight: 600;
}
</style>
