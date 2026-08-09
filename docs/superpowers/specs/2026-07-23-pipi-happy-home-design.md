# 皮皮的快乐小窝 · 像素比格犬单一风改造

> 日期：2026-07-23
> 状态：已批准，待写实现计划

## 背景与目标

「皮皮的快乐宇宙」原为深色赛博朋克星空风，已实现双主题（赛博默认 + 像素比格犬可切换）。用户看了像素比格犬主题后决定：就这种像素风了，删掉赛博宇宙页面，整站改为单一的像素比格犬欢快风，改名「皮皮的快乐小窝」。同时新增一个可手动增删改的图片展示区（存腾讯云 COS），并重做 Loading 为「比格犬笑+蹦跳+阳光草地彩虹气球」像素场景。

核心原则：**动态感不变，只换样式**——所有区块的动态行为保留，只把视觉样式从赛博换像素。

## 总约束：动态感不变

以下动态行为**完全保留**，只换样式：

- IntersectionObserver 滚动入场触发
- framer-motion 弹入/缩放/spring 动画
- 翻转卡（QuoteCards hover 翻转）
- 打字机效果（ThankYouLetter）
- 数字计数滚动（CharacterCard 技能值）
- RandomToast 定时弹窗（5s 首 + 30s 间隔）
- Konami Code 彩蛋（↑↑↓↓←→←→BA → confetti）
- Loading 保留「进度条推进 + 完成淡出进主站」骨架

> 鼠标视差原依赖星空层，星空层删除后该效果随之移除，属预期内。

## 一、删赛博宇宙风（像素风成为唯一）

### index.css

- 把 `[data-theme="pixel-beagle"]` 块的变量值搬进 `:root`：米黄底 `#fdf6e3`、比格棕 `#b8743a`、草地绿 `#6ab04c`、暖橙 `#e8a33d`、深棕字 `#3d2817`、中棕副字 `#8b6f47`、方舟像素字体、`--confetti-*` 像素色。
- 删除 `[data-theme="pixel-beagle"]` 选择器及其下所有规则块。
- `.glass-card` 等像素质感覆盖从 `[data-theme]` 作用域改为全局（默认就是像素质感）。
- 删除 `float-star` keyframes（星空专用，不再用）；保留 `twinkle`（ThankYouLetter 星点点缀仍用）。
- 保留 `--font-display` 变量指向方舟像素字体。
- 删除 `.hero-star-layer` / `.hero-beagle-layer` 切换规则。

### 删除的文件

- `src/components/ThemeToggle.tsx`
- `src/hooks/useTheme.ts`

### App.tsx

- 删除 `import ThemeToggle` 与 `<ThemeToggle />` 渲染。
- Konami confetti 继续读 `--confetti-*` 变量（:root 现是像素色，自动像素色），逻辑保留。

### HeroSection.tsx

- 删除星空层（`.hero-star-layer` 整块，含 STARS 数据与鼠标视差 effect）。
- 比格主图 `<img>` 改为默认显示（去掉 `hero-beagle-layer` 容器与隐藏逻辑，直接渲染）。

### LoadingScreen.tsx

- 删除赛博日志 `LOG_LINES_CYBER`、扫描线、`useTheme` 主题判断、`isPixel` 分支。
- 整个 Loading 换成像素场景（见下）。

## 二、新 Loading：居中蹦跳像素场景

全屏 SVG 像素画 + CSS keyframes，保留「进度条推进 + 完成淡出进主站」骨架。

### 画面元素（自上而下）

- 天空背景：浅蓝 → 米黄渐变。
- 右上太阳：黄色像素圆 + 8 道光线，旋转 + 光线闪烁。
- 顶部彩虹弧：7 色像素弧。
- 两侧气球 2–3 个：橙/绿/蓝，上下浮 + 轻摆。
- 中央比格犬：眯眼张嘴笑、上下蹦跳、尾巴摇、偶眨眼（像素 SVG，比现有 LoadingScreen mascot 更精致——全身 + 笑脸 + 站位）。
- 底部草地：绿像素波浪，左右摇曳。
- 进度条：草地下方，欢快色，「快乐加载中… 60%」。
- 文案轮播：「皮皮正在蹦跶…」「快乐值加载中…」「尾巴摇到 99%…」。

### 时长与过渡

- 总时长约 5.8s（与现有一致）。
- 完成时：比格犬加速蹦 + 气球飞起 + 淡出进主站。

### keyframes（index.css）

- `sun-rotate`：太阳旋转。
- `balloon-float`：气球上下浮 + 轻摆。
- 复用已有 `beagle-bounce` / `beagle-tail` / `beagle-blink`。
- `grass-sway`：草地左右摇曳。

### 阶段性

先做基础版（场景元素 + 基础动效），后续再丰富。

## 三、区块标签改欢快

