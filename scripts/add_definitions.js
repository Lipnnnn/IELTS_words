const fs = require('fs');
const Papa = require('papaparse');

// 导入词典
const definitions = {
  'atmosphere': 'The air around the Earth',
  'hydrosphere': 'All the water on Earth',
  'lithosphere': 'The rocky outer part of Earth',
  'oxygen': 'A gas we need to breathe and live',
  'oxide': 'Something made with oxygen',
  'carbon dioxide': 'A gas we breathe out',
  'hydrogen': 'The lightest gas that can burn',
  'core': 'The middle part of something',
  'crust': 'The hard outside layer',
  'mantle': 'The layer under Earth\'s crust',
  'longitude': 'Lines on a map from north to south',
  'latitude': 'Lines on a map from east to west',
  'horizon': 'The line where sky meets land or sea',
  'altitude': 'How high something is above sea level',
  'disaster': 'A very bad event that hurts people',
  'mishap': 'A small accident or problem',
  'catastrophic': 'Very bad and causing great harm',
  'calamity': 'A very bad event or disaster',
  'endanger': 'To put in danger',
  'jeopardise': 'To put something at risk',
  'destructive': 'Able to break or damage things',
  'el nino': 'A weather pattern that makes ocean water warm',
  'greenhouse': 'A glass house for growing plants',
  'phenomenon': 'Something that happens in nature',
  'pebble': 'A small smooth stone',
  'magnet': 'A piece of metal that pulls iron to it',
  'ore': 'Rock that has metal in it',
  'mineral': 'A natural material found in rocks',
  'marble': 'A hard smooth stone used in buildings',
  'quartz': 'A hard shiny rock or crystal',
  'granite': 'A very hard gray rock',
  'gust': 'A sudden strong wind',
  'breeze': 'A light gentle wind',
  'monsoon': 'A wind that brings lots of rain',
  'gale': 'A very strong wind',
  'hurricane': 'A huge dangerous storm with strong winds',
  'tornado': 'A spinning wind that destroys things',
  'typhoon': 'A very strong storm over the ocean',
  'volcano': 'A mountain that throws out hot melted rock',
  'erupt': 'To suddenly throw out something with force',
  'magma': 'Hot melted rock under the ground',
  'thermodynamic': 'About heat and energy moving',
  'smog': 'Dirty air from smoke and fog mixed',
  'fume': 'Bad smoke or gas',
  'mist': 'Thin fog that you can see through a little',
  'tsunami': 'A huge wave caused by earthquake',
  'drought': 'A long time with no rain',
  'flooding': 'When too much water covers the land',
  'torrent': 'Water moving very fast and strong',
  'earthquake': 'When the ground shakes',
  'seismic': 'About earthquakes',
  'avalanche': 'A lot of snow falling down a mountain',
  'terrain': 'The type of land in an area',
  'landscape': 'The way land looks in an area',
  'continent': 'A very large piece of land',
  'cave': 'A big hole in a mountain or under ground',
  'cliff': 'A very high steep rock face',
  'glacier': 'A big river of ice moving slowly',
  'swamp': 'Wet soft land with water and plants',
  'delta': 'Land made where a river meets the sea',
  'plain': 'A large flat area of land',
  'plateau': 'A high flat area of land',
  'oasis': 'A place with water in a desert',
  'globe': 'A round ball, or the Earth',
  'hemisphere': 'Half of the Earth',
  'equator': 'An imaginary line around the middle of Earth',
  'arctic': 'The area around the North Pole, very cold',
  'antarctic': 'The area around the South Pole, very cold',
  'pole': 'A long stick, or the top or bottom of Earth',
  'polar': 'Near the North or South Pole, very cold',
  'axis': 'An imaginary line through the middle',
  'deteriorate': 'To become worse',
  'aggravate': 'To make something worse',
  'degrade': 'To make something lower in quality',
  'upgrade': 'To make something better',
  'erode': 'To slowly wear away by water or wind',
  'mediterranean': 'The sea between Europe and Africa',
  'atlantic': 'The ocean between America and Europe',
  'pacific': 'The biggest ocean on Earth',
  'ocean': 'A very large area of salt water',
  'marine': 'Living in or about the sea',
  'navigation': 'Finding your way when traveling',
  'gulf': 'A large bay in the ocean',
  'beach': 'Sandy or stony land by the sea',
  'coast': 'The land along the sea',
  'shore': 'The land along water',
  'tide': 'The rise and fall of the sea',
  'current': 'Water or air moving in one direction',
  'brook': 'A small river',
  'stream': 'A small river',
  'source': 'Where something starts or comes from',
  'shallow': 'Not deep',
  'superficial': 'Only on the surface, not deep',
  'flat': 'Smooth and level, not high or low',
  'smooth': 'Having no bumps or rough parts',
  'rough': 'Not smooth, with bumps',
  'sandy': 'Covered with sand',
  'stony': 'Covered with stones',
  'vertical': 'Going straight up and down',
};

function getDefinition(word) {
  const wordLower = word.toLowerCase().trim();
  return definitions[wordLower] || 'A word in this category';
}

// 读取CSV文件
const csvContent = fs.readFileSync('./public/static/word_list.csv', 'utf-8');

Papa.parse(csvContent, {
  header: true,
  complete: (results) => {
    // 为每行添加definition字段
    const rows = results.data.map(row => ({
      word: row.word,
      meaning: row.meaning,
      sort: row.sort,
      title: row.title,
      phonetic: row.phonetic,
      definition: getDefinition(row.word)
    }));

    // 转换回CSV
    const csv = Papa.unparse(rows);
    
    // 写入新文件
    fs.writeFileSync('./public/static/word_list.csv', csv, 'utf-8');
    
    console.log(`✅ 成功处理 ${rows.length} 个单词`);
    console.log(`✅ 已更新 word_list.csv`);
  }
});
