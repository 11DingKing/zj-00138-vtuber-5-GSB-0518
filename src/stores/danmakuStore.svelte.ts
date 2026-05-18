import type { Danmaku } from '../types'

export const danmakuState = $state({
  danmakus: [] as Danmaku[]
})

let danmakuTimer: number | null = null
const fakeUsernames = ['小明', '小红', '阿强', '阿珍', '路人甲', '观众乙', '铁粉丙', '新粉丝', '老观众', '神秘人']
const fakeMessages = [
  '主播好可爱！',
  '这个产品多少钱？',
  '有优惠吗？',
  '什么时候发货？',
  '主播声音好好听',
  '已下单！',
  '求链接',
  '太好看了吧',
  '买买买！',
  '主播辛苦了',
  '求翻牌',
  '还有库存吗？',
  '颜色好漂亮',
  '质量怎么样？',
  '主播今天好美'
]

export function startDanmakuSimulation() {
  if (danmakuTimer) return
  danmakuTimer = window.setInterval(() => {
    if (danmakuState.danmakus.length > 20) {
      danmakuState.danmakus.shift()
    }
    danmakuState.danmakus.push({
      id: 'danmaku-' + Date.now() + '-' + Math.random(),
      username: fakeUsernames[Math.floor(Math.random() * fakeUsernames.length)],
      text: fakeMessages[Math.floor(Math.random() * fakeMessages.length)],
      timestamp: Date.now()
    })
  }, 2000 + Math.random() * 3000)
}

export function stopDanmakuSimulation() {
  if (danmakuTimer) {
    clearInterval(danmakuTimer)
    danmakuTimer = null
  }
}

export function addDanmaku(danmaku: Omit<Danmaku, 'id' | 'timestamp'>) {
  if (danmakuState.danmakus.length > 20) {
    danmakuState.danmakus.shift()
  }
  danmakuState.danmakus.push({
    ...danmaku,
    id: 'danmaku-' + Date.now() + '-' + Math.random(),
    timestamp: Date.now()
  })
}

export function clearDanmakus() {
  danmakuState.danmakus.length = 0
}