| 位置 | 原 | 改 |
|---|---|---|
| index.html title | 皮皮的快乐宇宙 (Beta) | 皮皮的快乐小窝 |
| Hero 主标题 | 皮皮的快乐宇宙 | 皮皮的快乐小窝 |
| Hero badge | Beta v1.0.0 · 仅限内测 | 快乐小窝 v1.0 |
| CharacterCard | CHARACTER DATA / 他的设定卡 | 皮皮档案 / 皮皮是谁 |
| QuoteCards | CLASSIC QUOTES / 经典语录 | 快乐语录 / 皮皮金句 |
| Timeline | SURVIVAL LOG / 我们差点挂掉的几个瞬间 | 冒险日记 / 一起冒险的日子 |
| ThankYouLetter | FINAL SCREEN / 说点正经的 | 写给你 / 悄悄话 |
| Loading | BEAGLE BOOT | 快乐启动 |

## 四、图片展示区域（新）

### 组件

新建 `src/components/ImageGallery.tsx`，放 Timeline 与 ThankYouLetter 之间。

### 展示

- 像素方块卡网格（响应式：移动端 1 列，桌面 2–3 列）。
- 质感跟整站一致：`glass-card`（实色方块 + 硬边框 + 硬阴影 + 小圆角）。

### 编辑交互（仅 ?edit=true）

- 末尾一张「+ 添加图片」卡（虚线框 + 加号），点击触发文件选择 → 上传。
- 每张图 hover 显示「✕ 删除」按钮（右上角）。
- 先做增删，不做拖拽排序、不做改图。

### 数据

- `content.ts` 加 `galleryImages: string[]`（默认空数组）。
- `EditContext` 的 `AppData` 加 `gallery: string[]` 字段。
- reducer 加 `ADD_IMAGE`（payload: url）与 `REMOVE_IMAGE`（payload: index）两个 action。
- `loadFromCOS` 校验加 `Array.isArray(parsed?.gallery)` 容错（缺失时默认空）。
- `saveToCOS` 已存整个 AppData，gallery 自动随存取。

### COS 上传（按规范文档）

- 复用/重构 `useCOS` 的图片上传：上传前压缩到最大 800px、jpeg 0.8 质量（规范文档 compressImage）。
- 路径 `pipi/gallery/${timestamp}-${random}.jpg`（pipi 前缀避免与 rilakkuma 项目冲突）。
- 返回公开 URL 存入 `gallery` 数组。

### 动效

- IntersectionObserver + motion 入场（与 CharacterCard 一致），保持动态感统一。

## 五、useCOS 规范化

- 抽出通用图片上传函数：压缩（800px/jpeg 0.8）+ `pipi/` 路径前缀。
- avatar 上传走 `pipi/avatars/`，gallery 上传走 `pipi/gallery/`，共用压缩逻辑。
- 现有 `uploadImageToCOS`（路径 `avatars/avatar-...`、无压缩）改为走新通用函数。
- `loadFromCOS` / `saveToCOS` 的 data.json key 保持 `pipi/data.json`。

## 六、avatar

- `content.ts` 的 `characterData.avatar` 默认从 `🧑‍💻` 改为 `/beagle-hero.png`（用户已提供的桌面比格图占位）。
- `CharacterCard` 的 `AvatarContent` 渲染逻辑：`startsWith('http')` 或 `startsWith('/')` 都走 `<img>`，否则当 emoji。
- 用户后续提供「标准像素风比格」图后，编辑模式上传替换（存云端以云端为准）。
- 不用 🐶 emoji。

## 七、数据结构变更汇总

### content.ts

- `characterData.avatar` → `/beagle-hero.png`
- 新增 `galleryImages: string[]`

### EditContext.tsx

- `AppData` 加 `gallery: string[]`
- 初始 `initialData` 加 `gallery: galleryImages`
- `Action` 加 `ADD_IMAGE` / `REMOVE_IMAGE`
- `reducer` 处理两个新 action

### useCOS.ts

- 图片上传加压缩 + pipi/ 前缀
- `loadFromCOS` 校验加 gallery 容错

## 八、验证

1. `cd /Users/zengxinyue/pipi-universe && npm run dev`
2. 首页标题「皮皮的快乐小窝」（index.html title + Hero 主标题）。
3. Loading：像素场景（太阳旋转/气球浮动/比格犬蹦跳笑/草地摇曳/彩虹）+ 进度条推进 + 完成淡出进主站。
4. 各区块：欢快标签（皮皮档案/快乐语录/冒险日记/写给你）+ 动态行为与改造前一致（入场/翻转/打字机/计数/toast/彩蛋）。
5. 图片区域：展示网格；`?edit=true` 下添加图片（压缩上传到 pipi/gallery/）、删除；刷新仍存在（云端）。
6. avatar：显示 /beagle-hero.png；编辑模式可上传替换。
7. 无赛博残留：无星空、无 ThemeToggle、无 ?theme= 切换、无赛博日志。
8. Konami 彩蛋 confetti 是像素色（棕绿橙）。
9. 移动端响应式不破版。
