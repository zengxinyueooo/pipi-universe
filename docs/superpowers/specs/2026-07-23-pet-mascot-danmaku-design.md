# 摸摸皮皮 mascot + 泡泡弹幕 设计

> 日期：2026-07-23
> 状态：已批准，待实现

## 背景

「皮皮的快乐小窝」（像素比格犬夏天温馨风）加两个互动功能：**摸摸皮皮**（右下浮动可点比格犬 mascot，递进反应）+ **泡泡弹幕**（预定义彩色光泽泡泡弹幕全屏横向飘过）。目标：治愈 + 五彩缤纷，无后端依赖。

## 一、摸摸皮皮（PetBeagle.tsx）

- 新组件，**右下角浮动**一只小号像素比格犬 mascot（独立于 Hero 背景图，常驻可点）。
- 位置 `fixed right-6 bottom-6 z-40`（不挡左下 RandomToast）。
- 点击触发，按点击次数递进反应：
  - **1–2 次**：摇尾（beagle-tail）+ 头顶冒爱心（爱心 SVG 飘起渐隐）+ 气泡「汪！」
  - **3–4 次**：左右蹭动（translateX 摆动）+ 多个爱心 + 「汪汪！」
  - **5 次起**：打盹（闭眼 + 倒下 rotate + 「zzz」），3s 内不冒爱心，过后重置计数
- framer-motion + 复用 `beagle-tail` keyframes；爱心新增 `heart-float` keyframe（translateY 上飘 + opacity 渐隐）。

## 二、泡泡弹幕（DanmakuBubbles.tsx）

- 新组件，全屏 `fixed inset-0 z-30 pointer-events-none`，从右往左飘过。
- **泡泡形弹幕**：每个弹幕是一个彩色椭圆/圆（颜色池：橙 #e8a33d / 绿 #6ab04c / 粉 #d68bb0 / 蓝 #5fa8d3 / 紫 #c084fc / 黄 #ffd23f），带光泽（顶部白色高光圆 + 径向渐变填充 + 外柔光 box-shadow），文字在泡泡里（深色字配亮泡泡，或白字配深泡泡）。
- 多条同时飘，**随机高度 / 速度 / 大小 / 颜色**，错落叠加。
- 预定义内容数组（`content.ts` 加 `danmakuMessages`），持续循环，无交互、不存云端。
- keyframes `bubble-danmaku`：`translateX(100vw) → translateX(-30vw)` 横移，周期随机 8–16s。

## 三、弹幕内容（content.ts `danmakuMessages`）

```
皮皮泥嚎！
今天也要开心鸭！
汪汪！快乐报到！
尾巴摇摇～
快乐小狗路过！
皮皮的快乐小窝欢迎你！
ENFP 快乐制造机！
蹦蹦跳跳一整天！
摸摸皮皮头，好运不用愁！
汪！给你一个爱心！
快乐值 999%！
皮皮正在摇尾巴～
```

## 四、不动 / 不引入

- 弹幕**不存云端、不需审核**（内容预定义，无用户输入）。
- `EditContext` / `useCOS` 不动（弹幕纯前端常量）。

## 五、文件结构

新建：
- `src/components/PetBeagle.tsx` — 浮动 mascot + 递进反应
- `src/components/DanmakuBubbles.tsx` — 泡泡弹幕层

修改：
- `src/data/content.ts` — 加 `danmakuMessages`
- `src/index.css` — 加 `heart-float` / `bubble-danmaku` keyframes
- `src/App.tsx` — 渲染 `<DanmakuBubbles />`（固定层）+ `<PetBeagle />`（右下浮动）

## 六、验证

`npm run dev`：
1. 右下有像素比格犬 mascot，点 1–2 次摇尾冒爱心「汪！」；3–4 次蹭动多爱心「汪汪！」；5 次起打盹 zzz，3s 后恢复。
2. 全屏有彩色光泽泡泡弹幕从右往左飘，多条错落，内容来自预定义数组循环。
3. mascot 不挡左下 RandomToast；弹幕层 pointer-events-none 不挡点击。
4. 类型检查 + 构建通过。
