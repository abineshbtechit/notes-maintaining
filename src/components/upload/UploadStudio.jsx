import React, { useState } from 'react';
import { Camera, FileCode, Sigma } from 'lucide-react';
import PhotoUploadForm from './PhotoUploadForm.jsx';
import TechnicalUploadForm from './TechnicalUploadForm.jsx';
import FormulaUploadForm from './FormulaUploadForm.jsx';

export default function UploadStudio({
  folders,
  onOpenNewFolderModal,
  onViewLibrary,
  onNoteSaved,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('photo'); // 'photo' | 'technical' | 'formula'

  return (
    <section className="page-view">
      {/* Hero Banner */}
      <div className="hero-banner">
        <h2 className="hero-title">
          Upload & Catalog Knowledge
        </h2>
        <p className="hero-subtitle">
          Capture handwritten lecture notes, technical markdown documentation, and complex mathematical formulae inside structured folders and topics.
        </p>
      </div>

      {/* Apple Obsidian Vault Card */}
      <div className="dark-vault-section">
        <div>
          <h3>Hierarchical Knowledge Vault</h3>
          <p>Organize topics cleanly inside folders (e.g. <strong>Percentages → Profit & Loss</strong>) with zero storage limits.</p>
        </div>
        <button type="button" className="btn-duo-primary" onClick={onViewLibrary}>
          Browse Library →
        </button>
      </div>

      {/* 3 Upload Section Tabs */}
      <div className="upload-tabs-container">
        <div
          className={`upload-tab-card ${activeTab === 'photo' ? 'active' : ''}`}
          onClick={() => setActiveTab('photo')}
        >
          <div className="tab-icon-box">
            <Camera style={{ width: 24, height: 24 }} />
          </div>
          <div className="tab-meta">
            <h4>1. Handwritten Notes</h4>
            <span>Photo upload of taken notes</span>
          </div>
        </div>

        <div
          className={`upload-tab-card ${activeTab === 'technical' ? 'active' : ''}`}
          onClick={() => setActiveTab('technical')}
        >
          <div className="tab-icon-box">
            <FileCode style={{ width: 24, height: 24 }} />
          </div>
          <div className="tab-meta">
            <h4>2. Technical Content</h4>
            <span>Code, markdown & architecture</span>
          </div>
        </div>

        <div
          className={`upload-tab-card ${activeTab === 'formula' ? 'active' : ''}`}
          onClick={() => setActiveTab('formula')}
        >
          <div className="tab-icon-box">
            <Sigma style={{ width: 24, height: 24 }} />
          </div>
          <div className="tab-meta">
            <h4>3. Formulae & Cheatsheet</h4>
            <span>LaTeX math or screenshot</span>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="studio-form-card">
        {activeTab === 'photo' && (
          <PhotoUploadForm
            folders={folders}
            onOpenNewFolderModal={onOpenNewFolderModal}
            onNoteSaved={onNoteSaved}
            showToast={showToast}
          />
        )}
        {activeTab === 'technical' && (
          <TechnicalUploadForm
            folders={folders}
            onOpenNewFolderModal={onOpenNewFolderModal}
            onNoteSaved={onNoteSaved}
            showToast={showToast}
          />
        )}
        {activeTab === 'formula' && (
          <FormulaUploadForm
            folders={folders}
            onOpenNewFolderModal={onOpenNewFolderModal}
            onNoteSaved={onNoteSaved}
            showToast={showToast}
          />
        )}
      </div>
    </section>
  );
}
