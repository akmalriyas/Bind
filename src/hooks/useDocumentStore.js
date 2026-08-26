import { useReducer, useCallback } from 'react';

const MAX_HISTORY = 30;

const initialState = {
  documents: [],
  activeDocumentId: null,
  past: [], // History for Undo
  future: [], // History for Redo
};

export const ACTIONS = {
  SET_ACTIVE_DOCUMENT: 'SET_ACTIVE_DOCUMENT',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  REMOVE_DOCUMENT: 'REMOVE_DOCUMENT',
  RENAME_DOCUMENT: 'RENAME_DOCUMENT',
  TOGGLE_PAGE_SELECTION: 'TOGGLE_PAGE_SELECTION',
  SELECT_ALL: 'SELECT_ALL',
  DESELECT_ALL: 'DESELECT_ALL',
  INVERT_SELECTION: 'INVERT_SELECTION',
  DELETE_SELECTED_PAGES: 'DELETE_SELECTED_PAGES',
  DELETE_PAGE: 'DELETE_PAGE',
  REORDER_PAGES: 'REORDER_PAGES',
  ROTATE_PAGES: 'ROTATE_PAGES',
  DUPLICATE_PAGE: 'DUPLICATE_PAGE',
  INSERT_BLANK_PAGE: 'INSERT_BLANK_PAGE',
  MERGE_DOCUMENTS: 'MERGE_DOCUMENTS',
  UNDO: 'UNDO',
  REDO: 'REDO',
};

function reindexPages(pages) {
  return pages.map((page, index) => ({
    ...page,
    pageNumber: index + 1,
  }));
}

// Push current state to past history before mutative operations
function recordHistory(state) {
  const snapshot = {
    documents: state.documents,
    activeDocumentId: state.activeDocumentId,
  };
  return {
    past: [snapshot, ...state.past].slice(0, MAX_HISTORY),
    future: [], // Clear redo stack on new action
  };
}

