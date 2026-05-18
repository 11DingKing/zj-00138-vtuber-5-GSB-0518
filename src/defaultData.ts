import type { Expression, Pose, Script } from './types'
import { modelState } from './stores/modelStore.svelte'
import { scriptState } from './stores/scriptStore.svelte'
import { saveExpression, savePose, saveScript, getAllExpressions, getAllPoses, getAllScripts } from './db'

export const defaultExpressions: Expression[] = [
  { id: 'happy', name: '开心', shortcut: '1', params: { smile: 1, eyes: 0.5 } },
  { id: 'surprised', name: '惊讶', shortcut: '2', params: { eyes: 1, mouth: 0.8 } },
  { id: 'thinking', name: '沉思', shortcut: '3', params: { brow: 0.5, eyes: 0.3 } },
  { id: 'blink', name: '眨眼', shortcut: '4', params: { eyes: 0 } },
  { id: 'pout', name: '嘟嘴', shortcut: '5', params: { mouth: -0.5, lips: 1 } }
]

export const defaultPoses: Pose[] = [
  { id: 'natural', name: '自然站姿', shortcut: '6', params: { body: 0, arms: 0 } },
  { id: 'crossed', name: '抱手', shortcut: '7', params: { arms: 1 } },
  { id: 'pointing', name: '指物', shortcut: '8', params: { armRight: 1 } },
  { id: 'waving', name: '挥手', shortcut: '9', params: { armLeft: 1, wave: 1 } },
  { id: 'sitting', name: '坐姿', params: { body: 1, legs: 1 } }
]

export const defaultScript: Script = {
  id: 'default-script',
  name: '默认直播剧本',
  createdAt: Date.now(),
  stages: [
    {
      id: 'stage-1',
      name: '开场白',
      ttsText: '大家好！欢迎来到我的直播间，今天给大家带来了非常棒的产品！',
      expressions: ['happy', 'waving'],
      duration: 5000
    },
    {
      id: 'stage-2',
      name: '产品介绍1',
      ttsText: '首先看这款产品，它采用优质材料制作，设计非常时尚，性价比超高！',
      expressions: ['pointing', 'happy'],
      duration: 8000
    },
    {
      id: 'stage-3',
      name: '互动问答',
      ttsText: '大家有什么问题都可以在弹幕里问我哦，我会一一解答的！',
      expressions: ['thinking', 'surprised'],
      duration: 6000
    },
    {
      id: 'stage-4',
      name: '产品介绍2',
      ttsText: '现在下单还有优惠活动哦！数量有限，先到先得，赶紧下单吧！',
      expressions: ['happy', 'pointing'],
      duration: 7000
    },
    {
      id: 'stage-5',
      name: '结束语',
      ttsText: '感谢大家的观看，我们下次直播再见！记得关注我哦，拜拜！',
      expressions: ['waving', 'happy'],
      duration: 5000
    }
  ]
}

export async function initDefaultData() {
  const exprs = await getAllExpressions()
  if (exprs.length === 0) {
    for (const expr of defaultExpressions) {
      await saveExpression(expr)
    }
    modelState.expressions.push(...defaultExpressions)
  } else {
    modelState.expressions.push(...exprs)
  }

  const ps = await getAllPoses()
  if (ps.length === 0) {
    for (const pose of defaultPoses) {
      await savePose(pose)
    }
    modelState.poses.push(...defaultPoses)
  } else {
    modelState.poses.push(...ps)
  }

  const scs = await getAllScripts()
  if (scs.length === 0) {
    await saveScript(defaultScript)
    scriptState.scripts.push(defaultScript)
  } else {
    scriptState.scripts.push(...scs)
  }
}
