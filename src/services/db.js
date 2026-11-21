/**
 * IndexedDB persistence layer for React Notes Hub
 * Handles photos (base64/blobs), technical markdown text, and formulae,
 * with hierarchical Folders & Topics categorization and full Move/Transfer operations.
 */
const DB_NAME = 'NotesHubDB';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

class NotesStorage {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('folder', 'folder', { unique: false });
          store.createIndex('topic', 'topic', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('starred', 'starred', { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.error('IndexedDB error:', e);
        reject(e);
      };
    });
  }

  /**
   * Two-way sync with server backend for multi-device port sharing (PC & Mobile)
   */
  async syncWithServer() {
    try {
      // 1. Sync Folders from Server
      const foldersRes = await fetch('/api/folders');
      if (foldersRes.ok) {
        const serverFolders = await foldersRes.json();
        if (Array.isArray(serverFolders) && serverFolders.length > 0) {
          localStorage.setItem('notes_hub_folders', JSON.stringify(serverFolders));
        } else {
          // Push local registered folders to server
          const localFolders = this.getRegisteredFolders();
          await fetch('/api/folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localFolders)
          });
        }
      }

      // 2. Sync Notes from Server
      const notesRes = await fetch('/api/notes');
      if (notesRes.ok) {
        const serverNotes = await notesRes.json();
        if (Array.isArray(serverNotes) && serverNotes.length > 0) {
          // Update local IndexedDB with server notes
          for (const note of serverNotes) {
            await this.putLocalNote(note);
          }
        } else {
          // Server is empty: push local notes to server
          const localNotes = await this.getLocalNotes();
          if (localNotes.length > 0) {
            await fetch('/api/notes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(localNotes)
            });
          }
        }
      }
    } catch (e) {
      console.warn('Backend sync unavailable, using client storage:', e);
    }
  }

  putLocalNote(note) {
    if (!this.db) return Promise.resolve(note);
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(note);
      request.onsuccess = () => resolve(note);
      request.onerror = (e) => reject(e);
    });
  }

  getLocalNotes() {
    if (!this.db) return Promise.resolve([]);
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (e) => reject(e);
    });
  }

  async saveNote(note) {
    if (!this.db) await this.init();
    
    if (!note.folder) note.folder = note.subject || 'General';
    if (note.topic === undefined || note.topic === null) note.topic = '';
    
    if (note.topic) {
      this.registerFolder(note.folder, note.topic);
    } else {
      this.registerFolder(note.folder);
    }

    // Save to local IndexedDB
    const saved = await this.putLocalNote(note);

    // Sync to Server backend asynchronously so mobile devices immediately get it
    fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    }).catch(() => {});

    // Sync folders to Server backend
    fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.getRegisteredFolders())
    }).catch(() => {});

    return saved;
  }

  async getAllNotes() {
    if (!this.db) await this.init();

    // Try fetching from server first for real-time multi-device sync
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const serverNotes = await res.json();
        if (Array.isArray(serverNotes) && serverNotes.length > 0) {
          for (const note of serverNotes) {
            await this.putLocalNote(note);
          }
          serverNotes.forEach(n => {
            if (!n.folder) n.folder = n.subject || 'General';
            if (n.topic === undefined || n.topic === null) n.topic = '';
          });
          serverNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          return serverNotes;
        }
      }
    } catch (e) {
      // Offline fallback to IndexedDB
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const notes = request.result || [];
        notes.forEach(n => {
          if (!n.folder) n.folder = n.subject || 'General';
          if (n.topic === undefined || n.topic === null) n.topic = '';
        });
        notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(notes);
      };
      request.onerror = (e) => reject(e);
    });
  }

  async getNoteById(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const note = request.result;
        if (note) {
          if (!note.folder) note.folder = note.subject || 'General';
          if (note.topic === undefined || note.topic === null) note.topic = '';
        }
        resolve(note);
      };
      request.onerror = (e) => reject(e);
    });
  }

  async deleteNote(id) {
    if (!this.db) await this.init();
    fetch('/api/notes/' + id, { method: 'DELETE' }).catch(() => {});
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e);
    });
  }

  async toggleStar(id) {
    const note = await this.getNoteById(id);
    if (!note) return null;
    note.starred = !note.starred;
    await this.saveNote(note);
    return note;
  }

  async countNotes() {
    const all = await this.getAllNotes();
    return {
      total: all.length,
      photos: all.filter(n => n.type === 'photo').length,
      technical: all.filter(n => n.type === 'technical').length,
      formula: all.filter(n => n.type === 'formula').length,
      starred: all.filter(n => n.starred).length
    };
  }

  // ==========================================
  // MOVE OPERATIONS (FILES & FOLDERS)
  // ==========================================

  /**
   * Move an individual note file to a different folder & topic
   */
  async moveNote(noteId, targetFolder, targetTopic) {
    const note = await this.getNoteById(noteId);
    if (!note) return null;
    note.folder = targetFolder.trim();
    note.topic = targetTopic ? targetTopic.trim() : '';
    note.updatedAt = new Date().toISOString();
    return await this.saveNote(note);
  }

  /**
   * Move / Merge an entire folder into another folder
   * All notes in sourceFolder are moved to targetFolder (topics preserved).
   * Topics from sourceFolder are merged into targetFolder in the folder registry.
   */
  async moveFolder(sourceFolder, targetFolder) {
    if (!sourceFolder || !targetFolder || sourceFolder === targetFolder) return false;

    const allNotes = await this.getAllNotes();
    const notesToMove = allNotes.filter(n => (n.folder || '').toLowerCase() === sourceFolder.toLowerCase());

    for (const note of notesToMove) {
      note.folder = targetFolder;
      note.updatedAt = new Date().toISOString();
      await this.saveNote(note);
    }

    // Merge topics in registered folders
    const folders = this.getRegisteredFolders();
    const sourceObj = folders.find(f => f.folder.toLowerCase() === sourceFolder.toLowerCase());
    let targetObj = folders.find(f => f.folder.toLowerCase() === targetFolder.toLowerCase());

    if (!targetObj) {
      targetObj = { folder: targetFolder, topics: [] };
      folders.push(targetObj);
    }

    if (sourceObj && sourceObj.topics) {
      sourceObj.topics.forEach(t => {
        if (!targetObj.topics.some(existing => existing.toLowerCase() === t.toLowerCase())) {
          targetObj.topics.push(t);
        }
      });
    }

    // Remove sourceFolder from registry
    const updatedFolders = folders.filter(f => f.folder.toLowerCase() !== sourceFolder.toLowerCase());
    this.saveRegisteredFolders(updatedFolders);

    return true;
  }

  /**
   * Move a specific topic (and all its notes) from one folder to another
   */
  async moveTopic(sourceFolder, topicName, targetFolder, newTopicName = null) {
    if (!sourceFolder || !topicName || !targetFolder) return false;
    const finalTopicName = (newTopicName || topicName).trim();

    const allNotes = await this.getAllNotes();
    const notesToMove = allNotes.filter(
      n => (n.folder || '').toLowerCase() === sourceFolder.toLowerCase() &&
           (n.topic || '').toLowerCase() === topicName.toLowerCase()
    );

    for (const note of notesToMove) {
      note.folder = targetFolder;
      note.topic = finalTopicName;
      note.updatedAt = new Date().toISOString();
      await this.saveNote(note);
    }

    // Update folder registry
    const folders = this.getRegisteredFolders();
    const sourceObj = folders.find(f => f.folder.toLowerCase() === sourceFolder.toLowerCase());
    let targetObj = folders.find(f => f.folder.toLowerCase() === targetFolder.toLowerCase());

    if (!targetObj) {
      targetObj = { folder: targetFolder, topics: [] };
      folders.push(targetObj);
    }

    if (!targetObj.topics.some(t => t.toLowerCase() === finalTopicName.toLowerCase())) {
      targetObj.topics.push(finalTopicName);
    }

    if (sourceObj) {
      sourceObj.topics = sourceObj.topics.filter(t => t.toLowerCase() !== topicName.toLowerCase());
      if (sourceObj.topics.length === 0) {
        sourceObj.topics.push('General Notes');
      }
    }

    this.saveRegisteredFolders(folders);
    return true;
  }

  // ==========================================
  // FOLDERS & TOPICS REGISTRY
  // ==========================================
  getRegisteredFolders() {
    const defaultData = [
      {
        folder: 'Percentages',
        topics: ['Profit & Loss', 'Basic Fractions to %', 'Successive Percentage', 'Discounts & Markup']
      },
      {
        folder: 'Calculus',
        topics: ['Vector Calculus', 'Limits & Derivatives', 'Integration Techniques', 'Stokes Theorem']
      },
      {
        folder: 'Computer Science',
        topics: ['Distributed Systems', 'Caching & Redis', 'Algorithms & Data Structures']
      },
      {
        folder: 'Quantum Physics',
        topics: ['Wave Mechanics', 'Schrödinger Equation', 'Particle in a Box']
      }
    ];

    try {
      const stored = localStorage.getItem('notes_hub_folders');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}

    return defaultData;
  }

  saveRegisteredFolders(folders) {
    try {
      localStorage.setItem('notes_hub_folders', JSON.stringify(folders));
    } catch (e) {}

    // Sync to backend so any connected mobile device immediately sees new folders
    fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(folders)
    }).catch(() => {});
  }

  registerFolder(folderName, topicName) {
    if (!folderName) return;
    const folders = this.getRegisteredFolders();
    let folderObj = folders.find(f => f.folder.toLowerCase() === folderName.toLowerCase());
    
    if (!folderObj) {
      folderObj = { folder: folderName, topics: [] };
      folders.push(folderObj);
    }
    
    if (topicName && !folderObj.topics.some(t => t.toLowerCase() === topicName.toLowerCase())) {
      folderObj.topics.push(topicName);
    }

    this.saveRegisteredFolders(folders);
  }
}

export const db = new NotesStorage();