function documentReducer(state, action) {
  switch (action.type) {
    case ACTIONS.UNDO: {
      if (state.past.length === 0) return state;
      const [previous, ...newPast] = state.past;
      const current = {
        documents: state.documents,
        activeDocumentId: state.activeDocumentId,
      };
      return {
        ...state,
        documents: previous.documents,
        activeDocumentId: previous.activeDocumentId,
        past: newPast,
        future: [current, ...state.future].slice(0, MAX_HISTORY),
      };
    }

    case ACTIONS.REDO: {
      if (state.future.length === 0) return state;
      const [next, ...newFuture] = state.future;
      const current = {
        documents: state.documents,
        activeDocumentId: state.activeDocumentId,
      };
      return {
        ...state,
        documents: next.documents,
        activeDocumentId: next.activeDocumentId,
        past: [current, ...state.past].slice(0, MAX_HISTORY),
        future: newFuture,
      };
    }

    case ACTIONS.SET_ACTIVE_DOCUMENT:
      return { ...state, activeDocumentId: action.payload };

    case ACTIONS.ADD_DOCUMENT: {
      const incoming = Array.isArray(action.payload) ? action.payload : [action.payload];
      // Deduplicate: skip any doc whose ID already exists in the store
      const existingIds = new Set(state.documents.map((d) => d.id));
      const docs = incoming.filter((d) => !existingIds.has(d.id));
      if (docs.length === 0) return state; // Nothing new to add
      const newDocs = [...state.documents, ...docs];
      const history = state.documents.length > 0 ? recordHistory(state) : {};
      return {
        ...state,
        ...history,
        documents: newDocs,
        activeDocumentId: state.activeDocumentId || (newDocs.length > 0 ? newDocs[0].id : null),
      };
    }

    case ACTIONS.REMOVE_DOCUMENT: {
      const history = recordHistory(state);
      const removedIndex = state.documents.findIndex((doc) => doc.id === action.payload);
      const newDocs = state.documents.filter((doc) => doc.id !== action.payload);
      // Pick the nearest remaining doc when the active one is removed
      let nextActiveId = state.activeDocumentId;
      if (state.activeDocumentId === action.payload) {
        if (newDocs.length === 0) {
          nextActiveId = null;
        } else {
          // Prefer the doc that was right after the removed one, else the one before
          const nextIndex = Math.min(removedIndex, newDocs.length - 1);
          nextActiveId = newDocs[nextIndex].id;
        }
      }
      return {
        ...state,
        ...history,
        documents: newDocs,
        activeDocumentId: nextActiveId,
      };
    }

    case ACTIONS.RENAME_DOCUMENT: {
      const { documentId, newName } = action.payload;
      if (!newName || !newName.trim()) return state;
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === documentId ? { ...doc, name: newName.trim() } : doc
        ),
      };
    }

    case ACTIONS.TOGGLE_PAGE_SELECTION: {
      const { documentId, pageId } = action.payload;
      return {
        ...state,
        documents: state.documents.map((doc) => {
          if (doc.id !== documentId) return doc;
          return {
            ...doc,
            pages: doc.pages.map((page) =>
              page.id === pageId ? { ...page, selected: !page.selected } : page
            ),
          };
        }),
      };
    }

    case ACTIONS.SELECT_ALL: {
      return {
        ...state,
        documents: state.documents.map((doc) => {
          if (doc.id !== state.activeDocumentId) return doc;
          return {
            ...doc,
            pages: doc.pages.map((page) => ({ ...page, selected: true })),
          };
        }),
      };
    }

    case ACTIONS.DESELECT_ALL: {
      return {
        ...state,
        documents: state.documents.map((doc) => {
          if (doc.id !== state.activeDocumentId) return doc;
          return {
            ...doc,
            pages: doc.pages.map((page) => ({ ...page, selected: false })),
          };
        }),
      };
    }

    case ACTIONS.INVERT_SELECTION: {
      return {
        ...state,
        documents: state.documents.map((doc) => {
          if (doc.id !== state.activeDocumentId) return doc;
          return {
            ...doc,
            pages: doc.pages.map((page) => ({ ...page, selected: !page.selected })),
          };
        }),
      };
    }

    case ACTIONS.DELETE_SELECTED_PAGES: {
      const activeDoc = state.documents.find((d) => d.id === state.activeDocumentId);
      if (!activeDoc || !activeDoc.pages.some((p) => p.selected)) return state;

      const history = recordHistory(state);
      return {
        ...state,
        ...history,
        documents: state.documents.map((doc) => {
          if (doc.id !== state.activeDocumentId) return doc;
          const remainingPages = doc.pages.filter((page) => !page.selected);
          const reindexed = reindexPages(remainingPages);
          return {
            ...doc,
            pageCount: reindexed.length,
            pages: reindexed,
          };
        }),
      };
    }

    case ACTIONS.DELETE_PAGE: {
      const { documentId, pageId } = action.payload;
      const targetDoc = state.documents.find((d) => d.id === documentId);
      if (!targetDoc || !targetDoc.pages.some((p) => p.id === pageId)) return state;

      const history = recordHistory(state);
      return {
        ...state,
        ...history,
        documents: state.documents.map((doc) => {
          if (doc.id !== documentId) return doc;
          const remainingPages = doc.pages.filter((page) => page.id !== pageId);
          const reindexed = reindexPages(remainingPages);
          return {
            ...doc,
            pageCount: reindexed.length,
            pages: reindexed,
          };
        }),
      };
    }

    case ACTIONS.REORDER_PAGES: {
      const { documentId, oldIndex, newIndex } = action.payload;
      if (oldIndex === newIndex) return state;

      const history = recordHistory(state);
      return {
        ...state,
        ...history,
        documents: state.documents.map((doc) => {
          if (doc.id !== documentId) return doc;
          const newPages = [...doc.pages];
          const [movedItem] = newPages.splice(oldIndex, 1);
          newPages.splice(newIndex, 0, movedItem);
          const reindexed = reindexPages(newPages);
          return { ...doc, pages: reindexed };
        }),
      };
    }

    case ACTIONS.ROTATE_PAGES: {
      const { documentId, pageIds, angle = 90 } = action.payload;
      const targetDoc = state.documents.find((d) => d.id === documentId);
      if (!targetDoc) return state;
      // Check if any page would actually be rotated
      const wouldRotateAny = targetDoc.pages.some((page) =>
        pageIds ? pageIds.includes(page.id) : page.selected
      );
      if (!wouldRotateAny) return state;

      const history = recordHistory(state);
      return {
        ...state,
        ...history,
        documents: state.documents.map((doc) => {
          if (doc.id !== documentId) return doc;
          return {
            ...doc,
            pages: doc.pages.map((page) => {
              const shouldRotate = pageIds ? pageIds.includes(page.id) : page.selected;
              if (shouldRotate) {
                const currentRot = page.rotation || 0;
                return { ...page, rotation: (currentRot + angle) % 360 };
              }
              return page;
            }),
          };
        }),
      };
    }

    case ACTIONS.DUPLICATE_PAGE: {
      const { documentId, pageId } = action.payload;
      const history = recordHistory(state);
      return {
        ...state,
        ...history,
        documents: state.documents.map((doc) => {
          if (doc.id !== documentId) return doc;
          const targetIndex = doc.pages.findIndex((p) => p.id === pageId);
          if (targetIndex === -1) return doc;
          const targetPage = doc.pages[targetIndex];
          const duplicate = {
            ...targetPage,
            id: crypto.randomUUID(),
            selected: false,
          };
          const newPages = [...doc.pages];
          newPages.splice(targetIndex + 1, 0, duplicate);
          const reindexed = reindexPages(newPages);
          return {
            ...doc,
            pageCount: reindexed.length,
            pages: reindexed,
          };
        }),
      };
    }

    case ACTIONS.INSERT_BLANK_PAGE: {
      const { documentId, afterIndex } = action.payload;
      const history = recordHistory(state);
      return {
        ...state,
        ...history,
        documents: state.documents.map((doc) => {
          if (doc.id !== documentId) return doc;
          const newPage = {
            id: crypto.randomUUID(),
            pageNumber: (afterIndex ?? doc.pages.length) + 1,
            width: 612,
            height: 792,
            selected: false,
            rotation: 0,
            templateType: 'text_columns',
            title: `Page ${(afterIndex ?? doc.pages.length) + 1}`,
          };
          const newPages = [...doc.pages];
          const insertPos = afterIndex !== undefined ? afterIndex + 1 : newPages.length;
          newPages.splice(insertPos, 0, newPage);
          const reindexed = reindexPages(newPages);
          return {
            ...doc,
            pageCount: reindexed.length,
            pages: reindexed,
          };
        }),
      };
    }

    case ACTIONS.MERGE_DOCUMENTS: {
      const { docIds, newTitle = 'Merged_Document.pdf' } = action.payload;
      const docsToMerge = state.documents.filter((d) => docIds.includes(d.id));
      if (docsToMerge.length === 0) return state;

      const mergedPages = docsToMerge.flatMap((d) => d.pages.map((p) => ({ ...p, id: crypto.randomUUID(), selected: false })));
      const reindexed = reindexPages(mergedPages);

      const mergedDoc = {
        id: crypto.randomUUID(),
        name: newTitle,
        filePath: `/mock/${newTitle}`,
        pageCount: reindexed.length,
        fileSize: `${(docsToMerge.length * 1.8).toFixed(1)} MB`,
        updatedAt: 'Just now',
        color: 'violet',
        pages: reindexed,
        metadata: { title: newTitle },
      };

      const history = recordHistory(state);
      return {
        ...state,
        ...history,
        documents: [...state.documents, mergedDoc],
        activeDocumentId: mergedDoc.id,
      };
    }

    default:
      return state;
  }
}

export default function useDocumentStore() {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => dispatch({ type: ACTIONS.UNDO }), []);
  const redo = useCallback(() => dispatch({ type: ACTIONS.REDO }), []);

  return {
    ...state,
    canUndo,
    canRedo,
    undo,
    redo,
    dispatch,
    ACTIONS,
  };
}
