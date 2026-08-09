// 所有文案内容集中管理
// 替换占位内容：把 【占位...】 换成真实的故事

export const characterData = {
  name: '皮皮',
  title: '互联网带教大师',
  personality: 'ENFP（快乐制造机）',
  avatar: '/beagle-hero.png',
  skills: [
    { name: '让新人不崩溃', value: 100, color: '#a855f7' },
    { name: '吐槽同时帮你改代码', value: 200, color: '#22d3ee' },
    { name: '随机输出金句（冷幽默）', value: 999, color: '#fb923c' },
  ],
  hiddenSkill: '在你要放弃时突然出现',
}

export const quotes = [
  {
    id: 1,
    front: '你这个思路其实差一点点',
    emoji: '🤔',
    story: '【占位：当时的故事，换成你的真实回忆】',
  },
  {
    id: 2,
    front: '这个可以再优雅一点',
    emoji: '😌',
    story: '【占位】',
  },
  {
    id: 3,
    front: '先别慌',
    emoji: '🫠',
    story: '【占位：听到这句话的时候你当时什么感受】',
  },
  {
    id: 4,
    front: '你想清楚要做什么了吗',
    emoji: '🧐',
    story: '【占位】',
  },
  {
    id: 5,
    front: '其实你已经做得挺好了',
    emoji: '✨',
    story: '【占位：这句话让你最触动的原因】',
  },
  {
    id: 6,
    front: '这个需求……我也觉得不合理',
    emoji: '😅',
    story: '【占位：某次一起被需求暴击的故事】',
  },
]

export const timelineEvents = [
  {
    id: 1,
    time: '入职第一周',
    title: 'Deadline 前3小时',
    desc: '【占位：当时发生了什么，皮皮做了什么】',
    icon: '⏰',
  },
  {
    id: 2,
    time: '某个周二',
    title: '第一次被需求暴击',
    desc: '【占位：需求突然变了，皮皮怎么帮你稳住的】',
    icon: '💥',
  },
  {
    id: 3,
    time: '深夜11点',
    title: '某次 Debug 到天亮',
    desc: '【占位：一起找 bug 的故事，氛围感要有】',
    icon: '🔍',
  },
  {
    id: 4,
    time: '终于',
    title: '上线的那天',
    desc: '【占位：项目上线时候的感受，有没有说什么】',
    icon: '🚀',
  },
]

export const letterText = `其实做这个网站的时候我就在想，
如果没有你，我可能会走很多弯路。

你不只是教我做事的人，
也是让我觉得这个环境没那么难的人。

谢谢你，皮皮。`

export const toastMessages = [
  '皮皮正在远程支援中...',
  '检测到你在摸鱼',
  '建议：先喝杯水再 debug',
  '皮皮：先别慌',
  '系统提示：你比你以为的更厉害',
  '检测到异常情绪，已呼叫皮皮',
]

export const galleryImages: string[] = []

export const danmakuMessages = [
  '皮皮泥嚎！',
  '今天也要开心鸭！',
  '汪汪！快乐报到！',
  '尾巴摇摇～',
  '快乐小狗路过！',
  '皮皮的快乐小窝欢迎你！',
  'ENFP 快乐制造机！',
  '蹦蹦跳跳一整天！',
  '摸摸皮皮头，好运不用愁！',
  '汪！给你一个爱心！',
  '快乐值 999%！',
  '皮皮正在摇尾巴～',
]
