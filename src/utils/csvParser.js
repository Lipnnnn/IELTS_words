import Papa from 'papaparse'
import { getSimpleDefinition } from './simpleDefinitions'

// 解析CSV文件
export async function parseCSV(csvUrl) {
  try {
    const response = await fetch(csvUrl)
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data)
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error('解析CSV失败:', error)
    throw error
  }
}

// 按章节分组单词
export function groupByChapter(words) {
  const chapters = {}
  
  words.forEach(word => {
    const chapter = word.title || 'Other'
    if (!chapters[chapter]) {
      chapters[chapter] = {
        title: chapter,
        sort: parseInt(word.sort) || 999,
        words: []
      }
    }
    chapters[chapter].words.push(word)
  })
  
  // 转换为数组并排序
  return Object.values(chapters).sort((a, b) => a.sort - b.sort)
}

// 生成简单英文释义（纯英文，用最简单的词）
export function generateSimpleDefinition(word, meaning) {
  word = word.toLowerCase().trim()
  
  // 首先查找预定义的简单释义
  const predefined = getSimpleDefinition(word)
  if (predefined) {
    return predefined
  }
  
  // 如果没有预定义，生成通用释义
  // 移除中文意思中的词性标记
  const cleanMeaning = meaning.replace(/^[a-z]+\.\s*/i, '').trim()
  
  // 根据词性生成简单的英文释义
  if (meaning.startsWith('n.')) {
    // 名词
    if (cleanMeaning.includes('人') || cleanMeaning.includes('者')) {
      return 'A person in this field'
    } else if (cleanMeaning.includes('物') || cleanMeaning.includes('品')) {
      return 'A thing or object'
    } else if (cleanMeaning.includes('学') || cleanMeaning.includes('术')) {
      return 'The study or skill of this'
    } else if (cleanMeaning.includes('性') || cleanMeaning.includes('度')) {
      return 'A quality or state'
    } else {
      return 'Something related to this idea'
    }
  } else if (meaning.startsWith('v.')) {
    // 动词
    return 'To do something related to this'
  } else if (meaning.startsWith('adj.')) {
    // 形容词
    return 'Having this quality'
  } else if (meaning.startsWith('adv.')) {
    // 副词
    return 'In this way'
  }
  
  // 默认
  return 'Related to this idea'
}
