<template>
  <div class="chapter-menu" :class="{ 'collapsed': isCollapsed }">
    <div class="menu-header">
      <h3 v-if="!isCollapsed">📚 章节目录</h3>
      <button class="toggle-btn" @click="toggleMenu" :title="isCollapsed ? '展开菜单' : '收起菜单'">
        {{ isCollapsed ? '☰' : '✕' }}
      </button>
    </div>
    
    <div class="menu-content" v-if="!isCollapsed">
      <div 
        v-for="chapter in chapters" 
        :key="chapter.title"
        class="menu-item"
        :class="{ 'active': currentChapter === chapter.title }"
        @click="selectChapter(chapter.title)"
      >
        <div class="chapter-name">{{ chapter.title }}</div>
        <div class="chapter-count">{{ chapter.words.length }} 词</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  chapters: {
    type: Array,
    required: true
  },
  currentChapter: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select-chapter'])

const isCollapsed = ref(false)

const toggleMenu = () => {
  isCollapsed.value = !isCollapsed.value
}

const selectChapter = (chapterTitle) => {
  emit('select-chapter', chapterTitle)
}
</script>

<style scoped>
.chapter-menu {
  position: fixed;
  left: 0;
  top: 120px;
  width: 280px;
  max-height: calc(100vh - 140px);
  background: white;
  border-radius: 0 16px 16px 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 100;
  overflow: hidden;
}

.chapter-menu.collapsed {
  width: 50px;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 2px solid var(--border-color);
  background: var(--primary-color);
  color: white;
}

.menu-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 1.2rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.menu-content {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 10px 0;
}

.menu-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-item:hover {
  background: #f5f7fa;
  border-left-color: var(--primary-color);
}

.menu-item.active {
  background: linear-gradient(90deg, #e8f0fe 0%, #f5f7fa 100%);
  border-left-color: var(--primary-color);
  font-weight: 600;
}

.chapter-name {
  font-size: 0.95rem;
  color: var(--text-primary);
  flex: 1;
}

.chapter-count {
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: var(--border-color);
  padding: 2px 8px;
  border-radius: 10px;
}

.menu-item.active .chapter-count {
  background: var(--primary-color);
  color: white;
}

/* 滚动条样式 */
.menu-content::-webkit-scrollbar {
  width: 6px;
}

.menu-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.menu-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.menu-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

@media (max-width: 768px) {
  .chapter-menu {
    top: 80px;
    width: 250px;
  }
  
  .chapter-menu.collapsed {
    width: 45px;
  }
}
</style>
