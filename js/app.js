/**
 * Main Application Logic for Notes Hub
 * Apple-Duolingo Hybrid Design System
 * With Hierarchical Folder & Topic Organization + Full Library Editing
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 1. Initialize IndexedDB & Seed Data if empty
  await window.notesDB.init();
  if (typeof seedDefaultDataIfEmpty === 'function') {
    await seedDefaultDataIfEmpty();
  }

  // Global State
  const state = {
    currentView: 'upload',          // 'upload' | 'library'
    currentUploadTab: 'photo',      // 'photo' | 'technical' | 'formula'
    formulaMode: 'latex',           // 'latex' | 'screenshot'
    photoQualityFilter: 'standard', // 'standard' | 'contrast'
    uploadedPhotos: [],             // Array of base64 strings
    uploadedFormulaScreenshot: null,
    searchQuery: '',
    categoryFilter: 'all',          // 'all' | 'photo' | 'technical' | 'formula' | 'starred'
    selectedFolder: 'all',          // 'all' | folder name
    selectedTopic: 'all',           // 'all' | topic name
    activeModalNote: null,
    editingNote: null
  };

  // DOM Elements
  const viewUpload = document.getElementById('viewUpload');
  const viewLibrary = document.getElementById('viewLibrary');
  const navBtnUpload = document.getElementById('navBtnUpload');
  const navBtnLibrary = document.getElementById('navBtnLibrary');
  const dockBtnUpload = document.getElementById('dockBtnUpload');
  const dockBtnLibrary = document.getElementById('dockBtnLibrary');
  const toastEl = document.getElementById('toastNotice');
  const toastMessage = document.getElementById('toastMessage');

  // Stat Counters
  const statTotal = document.getElementById('statTotal');
  const statPhotos = document.getElementById('statPhotos');
  const statTech = document.getElementById('statTech');
  const statFormula = document.getElementById('statFormula');

  // ==========================================
  // FOLDERS & TOPICS DROPDOWN MANAGEMENT
  // ==========================================
  function populateFolderDropdowns(selectedFolderName = null) {
    const folders = window.notesDB.getRegisteredFolders();
    const folderSelects = document.querySelectorAll('.folder-select');

    folderSelects.forEach(select => {
      const currentVal = select.value;
      select.innerHTML = '';
      
      folders.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.folder;
        opt.textContent = f.folder;
        select.appendChild(opt);
      });

      if (selectedFolderName && folders.some(f => f.folder === selectedFolderName)) {
        select.value = selectedFolderName;
      } else if (currentVal && folders.some(f => f.folder === currentVal)) {
        select.value = currentVal;
      } else if (folders.length > 0) {
        select.value = folders[0].folder;
      }

      // Populate corresponding topic dropdown
      const topicSelectId = select.id.replace('Folder', 'Topic');
      const topicSelect = document.getElementById(topicSelectId);
      if (topicSelect) {
        populateTopicDropdown(select.value, topicSelect);
      }
    });
  }

  function populateTopicDropdown(folderName, topicSelectEl, selectedTopicName = null) {
    if (!topicSelectEl) return;
    const folders = window.notesDB.getRegisteredFolders();
    const folderObj = folders.find(f => f.folder.toLowerCase() === (folderName || '').toLowerCase());
    
    topicSelectEl.innerHTML = '';
    const topics = folderObj && folderObj.topics && folderObj.topics.length > 0 
      ? folderObj.topics 
      : ['General Notes'];

    topics.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      topicSelectEl.appendChild(opt);
    });

    if (selectedTopicName && topics.includes(selectedTopicName)) {
      topicSelectEl.value = selectedTopicName;
    } else {
      topicSelectEl.value = topics[0];
    }
  }

  // Attach change listeners to all folder selects to update their paired topic select
  document.querySelectorAll('.folder-select').forEach(select => {
    select.addEventListener('change', () => {
      const topicSelectId = select.id.replace('Folder', 'Topic');
      const topicSelect = document.getElementById(topicSelectId);
      if (topicSelect) {
        populateTopicDropdown(select.value, topicSelect);
      }
    });
  });

  // Quick "+ New Folder" modal handling
  const newFolderModal = document.getElementById('newFolderModalOverlay');
  const formNewFolder = document.getElementById('formNewFolder');
  const newFolderInput = document.getElementById('newFolderInput');
  const newFolderInitialTopic = document.getElementById('newFolderInitialTopic');
  const newFolderCloseBtn = document.getElementById('newFolderCloseBtn');
  const btnNewFolderCancel = document.getElementById('btnNewFolderCancel');
  const newFolderHeading = document.getElementById('newFolderModalHeading');
  const newFolderInputLabel = document.getElementById('newFolderInputLabel');
  const newFolderTargetType = document.getElementById('newFolderTargetType');
  const newFolderParentFolder = document.getElementById('newFolderParentFolder');
  const newFolderInitialTopicGroup = document.getElementById('newFolderInitialTopicGroup');
  let activeTriggerSelect = null;

  document.querySelectorAll('.btn-add-folder-quick').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTriggerSelect = btn.previousElementSibling;
      newFolderTargetType.value = 'folder';
      newFolderHeading.textContent = 'Create New Folder / Subject';
      newFolderInputLabel.textContent = 'Folder Name *';
      newFolderInput.placeholder = 'e.g. Percentages, Algebra, DevOps';
      newFolderInitialTopicGroup.style.display = 'block';
      newFolderInput.value = '';
      newFolderInitialTopic.value = '';
      newFolderModal.classList.add('active');
      newFolderInput.focus();
    });
  });

  document.querySelectorAll('.btn-add-topic-quick').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTriggerSelect = btn.previousElementSibling;
      const folderSelectId = btn.dataset.folderSelect;
      const folderSelect = document.getElementById(folderSelectId);
      const parentFolderName = folderSelect ? folderSelect.value : 'General';

      newFolderTargetType.value = 'topic';
      newFolderParentFolder.value = parentFolderName;
      newFolderHeading.textContent = `New Topic in "${parentFolderName}"`;
      newFolderInputLabel.textContent = 'Topic Name *';
      newFolderInput.placeholder = 'e.g. Profit & Loss, Successive %';
      newFolderInitialTopicGroup.style.display = 'none';
      newFolderInput.value = '';
      newFolderModal.classList.add('active');
      newFolderInput.focus();
    });
  });

  function closeNewFolderModal() {
    newFolderModal.classList.remove('active');
    activeTriggerSelect = null;
  }

  newFolderCloseBtn.addEventListener('click', closeNewFolderModal);
  btnNewFolderCancel.addEventListener('click', closeNewFolderModal);

  formNewFolder.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = newFolderTargetType.value;
    const name = newFolderInput.value.trim();

    if (!name) return;

    if (type === 'folder') {
      const topicName = newFolderInitialTopic.value.trim() || 'General Notes';
      window.notesDB.registerFolder(name, topicName);
      populateFolderDropdowns(name);
      showToast(`📁 Folder "${name}" created!`);
    } else {
      const parentFolder = newFolderParentFolder.value;
      window.notesDB.registerFolder(parentFolder, name);
      populateFolderDropdowns(parentFolder);
      if (activeTriggerSelect) {
        populateTopicDropdown(parentFolder, activeTriggerSelect, name);
      }
      showToast(`🏷️ Topic "${name}" created in ${parentFolder}!`);
    }

    renderFolderExplorer();
    closeNewFolderModal();
  });

  // Initial populate of all folder/topic selects
  populateFolderDropdowns();

  // ==========================================
  // NAVIGATION ROUTING
  // ==========================================
  function switchView(viewName) {
    state.currentView = viewName;
    
    if (viewName === 'upload') {
      viewUpload.classList.add('active');
      viewLibrary.classList.remove('active');
      navBtnUpload.classList.add('active');
      navBtnLibrary.classList.remove('active');
      dockBtnUpload.classList.add('active');
      dockBtnLibrary.classList.remove('active');
    } else {
      viewUpload.classList.remove('active');
      viewLibrary.classList.add('active');
      navBtnUpload.classList.remove('active');
      navBtnLibrary.classList.add('active');
      dockBtnUpload.classList.remove('active');
      dockBtnLibrary.classList.add('active');
      renderFolderExplorer();
      renderNotesLibrary();
    }
    updateStats();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navBtnUpload.addEventListener('click', () => switchView('upload'));
  navBtnLibrary.addEventListener('click', () => switchView('library'));
  dockBtnUpload.addEventListener('click', () => switchView('upload'));
  dockBtnLibrary.addEventListener('click', () => switchView('library'));

  const heroVaultBtn = document.getElementById('heroVaultBtn');
  if (heroVaultBtn) {
    heroVaultBtn.addEventListener('click', () => switchView('library'));
  }

  // ==========================================
  // UPLOAD STUDIO TABS (3 MAIN SECTIONS)
  // ==========================================
  const tabCards = document.querySelectorAll('.upload-tab-card');
  const flowSections = {
    photo: document.getElementById('flowPhoto'),
    technical: document.getElementById('flowTechnical'),
    formula: document.getElementById('flowFormula')
  };

  function switchUploadTab(tabKey) {
    state.currentUploadTab = tabKey;
    tabCards.forEach(card => {
      card.classList.toggle('active', card.dataset.tab === tabKey);
    });

    Object.keys(flowSections).forEach(key => {
      flowSections[key].classList.toggle('active', key === tabKey);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  tabCards.forEach(card => {
    card.addEventListener('click', () => {
      switchUploadTab(card.dataset.tab);
    });
  });

  // ==========================================
  // SECTION 1: PHOTO NOTES LOGIC
  // ==========================================
  const photoDropzone = document.getElementById('photoDropzone');
  const photoFileInput = document.getElementById('photoFileInput');
  const photoGallery = document.getElementById('photoGallery');
  const photoFilterPills = document.querySelectorAll('.filter-pill[data-filter]');

  ['dragenter', 'dragover'].forEach(eventName => {
    photoDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      photoDropzone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    photoDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      photoDropzone.classList.remove('drag-over');
    });
  });

  photoDropzone.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    handlePhotoUpload(files);
  });

  photoDropzone.addEventListener('click', () => photoFileInput.click());
  photoFileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handlePhotoUpload(files);
  });

  function handlePhotoUpload(files) {
    if (!files.length) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        state.uploadedPhotos.push(e.target.result);
        renderPhotoGallery();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPhotoGallery() {
    photoGallery.innerHTML = '';
    state.uploadedPhotos.forEach((dataUrl, index) => {
      const thumb = document.createElement('div');
      thumb.className = `preview-thumb-card ${state.photoQualityFilter === 'contrast' ? 'enhanced' : ''}`;
      thumb.innerHTML = `
        <img src="${dataUrl}" alt="Notes Page ${index + 1}">
        <button type="button" class="preview-thumb-remove" title="Remove" data-index="${index}">✕</button>
      `;
      photoGallery.appendChild(thumb);
    });

    photoGallery.querySelectorAll('.preview-thumb-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index, 10);
        state.uploadedPhotos.splice(idx, 1);
        renderPhotoGallery();
      });
    });
  }

  photoFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      photoFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.photoQualityFilter = pill.dataset.filter;
      renderPhotoGallery();
    });
  });

  const formPhotoNotes = document.getElementById('formPhotoNotes');
  formPhotoNotes.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('photoTitle').value.trim();
    const folder = document.getElementById('photoFolder').value.trim();
    const topic = document.getElementById('photoTopic').value.trim();
    const tagsInput = document.getElementById('photoTags').value;
    const notesText = document.getElementById('photoDescription').value.trim();

    if (!title) {
      showToast('⚠️ Please enter a title for your handwritten notes', 'warning');
      return;
    }

    if (state.uploadedPhotos.length === 0) {
      showToast('📸 Please upload at least one photo of your notes', 'warning');
      return;
    }

    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    const newNote = {
      id: 'photo-' + Date.now(),
      type: 'photo',
      title,
      folder: folder || 'General',
      topic: topic || 'General Notes',
      tags,
      images: [...state.uploadedPhotos],
      notesText,
      qualityFilter: state.photoQualityFilter,
      starred: false,
      createdAt: new Date().toISOString()
    };

    await window.notesDB.saveNote(newNote);
    showToast(`✨ Photo Notes Saved in ${folder} → ${topic}! (+15 XP)`);

    formPhotoNotes.reset();
    state.uploadedPhotos = [];
    renderPhotoGallery();
    populateFolderDropdowns(folder);
    updateStats();
  });

  // ==========================================
  // SECTION 2: TECHNICAL CONTENT LOGIC
  // ==========================================
  const formTechnical = document.getElementById('formTechnical');
  const techContentInput = document.getElementById('techContent');
  const techLivePreview = document.getElementById('techLivePreview');
  const btnToggleLivePreview = document.getElementById('btnToggleLivePreview');
  let isPreviewVisible = false;

  btnToggleLivePreview.addEventListener('click', () => {
    isPreviewVisible = !isPreviewVisible;
    techLivePreview.style.display = isPreviewVisible ? 'block' : 'none';
    btnToggleLivePreview.textContent = isPreviewVisible ? 'Hide Preview' : 'Live Preview';
    if (isPreviewVisible) updateTechPreview();
  });

  techContentInput.addEventListener('input', () => {
    if (isPreviewVisible) updateTechPreview();
  });

  function updateTechPreview() {
    const raw = techContentInput.value;
    if (!raw.trim()) {
      techLivePreview.innerHTML = '<span style="color: var(--text-muted); font-style: italic;">Markdown preview will appear here...</span>';
      return;
    }
    let html = raw
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/^### (.*$)/gim, '<h4 style="margin: 8px 0; font-size: 16px;">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 style="margin: 10px 0; font-size: 18px;">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 style="margin: 12px 0; font-size: 20px;">$1</h2>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background: #E8E8EA; padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>')
      .replace(/\n/gim, '<br>');
    techLivePreview.innerHTML = html;
  }

  document.querySelectorAll('.tool-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const start = techContentInput.selectionStart;
      const end = techContentInput.selectionEnd;
      const val = techContentInput.value;
      let inserted = '';

      switch (action) {
        case 'bold': inserted = `**${val.substring(start, end) || 'bold text'}**`; break;
        case 'italic': inserted = `*${val.substring(start, end) || 'italic text'}*`; break;
        case 'code': inserted = `\`\`\`javascript\n${val.substring(start, end) || '// Your code here'}\n\`\`\``; break;
        case 'h2': inserted = `\n## ${val.substring(start, end) || 'Section Heading'}\n`; break;
        case 'list': inserted = `\n- Item 1\n- Item 2\n- Item 3\n`; break;
      }

      techContentInput.value = val.substring(0, start) + inserted + val.substring(end);
      techContentInput.focus();
      techContentInput.dispatchEvent(new Event('input'));
    });
  });

  formTechnical.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('techTitle').value.trim();
    const folder = document.getElementById('techFolder').value.trim();
    const topic = document.getElementById('techTopic').value.trim();
    const language = document.getElementById('techLanguage').value;
    const content = techContentInput.value.trim();
    const summary = document.getElementById('techSummary').value.trim();
    const tagsInput = document.getElementById('techTags').value;

    if (!title || !content) {
      showToast('⚠️ Title and technical content cannot be empty', 'warning');
      return;
    }

    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    const newNote = {
      id: 'tech-' + Date.now(),
      type: 'technical',
      title,
      folder: folder || 'General',
      topic: topic || 'General Notes',
      language,
      content,
      summary,
      tags,
      starred: false,
      createdAt: new Date().toISOString()
    };

    await window.notesDB.saveNote(newNote);
    showToast(`🚀 Technical Document Saved in ${folder} → ${topic}! (+20 XP)`);

    formTechnical.reset();
    techLivePreview.style.display = 'none';
    isPreviewVisible = false;
    btnToggleLivePreview.textContent = 'Live Preview';
    populateFolderDropdowns(folder);
    updateStats();
  });

  // ==========================================
  // SECTION 3: FORMULAE LOGIC (SCREENSHOT OR LATEX)
  // ==========================================
  const formulaModeLatexBtn = document.getElementById('formulaModeLatex');
  const formulaModeScreenshotBtn = document.getElementById('formulaModeScreenshot');
  const formulaLatexSection = document.getElementById('formulaLatexSection');
  const formulaScreenshotSection = document.getElementById('formulaScreenshotSection');
  const formulaLatexInput = document.getElementById('formulaLatexInput');
  const mathLiveRenderBox = document.getElementById('mathLiveRenderBox');

  formulaModeLatexBtn.addEventListener('click', () => {
    state.formulaMode = 'latex';
    formulaModeLatexBtn.classList.add('active');
    formulaModeScreenshotBtn.classList.remove('active');
    formulaLatexSection.style.display = 'block';
    formulaScreenshotSection.style.display = 'none';
  });

  formulaModeScreenshotBtn.addEventListener('click', () => {
    state.formulaMode = 'screenshot';
    formulaModeScreenshotBtn.classList.add('active');
    formulaModeLatexBtn.classList.remove('active');
    formulaLatexSection.style.display = 'none';
    formulaScreenshotSection.style.display = 'block';
  });

  formulaLatexInput.addEventListener('input', () => {
    window.mathRenderer.render(formulaLatexInput.value, mathLiveRenderBox, true);
  });

  document.querySelectorAll('.symbol-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const snippet = chip.dataset.snippet;
      window.mathRenderer.insertSnippet(formulaLatexInput, snippet);
    });
  });

  const formulaDropzone = document.getElementById('formulaDropzone');
  const formulaFileInput = document.getElementById('formulaFileInput');
  const formulaScreenshotPreview = document.getElementById('formulaScreenshotPreview');

  ['dragenter', 'dragover'].forEach(eventName => {
    formulaDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      formulaDropzone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    formulaDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      formulaDropzone.classList.remove('drag-over');
    });
  });

  formulaDropzone.addEventListener('drop', (e) => {
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
    if (file) handleFormulaScreenshot(file);
  });

  formulaDropzone.addEventListener('click', () => formulaFileInput.click());
  formulaFileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFormulaScreenshot(e.target.files[0]);
  });

  function handleFormulaScreenshot(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      state.uploadedFormulaScreenshot = e.target.result;
      formulaScreenshotPreview.innerHTML = `
        <div style="position: relative; max-width: 480px; margin: 12px auto;">
          <img src="${e.target.result}" style="width: 100%; border-radius: var(--radius-md); border: 1px solid var(--border);" alt="Formula Screenshot">
          <button type="button" id="btnRemoveFormulaScreenshot" class="preview-thumb-remove" style="top: 8px; right: 8px; width: 28px; height: 28px;">✕</button>
        </div>
      `;
      document.getElementById('btnRemoveFormulaScreenshot').addEventListener('click', (ev) => {
        ev.stopPropagation();
        state.uploadedFormulaScreenshot = null;
        formulaScreenshotPreview.innerHTML = '';
      });
    };
    reader.readAsDataURL(file);
  }

  const formFormula = document.getElementById('formFormula');
  formFormula.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('formulaTitle').value.trim();
    const folder = document.getElementById('formulaFolder').value.trim();
    const topic = document.getElementById('formulaTopic').value.trim();
    const breakdown = document.getElementById('formulaBreakdown').value.trim();
    const tagsInput = document.getElementById('formulaTags').value;

    if (!title) {
      showToast('⚠️ Please provide a formula name or theorem title', 'warning');
      return;
    }

    if (state.formulaMode === 'latex' && !formulaLatexInput.value.trim()) {
      showToast('📐 Please enter LaTeX notation or switch to Screenshot mode', 'warning');
      return;
    }

    if (state.formulaMode === 'screenshot' && !state.uploadedFormulaScreenshot) {
      showToast('📸 Please upload a formula screenshot or diagram', 'warning');
      return;
    }

    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    const newNote = {
      id: 'formula-' + Date.now(),
      type: 'formula',
      title,
      folder: folder || 'General',
      topic: topic || 'General Notes',
      mode: state.formulaMode,
      latexText: state.formulaMode === 'latex' ? formulaLatexInput.value.trim() : '',
      screenshotUrl: state.formulaMode === 'screenshot' ? state.uploadedFormulaScreenshot : null,
      breakdown,
      tags,
      starred: false,
      createdAt: new Date().toISOString()
    };

    await window.notesDB.saveNote(newNote);
    showToast(`📐 Formula Saved in ${folder} → ${topic}! (+25 XP)`);

    formFormula.reset();
    state.uploadedFormulaScreenshot = null;
    formulaScreenshotPreview.innerHTML = '';
    mathLiveRenderBox.innerHTML = '<span style="color: var(--text-muted); font-size: 14px; font-style: italic;">Enter LaTeX code above to preview equation</span>';
    populateFolderDropdowns(folder);
    updateStats();
  });

  // ==========================================
  // PAGE 2: FOLDER & TOPIC EXPLORER HIERARCHY
  // ==========================================
  const libraryBreadcrumbs = document.getElementById('libraryBreadcrumbs');
  const libraryFolderChips = document.getElementById('libraryFolderChips');
  const libraryTopicSubbar = document.getElementById('libraryTopicSubbar');
  const libraryTopicChips = document.getElementById('libraryTopicChips');

  async function renderFolderExplorer() {
    const allNotes = await window.notesDB.getAllNotes();
    const registered = window.notesDB.getRegisteredFolders();

    // Compute note counts per folder
    const folderCounts = {};
    const topicCounts = {};

    allNotes.forEach(n => {
      const f = n.folder || 'General';
      const t = n.topic || 'General Notes';
      folderCounts[f] = (folderCounts[f] || 0) + 1;
      
      if (!topicCounts[f]) topicCounts[f] = {};
      topicCounts[f][t] = (topicCounts[f][t] || 0) + 1;
    });

    // Make sure registered folders also appear
    registered.forEach(r => {
      if (folderCounts[r.folder] === undefined) folderCounts[r.folder] = 0;
      if (!topicCounts[r.folder]) topicCounts[r.folder] = {};
      (r.topics || []).forEach(top => {
        if (topicCounts[r.folder][top] === undefined) topicCounts[r.folder][top] = 0;
      });
    });

    // Render Breadcrumbs
    libraryBreadcrumbs.innerHTML = '';
    const homeCrumb = document.createElement('span');
    homeCrumb.className = `breadcrumb-item ${state.selectedFolder === 'all' ? 'active' : ''}`;
    homeCrumb.innerHTML = `<i data-lucide="folders" style="width: 15px; height: 15px;"></i> All Folders`;
    homeCrumb.addEventListener('click', () => {
      state.selectedFolder = 'all';
      state.selectedTopic = 'all';
      renderFolderExplorer();
      renderNotesLibrary();
    });
    libraryBreadcrumbs.appendChild(homeCrumb);

    if (state.selectedFolder !== 'all') {
      const sep1 = document.createElement('span');
      sep1.className = 'breadcrumb-separator';
      sep1.textContent = '>';
      libraryBreadcrumbs.appendChild(sep1);

      const folderCrumb = document.createElement('span');
      folderCrumb.className = `breadcrumb-item ${state.selectedTopic === 'all' ? 'active' : ''}`;
      folderCrumb.innerHTML = `📁 ${escapeHtml(state.selectedFolder)}`;
      folderCrumb.addEventListener('click', () => {
        state.selectedTopic = 'all';
        renderFolderExplorer();
        renderNotesLibrary();
      });
      libraryBreadcrumbs.appendChild(folderCrumb);

      if (state.selectedTopic !== 'all') {
        const sep2 = document.createElement('span');
        sep2.className = 'breadcrumb-separator';
        sep2.textContent = '>';
        libraryBreadcrumbs.appendChild(sep2);

        const topicCrumb = document.createElement('span');
        topicCrumb.className = 'breadcrumb-item active';
        topicCrumb.innerHTML = `🏷️ ${escapeHtml(state.selectedTopic)}`;
        libraryBreadcrumbs.appendChild(topicCrumb);
      }
    }

    // Render Folder Pills Row
    libraryFolderChips.innerHTML = '';
    
    // "All" Pill
    const allPill = document.createElement('button');
    allPill.type = 'button';
    allPill.className = `folder-pill ${state.selectedFolder === 'all' ? 'active' : ''}`;
    allPill.innerHTML = `All Folders <span class="pill-count">${allNotes.length}</span>`;
    allPill.addEventListener('click', () => {
      state.selectedFolder = 'all';
      state.selectedTopic = 'all';
      renderFolderExplorer();
      renderNotesLibrary();
    });
    libraryFolderChips.appendChild(allPill);

    // Individual Folder Pills
    Object.keys(folderCounts).sort().forEach(folderName => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `folder-pill ${state.selectedFolder === folderName ? 'active' : ''}`;
      pill.innerHTML = `📁 ${escapeHtml(folderName)} <span class="pill-count">${folderCounts[folderName]}</span>`;
      pill.addEventListener('click', () => {
        state.selectedFolder = folderName;
        state.selectedTopic = 'all';
        renderFolderExplorer();
        renderNotesLibrary();
      });
      libraryFolderChips.appendChild(pill);
    });

    // Render Topics Sub-bar if a specific folder is selected
    if (state.selectedFolder !== 'all') {
      libraryTopicSubbar.style.display = 'flex';
      libraryTopicChips.innerHTML = '';

      // All topics within this folder
      const allTopicPill = document.createElement('button');
      allTopicPill.type = 'button';
      allTopicPill.className = `topic-pill ${state.selectedTopic === 'all' ? 'active' : ''}`;
      allTopicPill.textContent = 'All Topics';
      allTopicPill.addEventListener('click', () => {
        state.selectedTopic = 'all';
        renderFolderExplorer();
        renderNotesLibrary();
      });
      libraryTopicChips.appendChild(allTopicPill);

      const fTopics = topicCounts[state.selectedFolder] || {};
      Object.keys(fTopics).forEach(topName => {
        const tPill = document.createElement('button');
        tPill.type = 'button';
        tPill.className = `topic-pill ${state.selectedTopic === topName ? 'active' : ''}`;
        tPill.innerHTML = `🏷️ ${escapeHtml(topName)} <span style="font-size: 10px; opacity: 0.7;">(${fTopics[topName]})</span>`;
        tPill.addEventListener('click', () => {
          state.selectedTopic = topName;
          renderFolderExplorer();
          renderNotesLibrary();
        });
        libraryTopicChips.appendChild(tPill);
      });
    } else {
      libraryTopicSubbar.style.display = 'none';
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ==========================================
  // PAGE 2: VIEW NOTES LIBRARY LOGIC
  // ==========================================
  const notesGrid = document.getElementById('notesGrid');
  const searchInput = document.getElementById('librarySearchInput');
  const catFilterChips = document.querySelectorAll('.cat-filter-chip');

  let searchDebounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderNotesLibrary();
    }, 200);
  });

  catFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      catFilterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.categoryFilter = chip.dataset.category;
      renderNotesLibrary();
    });
  });

  async function renderNotesLibrary() {
    const allNotes = await window.notesDB.getAllNotes();

    // 1. Filter by Folder & Topic hierarchy
    let filtered = allNotes.filter(note => {
      if (state.selectedFolder !== 'all' && (note.folder || 'General') !== state.selectedFolder) {
        return false;
      }
      if (state.selectedTopic !== 'all' && (note.topic || 'General Notes') !== state.selectedTopic) {
        return false;
      }
      return true;
    });

    // 2. Filter by Category Type
    filtered = filtered.filter(note => {
      if (state.categoryFilter === 'photo') return note.type === 'photo';
      if (state.categoryFilter === 'technical') return note.type === 'technical';
      if (state.categoryFilter === 'formula') return note.type === 'formula';
      if (state.categoryFilter === 'starred') return !!note.starred;
      return true;
    });

    // 3. Filter by Search Query
    if (state.searchQuery) {
      filtered = filtered.filter(n => {
        const titleMatch = (n.title || '').toLowerCase().includes(state.searchQuery);
        const folderMatch = (n.folder || '').toLowerCase().includes(state.searchQuery);
        const topicMatch = (n.topic || '').toLowerCase().includes(state.searchQuery);
        const tagsMatch = (n.tags || []).some(t => t.includes(state.searchQuery));
        const contentMatch = (n.content || n.notesText || n.breakdown || n.latexText || '').toLowerCase().includes(state.searchQuery);
        return titleMatch || folderMatch || topicMatch || tagsMatch || contentMatch;
      });
    }

    if (filtered.length === 0) {
      notesGrid.innerHTML = `
        <div class="empty-state-card">
          <i data-lucide="book-open" style="width: 48px; height: 48px; margin: 0 auto 12px; display: block; color: var(--primary);"></i>
          <h3 style="margin-bottom: 6px;">No notes found</h3>
          <p>No notes matching your current filter in ${state.selectedFolder === 'all' ? 'any folder' : 'folder "' + state.selectedFolder + '"'}.</p>
          <button type="button" class="btn-duo-primary" style="margin-top: 16px;" id="btnEmptyGoUpload">
            + Upload Notes Now
          </button>
        </div>
      `;
      document.getElementById('btnEmptyGoUpload')?.addEventListener('click', () => switchView('upload'));
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    notesGrid.innerHTML = '';
    filtered.forEach(note => {
      const card = document.createElement('div');
      card.className = 'note-card';

      let badgeLabel = 'Note';
      let badgeClass = 'photo';
      if (note.type === 'photo') {
        badgeLabel = `📸 Photo (${note.images?.length || 1} pg)`;
        badgeClass = 'photo';
      } else if (note.type === 'technical') {
        badgeLabel = `💻 Tech (${note.language || 'Code'})`;
        badgeClass = 'tech';
      } else if (note.type === 'formula') {
        badgeLabel = note.mode === 'screenshot' ? '📐 Formula (Image)' : '📐 Formula (LaTeX)';
        badgeClass = 'formula';
      }

      let previewHtml = '';
      if (note.type === 'photo' && note.images && note.images.length > 0) {
        previewHtml = `<div class="card-preview-area"><img src="${note.images[0]}" class="card-img-preview" alt="${escapeHtml(note.title)}"></div>`;
      } else if (note.type === 'technical') {
        const snippet = (note.content || '').substring(0, 160) + '...';
        previewHtml = `<div class="card-preview-area"><div class="card-code-preview">${escapeHtml(snippet)}</div></div>`;
      } else if (note.type === 'formula') {
        if (note.mode === 'screenshot' && note.screenshotUrl) {
          previewHtml = `<div class="card-preview-area"><img src="${note.screenshotUrl}" class="card-img-preview" alt="${escapeHtml(note.title)}"></div>`;
        } else {
          previewHtml = `<div class="card-preview-area"><div class="card-formula-preview formula-latex-card" data-latex="${escapeHtml(note.latexText || '')}"></div></div>`;
        }
      }

      const tagsHtml = (note.tags || []).map(t => `<span class="note-tag">#${escapeHtml(t)}</span>`).join('');
      const dateStr = new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

      card.innerHTML = `
        <div class="note-card-header">
          <span class="note-type-badge ${badgeClass}">${badgeLabel}</span>
          <button type="button" class="note-star-btn ${note.starred ? 'starred' : ''}" data-id="${note.id}" title="Star note">
            ★
          </button>
        </div>

        <div class="note-folder-tag">
          📁 ${escapeHtml(note.folder || 'General')} &nbsp;/&nbsp; 🏷️ ${escapeHtml(note.topic || 'General Notes')}
        </div>

        <h4 class="note-card-title">${escapeHtml(note.title)}</h4>
        <div class="note-card-meta">
          <span>📅 ${dateStr}</span>
        </div>
        ${previewHtml}
        <div class="note-tags-row">
          ${tagsHtml}
        </div>
        <div class="note-card-footer">
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn-duo-secondary btn-view-note" data-id="${note.id}">
              View
            </button>
            <button type="button" class="btn-edit-note btn-card-edit" data-id="${note.id}" title="Edit note in library">
              <i data-lucide="pencil" style="width: 14px; height: 14px;"></i>
              Edit
            </button>
          </div>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn-icon-subtle btn-delete-note" data-id="${note.id}" title="Delete Note">
              <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
        </div>
      `;

      notesGrid.appendChild(card);
    });

    document.querySelectorAll('.formula-latex-card').forEach(box => {
      const latex = box.dataset.latex;
      if (latex) window.mathRenderer.render(latex, box, false);
    });

    document.querySelectorAll('.note-star-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const updated = await window.notesDB.toggleStar(id);
        if (updated) {
          btn.classList.toggle('starred', updated.starred);
          showToast(updated.starred ? '⭐ Added to Starred!' : 'Removed from Starred');
          updateStats();
        }
      });
    });

    document.querySelectorAll('.btn-view-note').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const note = await window.notesDB.getNoteById(id);
        if (note) openModal(note);
      });
    });

    // Card Edit Buttons
    document.querySelectorAll('.btn-card-edit').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const note = await window.notesDB.getNoteById(id);
        if (note) openEditModal(note);
      });
    });

    document.querySelectorAll('.btn-delete-note').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this note?')) {
          await window.notesDB.deleteNote(id);
          showToast('🗑️ Note deleted successfully');
          renderFolderExplorer();
          renderNotesLibrary();
          updateStats();
        }
      });
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ==========================================
  // FULLSCREEN INSPECTOR MODAL
  // ==========================================
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalBadge = document.getElementById('modalBadge');
  const modalBody = document.getElementById('modalBody');
  const modalDate = document.getElementById('modalDate');
  const btnModalDownload = document.getElementById('btnModalDownload');
  const btnModalCopy = document.getElementById('btnModalCopy');
  const btnModalEdit = document.getElementById('btnModalEdit');

  function openModal(note) {
    state.activeModalNote = note;
    modalTitle.textContent = note.title;
    modalDate.textContent = `📁 ${note.folder || 'General'}  •  🏷️ ${note.topic || 'General Notes'}  •  ${new Date(note.createdAt).toLocaleDateString()}`;

    modalBadge.textContent = note.type.toUpperCase();
    modalBadge.className = `note-type-badge ${note.type === 'photo' ? 'photo' : note.type === 'technical' ? 'tech' : 'formula'}`;

    modalBody.innerHTML = '';

    if (note.type === 'photo') {
      const container = document.createElement('div');
      (note.images || []).forEach((imgSrc, i) => {
        container.innerHTML += `
          <div style="margin-bottom: 24px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">PAGE ${i + 1}</div>
            <img src="${imgSrc}" class="modal-img-viewer" alt="Notes Page ${i + 1}">
          </div>
        `;
      });
      if (note.notesText) {
        container.innerHTML += `
          <div style="background: var(--surface-muted); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-top: 12px;">
            <h4 style="margin-bottom: 6px; font-size: 14px;">Notes & Remarks:</h4>
            <p>${escapeHtml(note.notesText)}</p>
          </div>
        `;
      }
      modalBody.appendChild(container);
      btnModalCopy.style.display = 'none';

    } else if (note.type === 'technical') {
      const container = document.createElement('div');
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Language: ${escapeHtml(note.language || 'Markdown')}</span>
        </div>
        <div class="modal-code-viewer">${escapeHtml(note.content || '')}</div>
      `;
      if (note.summary) {
        container.innerHTML += `
          <div style="margin-top: 18px; padding: 14px; background: var(--surface-muted); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
            <strong style="font-size: 13px; color: var(--text-primary); display: block; margin-bottom: 4px;">Key Takeaways:</strong>
            <p style="font-size: 14px;">${escapeHtml(note.summary)}</p>
          </div>
        `;
      }
      modalBody.appendChild(container);
      btnModalCopy.style.display = 'inline-flex';
      btnModalCopy.textContent = 'Copy Code / Text';

    } else if (note.type === 'formula') {
      const container = document.createElement('div');
      if (note.mode === 'screenshot' && note.screenshotUrl) {
        container.innerHTML = `
          <div style="text-align: center; margin-bottom: 16px;">
            <img src="${note.screenshotUrl}" class="modal-img-viewer" style="max-height: 380px;" alt="Formula Screenshot">
          </div>
        `;
      } else if (note.latexText) {
        container.innerHTML = `
          <div class="modal-math-viewer" id="modalMathEquationBox"></div>
          <div style="background: var(--surface-muted); padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary);">
            <strong>LaTeX:</strong> ${escapeHtml(note.latexText)}
          </div>
        `;
      }

      if (note.breakdown) {
        container.innerHTML += `
          <div style="padding: 16px; background: var(--surface-muted); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <h4 style="margin-bottom: 6px; font-size: 14px;">Variable Legend & Conceptual Breakdown:</h4>
            <p style="font-size: 14px;">${escapeHtml(note.breakdown)}</p>
          </div>
        `;
      }

      modalBody.appendChild(container);

      if (note.mode === 'latex' && note.latexText) {
        const box = document.getElementById('modalMathEquationBox');
        window.mathRenderer.render(note.latexText, box, true);
        btnModalCopy.style.display = 'inline-flex';
        btnModalCopy.textContent = 'Copy LaTeX Code';
      } else {
        btnModalCopy.style.display = 'none';
      }
    }

    modalOverlay.classList.add('active');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    state.activeModalNote = null;
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Modal Action: Edit Note directly from inspector
  btnModalEdit.addEventListener('click', () => {
    if (state.activeModalNote) {
      const noteToEdit = state.activeModalNote;
      closeModal();
      openEditModal(noteToEdit);
    }
  });

  btnModalCopy.addEventListener('click', () => {
    if (!state.activeModalNote) return;
    const note = state.activeModalNote;
    const textToCopy = note.type === 'technical' ? note.content : (note.latexText || '');
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      showToast('📋 Copied to clipboard!');
    }
  });

  btnModalDownload.addEventListener('click', () => {
    if (!state.activeModalNote) return;
    const note = state.activeModalNote;
    const blob = new Blob([JSON.stringify(note, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_note.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('💾 Note exported as JSON!');
  });

  // ==========================================
  // EDIT NOTE MODAL IMPLEMENTATION
  // ==========================================
  const editModalOverlay = document.getElementById('editModalOverlay');
  const editModalCloseBtn = document.getElementById('editModalCloseBtn');
  const btnEditCancel = document.getElementById('btnEditCancel');
  const formEditNote = document.getElementById('formEditNote');
  const editNoteId = document.getElementById('editNoteId');
  const editNoteType = document.getElementById('editNoteType');
  const editNoteTitle = document.getElementById('editNoteTitle');
  const editNoteFolder = document.getElementById('editNoteFolder');
  const editNoteTopic = document.getElementById('editNoteTopic');
  const editNoteTags = document.getElementById('editNoteTags');
  const editDynamicFields = document.getElementById('editDynamicFields');

  function openEditModal(note) {
    state.editingNote = note;
    editNoteId.value = note.id;
    editNoteType.value = note.type;
    editNoteTitle.value = note.title;
    editNoteTags.value = (note.tags || []).join(', ');

    // Populate Folder and Topic dropdowns in edit modal
    populateFolderDropdowns(note.folder || 'General');
    editNoteFolder.value = note.folder || 'General';
    populateTopicDropdown(note.folder || 'General', editNoteTopic, note.topic || 'General Notes');

    // Dynamically inject type-specific fields
    editDynamicFields.innerHTML = '';

    if (note.type === 'photo') {
      editDynamicFields.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="editPhotoRemarks">Lecture Remarks / Key Notes</label>
          <textarea id="editPhotoRemarks" class="form-textarea">${escapeHtml(note.notesText || '')}</textarea>
        </div>
        <div style="font-size: 13px; color: var(--text-muted);">
          📸 Note contains ${note.images ? note.images.length : 0} uploaded image page(s).
        </div>
      `;
    } else if (note.type === 'technical') {
      editDynamicFields.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="editTechContent">Technical Content (Markdown & Code) *</label>
          <textarea id="editTechContent" class="form-textarea code-font" style="min-height: 200px;" required>${escapeHtml(note.content || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="editTechSummary">Key Takeaways / Abstract</label>
          <textarea id="editTechSummary" class="form-textarea" style="min-height: 80px;">${escapeHtml(note.summary || '')}</textarea>
        </div>
      `;
    } else if (note.type === 'formula') {
      if (note.mode === 'latex' || note.latexText) {
        editDynamicFields.innerHTML = `
          <div class="form-group">
            <label class="form-label" for="editFormulaLatex">LaTeX Equation Code *</label>
            <textarea id="editFormulaLatex" class="form-textarea code-font" required>${escapeHtml(note.latexText || '')}</textarea>
            <div style="margin-top: 10px;">
              <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Equation Live Preview:</span>
              <div class="math-rendered-preview-box" id="editMathLivePreview"></div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="editFormulaBreakdown">Variable Legend & Conceptual Breakdown</label>
            <textarea id="editFormulaBreakdown" class="form-textarea">${escapeHtml(note.breakdown || '')}</textarea>
          </div>
        `;
        // Setup live preview
        const editMathInput = document.getElementById('editFormulaLatex');
        const editMathBox = document.getElementById('editMathLivePreview');
        window.mathRenderer.render(editMathInput.value, editMathBox, true);
        editMathInput.addEventListener('input', () => {
          window.mathRenderer.render(editMathInput.value, editMathBox, true);
        });
      } else {
        editDynamicFields.innerHTML = `
          <div class="form-group">
            <label class="form-label" for="editFormulaBreakdown">Variable Legend & Conceptual Breakdown</label>
            <textarea id="editFormulaBreakdown" class="form-textarea">${escapeHtml(note.breakdown || '')}</textarea>
          </div>
        `;
      }
    }

    editModalOverlay.classList.add('active');
    editNoteTitle.focus();
  }

  function closeEditModal() {
    editModalOverlay.classList.remove('active');
    state.editingNote = null;
  }

  editModalCloseBtn.addEventListener('click', closeEditModal);
  btnEditCancel.addEventListener('click', closeEditModal);
  editModalOverlay.addEventListener('click', (e) => {
    if (e.target === editModalOverlay) closeEditModal();
  });

  formEditNote.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.editingNote) return;

    const note = state.editingNote;
    note.title = editNoteTitle.value.trim();
    note.folder = editNoteFolder.value.trim() || 'General';
    note.topic = editNoteTopic.value.trim() || 'General Notes';
    note.tags = editNoteTags.value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    // Save type-specific edits
    if (note.type === 'photo') {
      const remarksEl = document.getElementById('editPhotoRemarks');
      if (remarksEl) note.notesText = remarksEl.value.trim();
    } else if (note.type === 'technical') {
      const contentEl = document.getElementById('editTechContent');
      const summaryEl = document.getElementById('editTechSummary');
      if (contentEl) note.content = contentEl.value.trim();
      if (summaryEl) note.summary = summaryEl.value.trim();
    } else if (note.type === 'formula') {
      const latexEl = document.getElementById('editFormulaLatex');
      const breakdownEl = document.getElementById('editFormulaBreakdown');
      if (latexEl) note.latexText = latexEl.value.trim();
      if (breakdownEl) note.breakdown = breakdownEl.value.trim();
    }

    note.updatedAt = new Date().toISOString();

    await window.notesDB.saveNote(note);
    showToast(`✏️ Note "${note.title}" updated successfully!`);

    closeEditModal();
    renderFolderExplorer();
    renderNotesLibrary();
    updateStats();
  });

  // ==========================================
  // STATS & COUNTERS
  // ==========================================
  async function updateStats() {
    const counts = await window.notesDB.countNotes();
    if (statTotal) statTotal.textContent = counts.total;
    if (statPhotos) statPhotos.textContent = counts.photos;
    if (statTech) statTech.textContent = counts.technical;
    if (statFormula) statFormula.textContent = counts.formula;
  }

  // ==========================================
  // TOAST NOTIFICATIONS (DUOLINGO CELEBRATORY STYLE)
  // ==========================================
  let toastTimer;
  function showToast(message, type = 'success') {
    clearTimeout(toastTimer);
    toastMessage.textContent = message;
    toastEl.style.borderLeftColor = type === 'warning' ? 'var(--warning)' : 'var(--primary)';
    toastEl.classList.add('show');

    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial render
  updateStats();
  renderFolderExplorer();
  renderNotesLibrary();
});
