import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Plus, Trash2, Pin, CheckSquare, Palette, X, Edit2 } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import '../index.css';

const NOTE_COLORS = ['#ffffff', '#fef3c7', '#dcfce7', '#e0e7ff', '#fce7f3', '#f3f4f6'];

const EvoNotes = () => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [notes, setNotes] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  
  // Note Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [pinned, setPinned] = useState(false);
  const [checklist, setChecklist] = useState([]); // {id, text, done}
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(collection(db, 'evonotes'), where('userId', '==', currentUser.uid));
    const unsub = onSnapshot(q, snap => {
      const data = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      // Sort: Pinned first, then by createdAt descending
      data.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
      setNotes(data);
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    const handler = () => {
      handleOpenModal();
    };
    window.addEventListener('mobile-fab-evonotes', handler);
    return () => window.removeEventListener('mobile-fab-evonotes', handler);
  }, []);

  const resetForm = () => {
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setColor('#ffffff');
    setPinned(false);
    setChecklist([]);
    setNewChecklistItem('');
  };

  const handleOpenModal = (note = null) => {
    if (note) {
      setEditingNoteId(note.id);
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || '#ffffff');
      setPinned(note.pinned || false);
      setChecklist(note.checklist || []);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setChecklist([...checklist, { id: Date.now().toString(), text: newChecklistItem.trim(), done: false }]);
    setNewChecklistItem('');
  };

  const handleToggleChecklistItem = (id) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleRemoveChecklistItem = (id) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const handleSaveNote = async () => {
    if (!title && !content && checklist.length === 0) return;
    try {
      const noteData = {
        userId: currentUser.uid,
        title: title || 'Untitled Note',
        content,
        color,
        pinned,
        checklist,
        updatedAt: Date.now()
      };

      if (editingNoteId) {
        await updateDoc(doc(db, 'evonotes', editingNoteId), noteData);
      } else {
        await addDoc(collection(db, 'evonotes'), { ...noteData, createdAt: Date.now() });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this note?')) {
      await deleteDoc(doc(db, 'evonotes', id));
    }
  };

  const handleTogglePin = async (note, e) => {
    e.stopPropagation();
    await updateDoc(doc(db, 'evonotes', note.id), { pinned: !note.pinned });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {!isMobile && (
        <div className="matte-3d" style={{ padding: '24px', borderRadius: '24px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={28} color="var(--color-ocean-blue)" /> Evo Notes
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Your private knowledge base and personal task checklists</p>
        </div>
        <button onClick={() => handleOpenModal()} style={{ background: 'var(--color-ocean-blue)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 16px rgba(0,102,204,0.3)' }}>
          <Plus size={20}/> Create Note
        </button>
      </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>
            <FileText size={64} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <h3>No notes yet</h3>
            <p>Create your first Evo Note to start organizing your personal workflow.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', paddingBottom: '40px' }}>
            {notes.map(note => (
              <div 
                key={note.id} 
                onClick={() => handleOpenModal(note)}
                className="matte-3d" 
                style={{ background: note.color || '#ffffff', padding: '20px', borderRadius: '20px', position: 'relative', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--glass-border)', transition: 'transform 0.2s', minHeight: '150px' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', paddingRight: '40px' }}>{note.title}</h4>
                  <div style={{ display: 'flex', gap: '8px', position: 'absolute', top: '16px', right: '16px' }}>
                    <button onClick={(e) => handleTogglePin(note, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: note.pinned ? 'var(--color-deep-orange)' : 'var(--text-secondary)', padding: 0 }}>
                      <Pin size={18} fill={note.pinned ? 'var(--color-deep-orange)' : 'none'}/>
                    </button>
                    <button onClick={(e) => handleDeleteNote(note.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0 }}>
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>

                {note.content && (
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {note.content}
                  </p>
                )}

                {note.checklist && note.checklist.length > 0 && (
                  <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <CheckSquare size={14}/> 
                      {note.checklist.filter(i => i.done).length} / {note.checklist.length} Completed
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note Edit Modal */}
      {isModalOpen && (
        <div className={isMobile ? "mobile-bottom-sheet-overlay" : ""} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className={isMobile ? "mobile-bottom-sheet" : "matte-3d"} style={{ background: color, width: isMobile ? '100%' : '90%', maxWidth: '600px', height: isMobile ? '92vh' : 'auto', borderRadius: isMobile ? '24px 24px 0 0' : '24px', padding: '30px', position: 'relative', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18}/>
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {NOTE_COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, border: color === c ? '2px solid var(--color-ocean-blue)' : '1px solid var(--glass-border)', cursor: 'pointer' }}/>
                ))}
              </div>
              <button onClick={() => setPinned(!pinned)} style={{ background: 'none', border: 'none', color: pinned ? 'var(--color-deep-orange)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Pin size={18} fill={pinned ? 'var(--color-deep-orange)' : 'none'}/> {pinned ? 'Pinned' : 'Pin Note'}
              </button>
            </div>

            <input 
              type="text" 
              placeholder="Title" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', fontSize: '24px', fontWeight: 700, border: 'none', background: 'transparent', outline: 'none', marginBottom: '16px', color: 'var(--text-primary)' }}
            />
            
            <textarea 
              placeholder="Take a note..." 
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{ width: '100%', flex: 1, minHeight: '150px', fontSize: '15px', border: 'none', background: 'transparent', outline: 'none', resize: 'vertical', color: 'var(--text-secondary)', lineHeight: 1.6 }}
            />

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed var(--glass-border)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckSquare size={16}/> Checklist Items</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {checklist.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" checked={item.done} onChange={() => handleToggleChecklistItem(item.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <span style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'gray' : 'black', fontSize: '14px' }}>{item.text}</span>
                    <button onClick={() => handleRemoveChecklistItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14}/></button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Add checklist item..." 
                  value={newChecklistItem}
                  onChange={e => setNewChecklistItem(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem()}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', outline: 'none', background: 'white' }}
                />
                <button onClick={handleAddChecklistItem} style={{ background: 'rgba(0,102,204,0.1)', color: 'var(--color-ocean-blue)', border: 'none', padding: '0 16px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Add</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
              <button onClick={handleSaveNote} style={{ background: 'var(--color-ocean-blue)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}>
                {editingNoteId ? 'Update Note' : 'Save Note'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default EvoNotes;
