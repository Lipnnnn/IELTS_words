// AI驱动的简单释义生成服务
// 使用Google Gemini API生成简单易懂的英文释义

const GEMINI_API_KEY = 'YOUR_API_KEY_HERE' // 请替换为你的Gemini API Key

// 如果没有API Key，使用本地生成方法
const USE_LOCAL_GENERATION = !GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE'

// 使用AI生成简单释义
export async function generateSimpleDefinition(word) {
  if (USE_LOCAL_GENERATION) {
    // 本地生成方法（使用词典API + 简化算法）
    return await generateLocalDefinition(word)
  }
  
  try {
    // 使用Gemini AI生成
    const definition = await generateWithGemini(word)
    return {
      word: word,
      definition: definition,
      known: false,
      timestamp: Date.now()
    }
  } catch (error) {
    console.warn(`AI生成失败，使用本地方法: ${word}`, error)
    return await generateLocalDefinition(word)
  }
}

// 使用Gemini API生成简单释义
async function generateWithGemini(word) {
  const prompt = `Please explain the word "${word}" in very simple English, using only basic vocabulary that a beginner can understand. Keep it to one short sentence (maximum 15 words). Don't use difficult words.`
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  })
  
  if (!response.ok) {
    throw new Error('Gemini API调用失败')
  }
  
  const data = await response.json()
  const definition = data.candidates[0].content.parts[0].text.trim()
  return definition
}

// 本地生成简单释义（备用方案）
async function generateLocalDefinition(word) {
  try {
    // 使用词典API获取基础定义
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`/api/api/v2/entries/en/${word}`, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const data = await response.json()
      const firstEntry = data[0]
      
      if (firstEntry.meanings && firstEntry.meanings.length > 0) {
        const firstMeaning = firstEntry.meanings[0]
        if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
          const originalDef = firstMeaning.definitions[0].definition
          const simplified = simplifyDefinition(originalDef)
          
          // 添加例句
          let result = simplified
          if (firstMeaning.definitions[0].example) {
            const example = firstMeaning.definitions[0].example
            if (example.length < 80) {
              result += `\n\nExample: ${example}`
            }
          }
          
          return {
            word: word,
            definition: result,
            known: false,
            timestamp: Date.now()
          }
        }
      }
    }
  } catch (error) {
    console.warn(`词典API失败: ${word}`)
  }
  
  // 如果API失败，使用基于模式的生成
  return {
    word: word,
    definition: getPatternBasedDefinition(word),
    known: false,
    timestamp: Date.now()
  }
}

// 简化复杂的定义
function simplifyDefinition(definition) {
  let simplified = definition
  
  // 替换复杂词汇
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
    'illustrate': 'show'
  }
  
  for (const [complex, simple] of Object.entries(replacements)) {
    const regex = new RegExp(complex, 'gi')
    simplified = simplified.replace(regex, simple)
  }
  
  // 移除括号和分号后内容
  simplified = simplified.replace(/\(.*?\)/g, '')
  simplified = simplified.replace(/;.*$/, '')
  
  // 首字母大写
  simplified = simplified.trim()
  if (simplified.length > 0) {
    simplified = simplified.charAt(0).toUpperCase() + simplified.slice(1)
  }
  
  // 限制长度
  if (simplified.length > 120) {
    simplified = simplified.substring(0, 120).trim() + '...'
  }
  
  return simplified
}

// 基于模式的定义生成
function getPatternBasedDefinition(word) {
  const lowerWord = word.toLowerCase()
  
  // 检查动词形式
  if (lowerWord.endsWith('ing')) {
    return 'Doing the action of ' + lowerWord.slice(0, -3)
  }
  if (lowerWord.endsWith('ed')) {
    return 'Did the action of ' + lowerWord.slice(0, -2) + ' in the past'
  }
  
  // 检查后缀模式
  const patterns = {
    'tion$': 'The act or result of doing something',
    'sion$': 'The act or result of doing something',
    'ment$': 'The state or result of something',
    'ness$': 'The quality of being something',
    'able$': 'Can be done or is possible',
    'ible$': 'Can be done or is possible',
    'ful$': 'Full of this quality',
    'less$': 'Without this quality',
    'ize$': 'To make or become something',
    'ise$': 'To make or become something',
    'ly$': 'In this kind of way',
    'er$': 'A person or thing that does this',
    'or$': 'A person who does this',
    'ist$': 'A person who does or studies this',
    'ive$': 'Related to or tending to do this',
    'ous$': 'Having this quality',
    'al$': 'Related to this'
  }
  
  for (const [pattern, meaning] of Object.entries(patterns)) {
    if (new RegExp(pattern).test(lowerWord)) {
      return meaning
    }
  }
  
  return 'A word with special meaning'
}
