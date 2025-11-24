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
   ```bash
   git clone https://github.com/yourusername/pole-zero-plotter.git
   cd pole-zero-plotter
