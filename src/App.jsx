import React, { useState, useEffect, useCallback, useRef } from 'react';
import useDocumentStore, { ACTIONS } from './hooks/useDocumentStore';
import { getMockDocuments } from './hooks/useMockData';
import Titlebar from './components/Titlebar';
import Sidebar from './components/Sidebar';
import DropZone from './components/DropZone';
import PageGrid from './components/PageGrid';
import Toolbar from './components/Toolbar';
import MergeModal from './components/MergeModal';
import ExportModal from './components/ExportModal';
import Toast from './components/Toast';

export default function App() {
  const {
    documents,
    activeDocumentId,
    canUndo,
    canRedo,
    undo,
    redo,
    dispatch,
  } = useDocumentStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowDragOver, setWindowDragOver] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [exportModalConfig, setExportModalConfig] = useState(null); // { isSelection: boolean } | null
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info', undoable = false) => {
    setToast({ message, type, undoable });
  }, []);

  // Auto dismiss toast after 4s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Initialize with rich mock data (guarded against StrictMode double-mount)
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    dispatch({ type: ACTIONS.ADD_DOCUMENT, payload: getMockDocuments() });
  }, [dispatch]);

  // Wire up Electron file open listener
  useEffect(() => {
    if (window.electronAPI?.onFileOpened) {
      const unsubscribe = window.electronAPI.onFileOpened((event, files) => {
        if (files && files.length > 0) {
          handleFilesImport(files);
        }
      });
      return () => unsubscribe && unsubscribe();
    }
  }, []);

  const activeDocument = documents.find((doc) => doc.id === activeDocumentId);
  const activePages = activeDocument ? activeDocument.pages : [];
  const selectedPages = activePages.filter((p) => p.selected);

  // ── Global Keyboard Shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Select All (⌘A / Ctrl+A)
      if (cmdKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        dispatch({ type: ACTIONS.SELECT_ALL });
      }

      // Escape -> Deselect All or close modals
      if (e.key === 'Escape') {
        if (showMergeModal) setShowMergeModal(false);
        else if (exportModalConfig) setExportModalConfig(null);
        else dispatch({ type: ACTIONS.DESELECT_ALL });
      }

      // Delete / Backspace -> Delete Selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Check selection from current activePages to avoid stale closure
        const currentDoc = documents.find((d) => d.id === activeDocumentId);
        const currentSelected = currentDoc ? currentDoc.pages.filter((p) => p.selected) : [];
        if (currentSelected.length > 0) {
          e.preventDefault();
          const count = currentSelected.length;
          dispatch({ type: ACTIONS.DELETE_SELECTED_PAGES });
          showToast(`Deleted ${count} ${count === 1 ? 'page' : 'pages'}`, 'info', true);
        }
      }

      // Rotate Selected (⌘R / Ctrl+R)
      if (cmdKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        const currentDoc = documents.find((d) => d.id === activeDocumentId);
        const currentSelected = currentDoc ? currentDoc.pages.filter((p) => p.selected) : [];
        if (activeDocumentId && currentSelected.length > 0) {
          dispatch({
            type: ACTIONS.ROTATE_PAGES,
            payload: {
              documentId: activeDocumentId,
              pageIds: currentSelected.map((p) => p.id),
              angle: 90,
            },
          });
          showToast(`Rotated ${currentSelected.length} ${currentSelected.length === 1 ? 'page' : 'pages'} 90°`, 'info', true);
        }
      }

      // Duplicate Selected (⌘D / Ctrl+D)
      if (cmdKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const currentDoc = documents.find((d) => d.id === activeDocumentId);
        const currentSelected = currentDoc ? currentDoc.pages.filter((p) => p.selected) : [];
        if (activeDocumentId && currentSelected.length === 1) {
          dispatch({
            type: ACTIONS.DUPLICATE_PAGE,
            payload: { documentId: activeDocumentId, pageId: currentSelected[0].id },
          });
          showToast('Duplicated page', 'success', true);
        }
      }

      // Undo (⌘Z / Ctrl+Z)
      if (cmdKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (canUndo) {
          undo();
          showToast('Undone action', 'info');
        }
      }

      // Redo (⌘⇧Z / Ctrl+Y / Ctrl+Shift+Z)
      if ((cmdKey && e.shiftKey && e.key.toLowerCase() === 'z') || (cmdKey && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        if (canRedo) {
          redo();
          showToast('Redone action', 'info');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [documents, activeDocumentId, canUndo, canRedo, undo, redo, showMergeModal, exportModalConfig, dispatch, showToast]);

  // ── Drag & Drop Over Window ──
  const handleWindowDragOver = (e) => {
    e.preventDefault();
    if (!windowDragOver) setWindowDragOver(true);
  };

  const handleWindowDragLeave = (e) => {
    e.preventDefault();
    if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
      setWindowDragOver(false);
    }
  };

  const handleWindowDrop = (e) => {
    e.preventDefault();
    setWindowDragOver(false);
    if (e.dataTransfer.files?.length > 0) {
      handleFilesImport(e.dataTransfer.files);
    }
  };

  const handleFilesImport = (files) => {
    if (files === 'browse' && window.electronAPI?.openFileDialog) {
      window.electronAPI.openFileDialog();
    } else {
      const templateNames = ['Tax_Filing_2025.pdf', 'Product_Roadmap_Q3.pdf', 'Invoice_INV-8921.pdf', 'NDA_Mutual_Agreement.pdf'];
      const randomName = templateNames[documents.length % templateNames.length];
      const fileName = (typeof files === 'object' && files[0]?.name) ? files[0].name : randomName;

      const newDoc = {
        id: crypto.randomUUID(),
        name: fileName,
        filePath: `/mock/${fileName}`,
        pageCount: 6,
        fileSize: '2.4 MB',
        updatedAt: 'Just now',
        color: 'violet',
        pages: Array.from({ length: 6 }, (_, i) => ({
          id: crypto.randomUUID(),
          pageNumber: i + 1,
          width: 612,
          height: 792,
          selected: false,
          rotation: 0,
          templateType: i === 0 ? 'cover' : (i % 2 === 0 ? 'financial_table' : 'text_columns'),
          title: `Page ${i + 1}`,
        })),
        metadata: { title: fileName },
      };

      dispatch({ type: ACTIONS.ADD_DOCUMENT, payload: newDoc });
      dispatch({ type: ACTIONS.SET_ACTIVE_DOCUMENT, payload: newDoc.id });
      showToast(`Imported ${fileName}`, 'success', true);
    }
  };

  // ── Page Actions ──
  const handleToggleSelection = (pageId) => {
    dispatch({
      type: ACTIONS.TOGGLE_PAGE_SELECTION,
      payload: { documentId: activeDocumentId, pageId },
    });
  };

  const handleDeletePage = (pageId) => {
    dispatch({
      type: ACTIONS.DELETE_PAGE,
      payload: { documentId: activeDocumentId, pageId },
    });
    showToast('Page deleted', 'info', true);
  };

  const handleReorder = (oldIndex, newIndex) => {
    dispatch({
      type: ACTIONS.REORDER_PAGES,
      payload: { documentId: activeDocumentId, oldIndex, newIndex },
    });
    showToast('Reordered pages', 'info', true);
  };

  const handleRotatePage = (pageId) => {
    dispatch({
      type: ACTIONS.ROTATE_PAGES,
      payload: { documentId: activeDocumentId, pageIds: [pageId], angle: 90 },
    });
    showToast('Rotated page 90°', 'info', true);
  };

  const handleRotateSelected = () => {
    if (selectedPages.length === 0) return;
    dispatch({
      type: ACTIONS.ROTATE_PAGES,
      payload: {
        documentId: activeDocumentId,
        pageIds: selectedPages.map((p) => p.id),
        angle: 90,
      },
    });
    showToast(`Rotated ${selectedPages.length} ${selectedPages.length === 1 ? 'page' : 'pages'} 90°`, 'info', true);
  };

  const handleDuplicatePage = (pageId) => {
    dispatch({
      type: ACTIONS.DUPLICATE_PAGE,
      payload: { documentId: activeDocumentId, pageId },
    });
    showToast('Page duplicated', 'success', true);
  };

  const handleInsertBlankPage = () => {
    if (!activeDocumentId) return;
    dispatch({
      type: ACTIONS.INSERT_BLANK_PAGE,
      payload: { documentId: activeDocumentId },
    });
    showToast('Inserted blank page', 'success', true);
  };

  const handleMergeSubmit = (docIds, outputTitle) => {
    dispatch({
      type: ACTIONS.MERGE_DOCUMENTS,
      payload: { docIds, newTitle: outputTitle },
    });
    showToast(`Successfully merged into ${outputTitle}`, 'success', true);
  };

  const handleExportSubmit = (filename, quality) => {
    showToast(`Exported ${filename} (${quality})`, 'success');
  };

  return (
    <div
      className="flex flex-col h-screen w-screen bg-[#08090d] text-zinc-100 overflow-hidden select-none font-sans"
      onDragOver={handleWindowDragOver}
      onDragLeave={handleWindowDragLeave}
      onDrop={handleWindowDrop}
    >
      {/* ── Toast Notification ── */}
      <Toast
        toast={toast}
        onDismiss={() => setToast(null)}
        onUndo={() => {
          if (canUndo) undo();
        }}
      />

      {/* ── Titlebar with BIND Wordmark, Undo/Redo & Native Controls ── */}
      <Titlebar
        activeDocument={activeDocument}
        onAddDocument={() => handleFilesImport('browse')}
        onMerge={() => setShowMergeModal(true)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* ── Main Workspace Body (Sidebar + Canvas) ── */}
      <div className="flex flex-1 overflow-hidden relative min-h-0 min-w-0">
        <Sidebar
          documents={documents}
          activeDocumentId={activeDocumentId}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onSelectDocument={(id) => dispatch({ type: ACTIONS.SET_ACTIVE_DOCUMENT, payload: id })}
          onRemoveDocument={(id) => {
            dispatch({ type: ACTIONS.REMOVE_DOCUMENT, payload: id });
            showToast('Document removed', 'info', true);
          }}
          onAddDocument={() => handleFilesImport('browse')}
          onMerge={() => setShowMergeModal(true)}
        />

        {/* ── Main Canvas Viewport ── */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 relative bg-[#08090d]">
          {/* Fullscreen Drag Overlay */}
          {windowDragOver && (
            <div className="absolute inset-0 z-50 bg-[#08090d]/90 flex items-center justify-center backdrop-blur-md pointer-events-none">
              <DropZone
                onFileDrop={handleFilesImport}
                dragOver={true}
                onDragStateChange={setWindowDragOver}
              />
            </div>
          )}

          {!activeDocument ? (
            <DropZone
              onFileDrop={handleFilesImport}
              dragOver={false}
              onDragStateChange={setWindowDragOver}
            />
          ) : (
            <>
              <PageGrid
                document={activeDocument}
                pages={activePages}
                documentColor={activeDocument.color}
                onToggleSelection={handleToggleSelection}
                onDeletePage={handleDeletePage}
                onSelectAll={() => dispatch({ type: ACTIONS.SELECT_ALL })}
                onDeselectAll={() => dispatch({ type: ACTIONS.DESELECT_ALL })}
                onInvertSelection={() => dispatch({ type: ACTIONS.INVERT_SELECTION })}
                onReorder={handleReorder}
                onRotatePage={handleRotatePage}
                onDuplicatePage={handleDuplicatePage}
                onInsertBlankPage={handleInsertBlankPage}
                onAddPages={() => handleFilesImport('browse')}
              />

              {/* Floating Action Dock (Only rendered when document exists) */}
              {activePages.length > 0 && (
                <Toolbar
                  selectedCount={selectedPages.length}
                  totalCount={activePages.length}
                  onDeleteSelected={() => {
                    const count = selectedPages.length;
                    dispatch({ type: ACTIONS.DELETE_SELECTED_PAGES });
                    showToast(`Deleted ${count} ${count === 1 ? 'page' : 'pages'}`, 'info', true);
                  }}
                  onRotateSelected={handleRotateSelected}
                  onDuplicateSelected={() => {
                    if (selectedPages.length === 1) {
                      handleDuplicatePage(selectedPages[0].id);
                    }
                  }}
                  onDeselectAll={() => dispatch({ type: ACTIONS.DESELECT_ALL })}
                  onMerge={() => setShowMergeModal(true)}
                  onExport={() => setExportModalConfig({ isSelection: selectedPages.length > 0 })}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Merge Documents Dialog Modal ── */}
      {showMergeModal && (
        <MergeModal
          documents={documents}
          onClose={() => setShowMergeModal(false)}
          onMerge={handleMergeSubmit}
        />
      )}

      {/* ── Export Document Dialog Modal ── */}
      {exportModalConfig && (
        <ExportModal
          document={activeDocument}
          selectedCount={selectedPages.length}
          isSelectionExport={exportModalConfig.isSelection}
          onClose={() => setExportModalConfig(null)}
          onExport={handleExportSubmit}
        />
      )}
    </div>
  );
}
