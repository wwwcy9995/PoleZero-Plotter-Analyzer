# PoleZero Plotter & Analyzer / 零极点绘图与分析器

**PoleZero Plotter** is an interactive web application designed for control systems engineering students and professionals. It allows users to visualize and analyze continuous Linear Time-Invariant (LTI) systems through Pole-Zero maps, Bode plots, and AI-powered system analysis.

**PoleZero Plotter** 是专为控制系统工程学生和专业人士设计的交互式 Web 应用程序。它允许用户通过零极点图、波特图和 AI 辅助分析来可视化和理解连续线性时不变 (LTI) 系统。

---

## 🌟 Key Features / 主要功能

### 1. Dual Input Modes / 双重输入模式
- **Interactive Mode**: Manually add, delete, and drag Poles and Zeros on the complex plane. Supports conjugate pairs automatically.
- **Transfer Function Mode**: Input system coefficients (e.g., numerator `1`, denominator `1 2 10` for $s^2 + 2s + 10$). The app automatically calculates the roots using the Durand-Kerner method.
- **交互模式**：在复平面上手动添加、删除和拖动零极点。自动支持共轭对。
- **传递函数模式**：输入系统系数（例如分子 `1`，分母 `1 2 10` 代表 $s^2 + 2s + 10$）。应用使用 Durand-Kerner 方法自动计算根。

### 2. Advanced Visualizations / 高级可视化
- **Pole-Zero Map**: Visualizes roots on the S-Plane. Supports **multiplicity display** (numbers indicate repeated poles/zeros at the same location).
- **Bode Magnitude Plot**: Logarithmic frequency response $|H(j\omega)|$.
- **Phase Response Plot**: Linear frequency response $\angle H(j\omega)$, supporting **negative frequencies** and strictly normalized between $-\pi$ and $\pi$.
- **零极点图**：可视化 S 平面上的根。支持**重数显示**（数字标出同一位置重叠的零极点数量）。
- **幅频响应图**：对数坐标下的幅频响应 $|H(j\omega)|$。
- **相频响应图**：线性坐标下的相频响应 $\angle H(j\omega)$，支持**负频率**显示，并将相位严格限制在 $-\pi$ 到 $\pi$ 之间。

### 3. AI System Analysis / AI 系统分析
- Integrated with **Google Gemini API**.
- Provides instant text analysis on system stability, damping ratio, filter type (Low-pass, High-pass, etc.), and resonance.
- 集成 **Google Gemini API**。
- 提供关于系统稳定性、阻尼比、滤波器类型（低通、高通等）和谐振特性的即时文本分析。

---

## 🛠️ Tech Stack / 技术栈

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **AI Integration**: Google GenAI SDK (@google/genai)
- **Icons**: Lucide React

---

## 🚀 Getting Started / 快速开始

Follow these steps to run the project locally.
按照以下步骤在本地运行项目。

### Prerequisites / 前置要求
- Node.js (v18 or higher / v18 或更高版本)
- Google Gemini API Key / Google Gemini API 密钥

### Installation / 安装

1. **Clone the repository / 克隆仓库**
   git clone https://github.com/yourusername/pole-zero-plotter.git
   cd pole-zero-plotter

````markdown
# 🛠️ Setup and Installation / 设置与安装

## 1. Install Dependencies / 安装依赖

使用 npm 安装项目所需的所有依赖项。

```bash
npm install
````

## 2\. Configure Environment Variables / 配置环境变量

在项目的根目录下创建一个名为 `.env` 的文件，并添加您的 Gemini API Key。

> **注意：**
>
>   * 如果使用 **Vite**，请使用变量名 `VITE_API_KEY`，并更新 `geminiService.ts` 文件以使用 `import.meta.env.VITE_API_KEY`。
>   * 如果使用标准的 **Webpack/CRA**，请使用 `REACT_APP_API_KEY`。

`.env` 文件内容示例：

```env
# Example for Vite / Vite 示例
VITE_API_KEY=your_google_gemini_api_key_here
```

## 3\. Run the application / 运行应用

执行以下命令启动开发服务器：

```bash
npm run dev
```

## 4\. Open in Browser / 在浏览器打开

应用程序启动后，请访问显示的地址：

  * **访问** `http://localhost:5173`（或终端中显示的实际端口号）。

-----

# 📖 Usage Guide / 使用指南

## 1\. Interactive Mode / 交互模式

该模式用于通过图形化方式实时调整系统。

  * **添加元素：** 使用**侧边栏**来添加**极点 (x)** 或**零点 (o)**。
  * **选择元素：** 直接点击列表或图表上的元素来选中它们。
  * **调整位置：** 使用滑块或输入框来调整选中元素的**实部/虚部**位置。
  * **观察结果：** 观察**波特图** (Bode Plot) 的实时更新。

## 2\. Transfer Function Mode / 传递函数模式

该模式用于通过输入传递函数系数来分析系统。

  * **切换模式：** 切换标签页至 **"System Function"**。
  * **输入系数：** 输入**分子**和**分母**多项式的系数。系数应按 $s$ 的**降幂**顺序排列。
      * **示例：** 输入 `1 0 4` 对应的传递函数是 $s^2 + 4$。
  * **生成图表：** 点击 **"Generate Plots"** 按钮。
  * **相位图：** **相位图** (Phase Chart) 仅在此模式下可用，用于分析完整的频率响应。
