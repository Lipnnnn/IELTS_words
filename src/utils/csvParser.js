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

// 生成简单英文释义（纯英文，不包含中文）
export function generateSimpleDefinition(word, meaning) {
  word = word.toLowerCase().trim()
  
  // 预定义的常见单词释义（扩展版）
  const commonDefinitions = {
    // 自然地理
    'atmosphere': 'The layer of gases surrounding the Earth',
    'hydrosphere': 'All water on Earth\'s surface',
    'lithosphere': 'The solid outer part of the Earth',
    'oxygen': 'A gas that living things need to breathe',
    'oxide': 'A chemical compound that contains oxygen',
    'carbon dioxide': 'A gas produced when we breathe out',
    'hydrogen': 'The lightest gas in nature',
    'core': 'The center part of something',
    'crust': 'The hard outer layer of the Earth',
    'mantle': 'The layer between Earth\'s crust and core',
    'longitude': 'Lines that run north-south on maps',
    'latitude': 'Lines that run east-west on maps',
    'horizon': 'The line where the sky meets the land',
    'altitude': 'The height above sea level',
    'disaster': 'A terrible event that causes great damage',
    'mishap': 'An unlucky accident or bad event',
    'catastrophic': 'Causing very great damage or suffering',
    'calamity': 'A serious disaster or very bad event',
    'endanger': 'To put something in a dangerous situation',
    'jeopardise': 'To put something at risk of harm',
    'destructive': 'Causing a lot of damage',
    'greenhouse': 'A glass building for growing plants',
    'phenomenon': 'Something that happens or exists in nature',
    'pebble': 'A small smooth stone',
    'magnet': 'An object that attracts iron and steel',
    'ore': 'Rock that contains metal',
    'mineral': 'A natural substance found in rocks',
    'marble': 'A hard smooth stone used in buildings',
    'quartz': 'A hard shiny mineral found in rocks',
    'granite': 'A very hard gray rock',
    'gust': 'A sudden strong wind',
    'breeze': 'A gentle wind',
    'monsoon': 'A seasonal wind that brings heavy rain',
    'gale': 'A very strong wind',
    'hurricane': 'A very strong storm with fast winds',
    'tornado': 'A spinning column of air that destroys things',
    'typhoon': 'A tropical storm with very strong winds',
    'volcano': 'A mountain that can explode with hot rock',
    'erupt': 'To suddenly burst out with great force',
    'magma': 'Hot liquid rock below Earth\'s surface',
    'thermodynamic': 'Related to heat and energy',
    'smog': 'Dirty air caused by smoke and fog',
    'fume': 'Strong unpleasant smoke or gas',
    'mist': 'Thin fog that is hard to see through',
    'tsunami': 'A huge ocean wave caused by earthquakes',
    'drought': 'A long period without rain',
    'flooding': 'When water covers normally dry land',
    'torrent': 'A fast strong flow of water',
    'earthquake': 'When the ground shakes violently',
    'avalanche': 'A large amount of snow falling down a mountain',
    'landslide': 'When rocks and earth suddenly fall down a slope'
  }
  
  // 如果有预定义释义，直接返回
  if (commonDefinitions[word]) {
    return commonDefinitions[word]
  }
  
  // 移除中文意思中的词性标记和中文符号
  let cleanMeaning = meaning
    .replace(/^[a-z]+\.\s*/i, '') // 移除词性标记
    .replace(/[；，、]/g, ';') // 替换中文标点
    .split(';')[0] // 只取第一个意思
    .trim()
  
  // 根据词性生成英文释义模板
  if (meaning.startsWith('n.')) {
    // 名词：根据常见模式生成
    if (cleanMeaning.includes('人')) {
      return `A person who is related to this concept`
    } else if (cleanMeaning.includes('物') || cleanMeaning.includes('东西')) {
      return `A thing or object in this category`
    } else if (cleanMeaning.includes('现象') || cleanMeaning.includes('情况')) {
      return `A situation or phenomenon in this field`
    } else if (cleanMeaning.includes('学') || cleanMeaning.includes('术')) {
      return `The study or practice of this subject`
    } else {
      return `A concept or thing in this area`
    }
  } else if (meaning.startsWith('v.')) {
    // 动词
    return `To perform an action related to this concept`
  } else if (meaning.startsWith('adj.')) {
    // 形容词
    return `Having the quality or characteristic described`
  } else if (meaning.startsWith('adv.')) {
    // 副词
    return `In a manner related to this concept`
  }
  
  // 默认返回通用描述
  return `Related to this concept or idea`
}
