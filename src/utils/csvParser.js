import Papa from 'papaparse'

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

// 生成简单英文释义（基于中文意思和单词本身）
export function generateSimpleDefinition(word, meaning) {
  word = word.toLowerCase().trim()
  
  // 移除中文意思中的词性标记
  const cleanMeaning = meaning.replace(/^[a-z]+\.\s*/i, '').trim()
  
  // 预定义的常见单词释义
  const commonDefinitions = {
    // 名词类
    'atmosphere': 'The layer of gases surrounding the Earth',
    'oxygen': 'A gas that living things need to breathe',
    'hydrogen': 'The lightest gas in nature',
    'core': 'The center part of something',
    'crust': 'The hard outer layer of the Earth',
    'mantle': 'The layer between Earth\'s crust and core',
    'longitude': 'Lines that run north-south on maps',
    'latitude': 'Lines that run east-west on maps',
    'horizon': 'The line where the sky meets the land',
    'altitude': 'The height above sea level',
    'disaster': 'A terrible event that causes great damage',
    'phenomenon': 'Something that happens or exists in nature',
    'mineral': 'A natural substance found in rocks',
    'volcano': 'A mountain that can explode with hot rock',
    'earthquake': 'When the ground shakes violently',
    'tsunami': 'A huge ocean wave caused by earthquakes',
    'drought': 'A long period without rain',
    'flood': 'Too much water covering normally dry land',
    
    // 动词类
    'erupt': 'To suddenly burst out with great force',
    'endanger': 'To put something in a dangerous situation',
    'destroy': 'To damage something completely',
    'preserve': 'To keep something safe from harm',
    'conserve': 'To protect something from being wasted',
    
    // 形容词类
    'catastrophic': 'Causing very great damage or suffering',
    'destructive': 'Causing a lot of damage',
    'endangered': 'In danger of disappearing completely',
    'extinct': 'No longer existing',
    'renewable': 'Can be used again or replaced naturally'
  }
  
  // 如果有预定义释义，直接返回
  if (commonDefinitions[word]) {
    return commonDefinitions[word]
  }
  
  // 根据词性和中文意思生成释义
  if (meaning.startsWith('n.')) {
    return `A thing or concept related to: ${cleanMeaning}`
  } else if (meaning.startsWith('v.')) {
    return `To ${cleanMeaning.split('；')[0].split('，')[0]}`
  } else if (meaning.startsWith('adj.')) {
    return `Having the quality of: ${cleanMeaning.split('；')[0].split('，')[0]}`
  } else if (meaning.startsWith('adv.')) {
    return `In a way that: ${cleanMeaning.split('；')[0].split('，')[0]}`
  }
  
  // 默认返回
  return `Meaning: ${cleanMeaning.split('；')[0].split('，')[0]}`
}
