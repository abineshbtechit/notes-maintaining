# Notes Hub — React Edition (`version2`)

A sleek, responsive, modular **React 18 + Vite** application implementing the **Apple-Duolingo Hybrid Design System** for capturing, cataloging, and studying knowledge across three distinct media formats:

1. **📸 Handwritten Notes**: Photo and multi-page camera scan uploader with built-in contrast/pencil-ink enhancement filters.
2. **💻 Technical Content**: Structured markdown and syntax-highlighted code editor with formatting toolbar and real-time live preview.
3. **📐 Formulae & Cheatsheet**: Mathematical equation repository with dual modes: **LaTeX math notation** with live **KaTeX rendering**, or **Screenshot / whiteboarding diagrams**.

---

## 🌟 Key Architecture & Capabilities in React

- **Component-Driven Architecture**:
  - `Header`: Apple minimalism with gamified Duolingo streak (`🔥`) and view switcher.
  - `UploadStudio`: 3-section tabbed uploader (`PhotoUploadForm`, `TechnicalUploadForm`, `FormulaUploadForm`).
  - `NotesLibrary`: Full knowledge library with stat counter strips, real-time search, and category filter chips.
  - `FolderExplorer`: Apple-style clickable breadcrumb navigation and folder/topic pills.
  - `NoteCard`: Interactive note card with folder tags, previews, star toggle, edit & delete buttons.
  - `InspectorModal`: Fullscreen modal with high-res photo zoom, copyable code, and KaTeX equation rendering.
  - `EditNoteModal`: Full editing capability for Title, Folder, Topic, Content, LaTeX, and Tags.
  - `FloatingDock`: Apple-style floating bottom navigation dock with frosted blur (`backdrop-filter: blur(18px)`).
- **Persistent Storage**:
  - High-capacity **IndexedDB** client-side storage capable of holding multi-page high-resolution note scans without localStorage quotas.
- **Hierarchical Categorization**:
  - Pre-seeded with the **Percentages** folder (Topics: *Profit & Loss*, *Successive Percentage*, *Discounts & Markup*, *Basic Fractions to %*), plus Calculus, Computer Science, and Physics.

---

## 🚀 Running the React App

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the Vite development server
npm run dev

# 3. Or build for production
npm run build
npm run preview
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
