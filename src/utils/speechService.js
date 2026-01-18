// 语音朗读服务
export class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis
    this.voices = []
    this.loadVoices()
  }

  // 加载可用的语音
  loadVoices() {
    this.voices = this.synth.getVoices()
    
    // 某些浏览器需要异步加载
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices()
      }
    }
  }

  // 获取最佳英文语音
  getEnglishVoice() {
    // 优先选择美式英语，其次是英式英语
    const preferredVoices = [
      'Google US English',
      'Microsoft David',
      'Microsoft Zira',
      'Google UK English',
      'en-US',
      'en-GB'
    ]

    for (const voiceName of preferredVoices) {
      const voice = this.voices.find(v => 
        v.name.includes(voiceName) || v.lang.includes(voiceName)
      )
      if (voice) return voice
    }

    // 如果没有找到，返回第一个英文语音
    return this.voices.find(v => v.lang.startsWith('en')) || this.voices[0]
  }

  // 朗读英文文本
  speak(text, lang = 'en-US') {
    // 停止当前朗读
    this.synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9 // 稍慢一点
    utterance.pitch = 1
    utterance.volume = 1

    // 设置语音
    const voice = this.getEnglishVoice()
    if (voice) {
      utterance.voice = voice
    }

    this.synth.speak(utterance)
  }

  // 朗读单词
  speakWord(word) {
    this.speak(word, 'en-US')
  }

  // 朗读句子
  speakSentence(sentence) {
    this.speak(sentence, 'en-US')
  }

  // 停止朗读
  stop() {
    this.synth.cancel()
  }
}

// 创建单例
export const speechService = new SpeechService()
