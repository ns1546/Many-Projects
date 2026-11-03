import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { templateLibrary, clauseLibrary } from './data';

export const useStore = create(
  persist(
    (set, get) => ({
      currentView: 'dashboard', // 'dashboard', 'wizard', 'workspace'
      setView: (view) => set({ currentView: view }),

      currentUserRole: 'legal', // 'legal', 'sales'
      setRole: (role) => set({ currentUserRole: role }),

      activeSectionId: null,
      setActiveSection: (id) => set({ activeSectionId: id }),

      metadata: {
        agreementType: '',
        partyA: '',
        partyB: '',
        date: new Date().toISOString().split('T')[0],
        jurisdiction: 'Bangladesh',
        language: 'en',
        theme: 'modern-corporate'
      },
      
      sections: [],
      
      savedDocuments: [],
      activeDocumentId: null,

      saveCurrentDocument: () => set((state) => {
        const docId = state.activeDocumentId || `doc_${Date.now()}`;
        const docTitle = state.metadata.partyB ? `${state.metadata.agreementType} - ${state.metadata.partyB}` : state.metadata.agreementType;
        
        const newDoc = {
          id: docId,
          title: docTitle,
          metadata: state.metadata,
          sections: state.sections,
          updatedAt: new Date().toISOString()
        };

        const existingIdx = state.savedDocuments.findIndex(d => d.id === docId);
        let newDocs = [...state.savedDocuments];
        if (existingIdx >= 0) newDocs[existingIdx] = newDoc;
        else newDocs.push(newDoc);

        return { savedDocuments: newDocs, activeDocumentId: docId };
      }),

      loadDocument: (docId) => set((state) => {
        const doc = state.savedDocuments.find(d => d.id === docId);
        if (!doc) return state;
        
        return {
          activeDocumentId: docId,
          metadata: doc.metadata,
          sections: doc.sections,
          currentView: 'workspace'
        };
      }),
      
      // History for Undo/Redo
      history: [],
      historyIndex: -1,

      _saveHistory: (state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push({
          metadata: state.metadata,
          sections: state.sections
        });
        return {
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      },

      loadTemplate: (templateId) => set((state) => {
        const template = templateLibrary.find(t => t.id === templateId);
        if (!template) return state;
        
        const nextState = {
          ...state,
          activeDocumentId: null,
          metadata: { ...state.metadata, agreementType: template.name },
          sections: template.sections.map(s => ({ 
            ...s, 
            id: `${s.id}_${Date.now()}`,
            status: 'standard',
            comments: []
          }))
        };
        return { ...nextState, ...state._saveHistory(nextState) };
      }),

      updateMetadata: (updates) => set((state) => {
        const nextState = {
          ...state,
          metadata: { ...state.metadata, ...updates }
        };
        return { ...nextState, ...state._saveHistory(nextState) };
      }),

      addClauseFromLibrary: (clauseId) => set((state) => {
        const clause = clauseLibrary.find(c => c.id === clauseId);
        if (!clause) return state;
        
        const newSection = {
          ...clause,
          id: `sec_${Date.now()}`,
          locked: false,
          status: 'standard', // 'standard', 'modified', 'approved'
          comments: []
        };
        // Insert right before Signatures if it exists
        const sections = [...state.sections];
        const sigIndex = sections.findIndex(s => s.type === 'signatures');
        
        if (sigIndex !== -1) {
          sections.splice(sigIndex, 0, newSection);
        } else {
          sections.push(newSection);
        }

        const nextState = { ...state, sections };
        return { ...nextState, ...state._saveHistory(nextState) };
      }),

      removeSection: (id) => set((state) => {
        const nextState = {
          ...state,
          sections: state.sections.filter(s => s.id !== id)
        };
        return { ...nextState, ...state._saveHistory(nextState) };
      }),

      moveSection: (index, direction) => set((state) => {
        if (
          (direction === -1 && index === 0) || 
          (direction === 1 && index === state.sections.length - 1)
        ) return state;

        const newSections = [...state.sections];
        const temp = newSections[index];
        newSections[index] = newSections[index + direction];
        newSections[index + direction] = temp;

        const nextState = { ...state, sections: newSections };
        return { ...nextState, ...state._saveHistory(nextState) };
      }),

      updateSectionContent: (id, content) => set((state) => {
        const newSections = state.sections.map(s => 
          s.id === id && !s.locked ? { ...s, content, status: 'modified' } : s
        );
        const nextState = { ...state, sections: newSections };
        return { ...nextState, ...state._saveHistory(nextState) };
      }),

      approveSection: (id) => set((state) => {
        const newSections = state.sections.map(s => 
          s.id === id ? { ...s, status: 'approved', locked: true } : s
        );
        const nextState = { ...state, sections: newSections };
        return { ...nextState, ...state._saveHistory(nextState) };
      }),

      unlockSection: (id) => set((state) => {
        if (state.currentUserRole !== 'legal') return state; // Only legal can unlock
        const newSections = state.sections.map(s => 
          s.id === id ? { ...s, status: 'modified', locked: false } : s
        );
        const nextState = { ...state, sections: newSections };
        return { ...nextState, ...state._saveHistory(nextState) };
      }),

      addCommentToSection: (id, text) => set((state) => {
        const newSections = state.sections.map(s => {
          if (s.id === id) {
            return {
              ...s,
              comments: [...(s.comments || []), { id: Date.now(), text, author: 'Legal Team', date: new Date().toISOString() }]
            };
          }
          return s;
        });
        const nextState = { ...state, sections: newSections };
        return { ...nextState, ...state._saveHistory(nextState) };
      }),

      undo: () => set((state) => {
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          const previousState = state.history[newIndex];
          return {
            historyIndex: newIndex,
            metadata: previousState.metadata,
            sections: previousState.sections
          };
        }
        return state;
      }),

      redo: () => set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          const nextState = state.history[newIndex];
          return {
            historyIndex: newIndex,
            metadata: nextState.metadata,
            sections: nextState.sections
          };
        }
        return state;
      })
    }),
    {
      name: 'agreement-studio-storage', // autosave to localStorage
    }
  )
);
