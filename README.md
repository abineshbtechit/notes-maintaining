# Notes Hub — Apple-Duolingo Hybrid UI

A sleek, responsive, modern web application designed for students, researchers, and software engineers to capture and organize their knowledge across three distinct media formats:

1. **📸 Handwritten Notes**: Photo and multi-page camera scan uploader with built-in contrast/ink enhancement filters.
2. **💻 Technical Content**: Structured markdown and syntax-highlighted code editor with formatting toolbar and real-time preview.
3. **📐 Formulae & Cheatsheet**: Mathematical equation repository with dual modes: **LaTeX math notation** with live **KaTeX rendering**, or **Screenshot / whiteboarding diagrams**.

---

## 🎨 Design System Implementation

Crafted strictly adhering to the **Apple-Duolingo Hybrid Design System**:
- **Palette**: Duolingo's vibrant brand green (`#58CC02`), 3D tactile bottom border lip (`#4FBB02`), and Apple's pristine neutral surfaces (`#FFFFFF`, `#F5F5F7`, `#161617` obsidian container).
- **Tactile 3D Buttons**: Interactive 4px bottom border buttons (`.btn-duo-primary`) that compress with spring-like tactility on press.
- **Floating Pill Bottom Navigation Dock**: Frosted glass dock (`backdrop-filter: blur(18px)`) with glowing active indicator pills.
- **Accessible Contrast**: Strict contrast adherence — zero raw green body copy on white surfaces.
- **Storage**: Client-side **IndexedDB** engine supporting large high-resolution images, multi-page lecture notes, and formula diagrams without hitting standard localStorage quotas.

---

## 🚀 Getting Started

You can open the website immediately in any modern browser without needing to compile or install dependencies:

### Option 1: Direct Browser Launch
Double click `index.html` or open it in your browser:
```
file:///d:/projects/ZOOH - nextLen/notes/index.html
```

### Option 2: Local Static Server (Node.js)
```bash
npx serve -l 3000 .
```
Or with Python:
```bash
python -m http.server 3000
```
Then navigate to `http://localhost:3000` in your web browser.

---

## 🌟 Key Features

- **Upload Section 1 (Photo Upload)**:
  - Drag & drop or file picker.
  - Multi-page image gallery with page removals.
  - Image filters: "Original Color" and "High Contrast (Pencil & Ink)".
- **Upload Section 2 (Technical Content)**:
  - Language selection (Markdown, Python, JavaScript, SQL, C++, Rust).
  - Quick formatting toolbar (Bold, Italic, Headings, Code blocks, Bullet lists).
  - Instant live markdown toggle preview.
  - Summary / Key Takeaways field for revision.
- **Upload Section 3 (Formulae)**:
  - Toggle between **LaTeX / Math Text** and **Screenshot / Diagram**.
  - Quick math symbol chips (`\frac{a}{b}`, `\int`, `\sum`, `\sqrt{}`, `\partial`, `\nabla`, Greek symbols).
  - Real-time **KaTeX** math renderer preview.
  - Variable legend & conceptual breakdown.
- **View Notes (Library Page)**:
  - Instant search across title, subject, tags, code snippets, and formulas.
  - Category filter pills (`All Notes`, `📸 Photos`, `💻 Technical`, `📐 Formulae`, `⭐ Starred`).
  - Metric counters strip for total notes and breakdowns.
  - Fullscreen note inspector modal with zoomable photo viewer, code copy buttons, and LaTeX equation rendering.
  - JSON backup export per note.
