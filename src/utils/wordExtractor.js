// 从YAML数据中递归提取所有文本
export function extractTextFromYAML(data) {
  let text = ''
  
  if (typeof data === 'string') {
    text += data + ' '
  } else if (Array.isArray(data)) {
    data.forEach(item => {
      text += extractTextFromYAML(item)
    })
  } else if (typeof data === 'object' && data !== null) {
    Object.values(data).forEach(value => {
      text += extractTextFromYAML(value)
    })
  }
  
  return text
}

// 提取单词列表
export function extractWords(text) {
  // 提取所有英文单词（3个字母以上）
  const wordMatches = text.match(/\b[a-zA-Z]{3,}\b/g)
  if (!wordMatches) return []
  
  // 统计词频并去重
  const wordFrequency = {}
  wordMatches.forEach(word => {
    const lower = word.toLowerCase()
    wordFrequency[lower] = (wordFrequency[lower] || 0) + 1
  })
  
  // 过滤常见词
  const commonWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one',
    'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old',
    'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too',
    'use', 'this', 'that', 'with', 'have', 'from', 'they', 'what', 'been', 'more', 'when',
    'will', 'would', 'there', 'their', 'which', 'about', 'could', 'these', 'first', 'other',
    'than', 'then', 'them', 'some', 'time', 'very', 'were', 'said', 'each', 'tell', 'does',
    'must', 'upon', 'also', 'into', 'many', 'most', 'over', 'such', 'take', 'only', 'year',
    'come', 'work', 'made', 'make', 'well', 'back', 'call', 'came', 'down', 'even', 'find',
    'give', 'good', 'just', 'keep', 'know', 'last', 'left', 'like', 'long', 'look', 'much'
  ])
  
  const words = Object.entries(wordFrequency)
    .filter(([word, freq]) => !commonWords.has(word) && freq >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100) // 限制最多100个单词
    .map(([word]) => word)
  
  return words
}
