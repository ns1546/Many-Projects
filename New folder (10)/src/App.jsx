import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from './store';
import { templateLibrary, clauseLibrary } from './data';
import { DocumentCompiler } from './Compiler';
import toast, { Toaster } from 'react-hot-toast';
import { 
  FileText, Settings, Share2, Download, 
  Undo2, Redo2, Plus, GripVertical, Trash2,
  ChevronUp, ChevronDown, ArrowRight, 
  BookTemplate, Search, X, Briefcase, CheckCircle2, AlertTriangle, PenTool,
  MessageSquare, Maximize2, Minimize2, Check, ShieldCheck, Lock, Unlock, User, BookOpen, Save, Clock
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';

function Dashboard() {
  const { setView, loadTemplate, savedDocuments, loadDocument } = useStore();
  const handleCreate = (templateId) => {
    loadTemplate(templateId);
    setView('wizard');
  };
  return (
    <div className="app-container" style={{maxWidth: '1200px', margin: '0 auto', paddingTop: '4rem'}}>
      <div style={{animation: 'fadeIn 0.5s ease-out'}}>
        <div style={{textAlign: 'center', marginBottom: '4rem'}}>
          <h1 style={{fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', background: 'linear-gradient(135deg, var(--text-primary), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            Agreement Studio
          </h1>
          <p style={{color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto'}}>
            Enterprise Contract Lifecycle Management
          </p>
        </div>

        {/* RECENT DOCUMENTS DATABASE */}
        {savedDocuments && savedDocuments.length > 0 && (
          <div style={{marginBottom: '4rem'}}>
            <h2 style={{fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Clock size={20} color="var(--accent-color)" /> Recent Contracts
            </h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem'}}>
              {savedDocuments.map(doc => {
                const approvedCount = doc.sections.filter(s => s.status === 'approved' || s.locked).length;
                const totalCount = doc.sections.length;
                const progress = totalCount === 0 ? 0 : Math.round((approvedCount / totalCount) * 100);
                
                return (
                  <div key={doc.id} className="clay-card" style={{cursor: 'pointer'}} onClick={() => loadDocument(doc.id)}>
                    <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        <div style={{padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--accent-color)'}}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <h3 style={{fontSize: '1.1rem', margin: '0 0 0.25rem 0'}}>{doc.title}</h3>
                          <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0}}>
                            Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{marginTop: '1.5rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-secondary)'}}>
                        <span>Legal Approval</span>
                        <span style={{fontWeight: 800, color: progress === 100 ? 'var(--success-color)' : 'var(--text-primary)'}}>{progress}%</span>
                      </div>
                      <div style={{height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden'}}>
                        <div style={{height: '100%', width: `${progress}%`, background: progress === 100 ? 'var(--success-color)' : 'var(--accent-color)', borderRadius: '3px', transition: 'width 0.3s ease'}} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <h2 style={{fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <BookTemplate size={20} color="var(--accent-color)" /> Start from Template
        </h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem'}}>
          {templateLibrary.map(template => (
            <div 
              key={template.id} 
              className="clay-card"
              style={{ padding: '2rem', cursor: 'pointer' }}
              onClick={() => handleCreate(template.id)}
            >
              <h3 style={{marginBottom: '1rem', color: 'var(--accent-color)', fontSize: '1.25rem'}}>{template.name}</h3>
              <p style={{fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6}}>{template.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Wizard() {
  const { metadata, updateMetadata, setView } = useStore();
  const handleNext = () => {
    if (!metadata.partyA || !metadata.partyB) {
      toast.error('Please enter both party names to initialize variables.');
      return;
    }
    setView('workspace');
  };
  return (
    <div className="app-container" style={{maxWidth: '700px', margin: '0 auto', paddingTop: '4rem'}}>
      <div className="clay-card" style={{padding: '3rem'}}>
        <h2 style={{marginBottom: '2.5rem', textAlign: 'center', color: 'var(--text-primary)', fontSize: '1.8rem'}}>Initialize Variables</h2>
        
        <div className="input-group">
          <label>Provider / Party A</label>
          <input type="text" className="clay-input" 
            value={metadata.partyA} onChange={(e) => updateMetadata({ partyA: e.target.value })}
            placeholder="e.g. Acme Corp" />
        </div>
        <div className="input-group">
          <label>Client / Party B</label>
          <input type="text" className="clay-input" 
            value={metadata.partyB} onChange={(e) => updateMetadata({ partyB: e.target.value })}
            placeholder="e.g. John Doe" />
        </div>
        <div className="input-group" style={{marginBottom: '3rem'}}>
          <label>Effective Date</label>
          <input type="date" className="clay-input" 
            value={metadata.date} onChange={(e) => updateMetadata({ date: e.target.value })} />
        </div>
        <button className="clay-btn clay-btn-primary" style={{width: '100%', padding: '1.25rem', fontSize: '1.1rem'}} onClick={handleNext}>
          Compile Document <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

function ClauseModal({ onClose }) {
  const { addClauseFromLibrary } = useStore();
  const [search, setSearch] = useState('');
  const filteredClauses = clauseLibrary.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.content.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(226, 232, 240, 0.7)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="clay-card" style={{width: '100%', maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center'}}>
          <h2 style={{fontSize: '1.5rem', color: 'var(--text-primary)'}}>Clause Library</h2>
          <button className="toolbar-btn" onClick={onClose}><X size={28} /></button>
        </div>
        <div className="input-group" style={{marginBottom: '2rem'}}>
          <div style={{position: 'relative'}}>
            <Search size={20} style={{position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)'}} />
            <input 
              type="text" className="clay-input" style={{paddingLeft: '50px', width: '100%'}}
              placeholder="Search library clauses..." value={search} onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {filteredClauses.map(clause => (
            <div key={clause.id} className="clay-card" style={{padding: '1.5rem', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'}}>
              <div style={{paddingRight: '1.5rem'}}>
                <h4 style={{marginBottom: '0.5rem', fontSize: '1.1rem', color: 'var(--text-primary)'}}>{clause.title}</h4>
                <p style={{fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6}}>{clause.content}</p>
              </div>
              <button className="clay-btn clay-btn-primary" onClick={() => { addClauseFromLibrary(clause.id); onClose(); }}>
                Insert
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Workspace() {
  const { 
    metadata, sections, historyIndex, history,
    updateMetadata, removeSection, moveSection, updateSectionContent,
    undo, redo, setView, addCommentToSection, approveSection,
    currentUserRole, setRole, unlockSection,
    savedDocuments, saveCurrentDocument, loadDocument
  } = useStore();

  const [showClauseModal, setShowClauseModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const documentRef = React.useRef(null);

  // Auto-scroll to active section
  useEffect(() => {
    const activeId = useStore.getState().activeSectionId;
    if (activeId) {
      const element = document.getElementById(`doc-sec-${activeId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [useStore.getState().activeSectionId]);

  const compiler = useMemo(() => new DocumentCompiler(metadata, sections), [metadata, sections]);
  const compiled = useMemo(() => compiler.compile(), [compiler]);

  const downloadPDF = async () => {
    if (!compiled.isComplete) {
      toast.error(`Validation Failed: ${compiled.errors.join(', ')}`);
      return;
    }
    if (!documentRef.current) return;
    toast.loading('Compiling PDF...', { id: 'pdf' });
    try {
      const canvas = await html2canvas(documentRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${metadata.agreementType || 'Agreement'}.pdf`);
      toast.success('PDF Downloaded successfully!', { id: 'pdf' });
    } catch (error) {
      toast.error('Failed to download PDF', { id: 'pdf' });
    }
  };

  const handleLatexExport = () => {
    let tex = `\\documentclass{article}\n\\begin{document}\n`;
    tex += `\\title{${metadata.agreementType}}\n\\date{${metadata.date}}\n\\maketitle\n\n`;
    compiled.sections.forEach(sec => {
      if (sec.type === 'signatures') {
        tex += `\\vspace{2cm}\n\\noindent\\textbf{FOR ${metadata.partyA}:}\\\\\\vspace{1cm}\\\\\\rule{5cm}{0.4pt}\\\\\n`;
      } else {
        const h = sec.depth === 0 ? 'section' : 'subsection';
        tex += `\\${h}{${sec.title}}\n${sec.resolvedContent}\n\n`;
      }
    });
    tex += `\\end{document}`;
    const blob = new Blob([tex], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${metadata.agreementType}.tex`);
    toast.success('LaTeX Source Downloaded!');
  };

  const handleAddComment = (secId) => {
    if (!newComment.trim()) return;
    addCommentToSection(secId, newComment);
    setNewComment('');
  };

  // Calculate completeness
  const totalVars = sections.reduce((acc, sec) => acc + (sec.variables?.length || 0), 0) + 5; // +5 for core metadata
  const filledVars = sections.reduce((acc, sec) => {
    return acc + (sec.variables?.filter(v => metadata[v.key])?.length || 0);
  }, 0) + ['agreementType', 'partyA', 'partyB', 'date', 'jurisdiction'].filter(k => metadata[k]).length;
  const progressPercent = Math.round((filledVars / totalVars) * 100) || 0;

  return (
    <div className="app-container" style={{maxWidth: isFullscreen ? '100%' : '1700px', padding: isFullscreen ? '1rem' : '2rem'}}>
      {showClauseModal && <ClauseModal onClose={() => setShowClauseModal(false)} />}
      
      <div className="header">
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <button className="clay-btn" style={{padding: '0.6rem'}} onClick={() => setView('dashboard')}><Briefcase size={22} color="var(--accent-color)" /></button>
          <h1><FileText size={28} color="var(--accent-color)" /> Agreement Studio Workspace</h1>
        </div>
        <div className="flex-between" style={{gap: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: '24px', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05)'}}>
              <span style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)'}}>Completeness</span>
              <div style={{width: '100px', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{width: `${progressPercent}%`, height: '100%', background: progressPercent === 100 ? 'var(--success-color)' : 'var(--accent-color)'}}></div>
              </div>
              <span style={{fontSize: '0.85rem', fontWeight: 800, color: progressPercent === 100 ? 'var(--success-color)' : 'var(--accent-color)'}}>{progressPercent}%</span>
            </div>

           <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
              
              <button className="clay-btn" style={{padding: '0.6rem 1rem', background: 'var(--accent-color)', color: 'white', display: 'flex', gap: '0.5rem', alignItems: 'center'}} onClick={() => {
                saveCurrentDocument();
                alert('Document successfully saved to the database.');
              }}>
                <Save size={16} /> Save Contract
              </button>

              <div style={{display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', marginRight: '1rem', marginLeft: '1rem'}}>
                <button className={`toolbar-btn ${currentUserRole === 'legal' ? 'active' : ''}`} style={{background: currentUserRole === 'legal' ? 'var(--accent-color)' : 'transparent', color: currentUserRole === 'legal' ? 'white' : 'inherit', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold'}} onClick={() => setRole('legal')}>
                  LEGAL
                </button>
                <button className={`toolbar-btn ${currentUserRole === 'sales' ? 'active' : ''}`} style={{background: currentUserRole === 'sales' ? 'var(--accent-color)' : 'transparent', color: currentUserRole === 'sales' ? 'white' : 'inherit', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold'}} onClick={() => setRole('sales')}>
                  SALES
                </button>
              </div>

              <button className="clay-btn" style={{padding: '0.6rem'}} onClick={() => setIsFullscreen(!isFullscreen)} title="Toggle Reader Mode">
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button className="clay-btn" onClick={undo} disabled={historyIndex <= 0} title="Undo AST Change"><Undo2 size={20} /></button>
              <button className="clay-btn" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo AST Change"><Redo2 size={20} /></button>
            </div>
            {!compiled.isComplete && (
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-color)', fontSize: '0.95rem', fontWeight: 700}}>
                <AlertTriangle size={18} /> Validation Errors
              </div>
            )}
            <button className="clay-btn clay-btn-primary" onClick={downloadPDF}>
              <Download size={18} /> Compile PDF
            </button>
        </div>
      </div>

      <div className="workspace" style={{gridTemplateColumns: isFullscreen ? '1fr' : '320px 1fr 340px'}}>
        {/* PANEL 1: STRUCTURE */}
        {!isFullscreen && (
          <div className="clay-card" style={{ padding: '1.5rem', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '1px', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>DOCUMENT OUTLINE</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {compiled.sections.map((section, index) => {
                const isActive = useStore.getState().activeSectionId === section.id;
                return (
                  <div key={section.id} 
                    onClick={() => useStore.getState().setActiveSection(isActive ? null : section.id)}
                    style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem', borderRadius: '12px', background: isActive ? 'var(--accent-color)' : 'var(--surface-color)', 
                    color: isActive ? 'white' : 'inherit',
                    boxShadow: isActive ? 'var(--clay-shadow-pressed)' : 'inset 2px 2px 5px rgba(255,255,255,1), inset -2px -2px 5px rgba(163,177,198,0.2)',
                    marginLeft: `${(section.depth || 0) * 1.5}rem`,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{color: isActive ? 'white' : 'var(--accent-color)', fontWeight: 800, fontSize: '0.9rem', width: '30px'}}>
                        {section.displayIndex}
                      </span>
                      <span style={{fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px', fontWeight: 600, textDecoration: section.locked ? 'line-through opacity-50' : 'none'}}>{section.title}</span>
                      {section.status === 'modified' && <AlertTriangle size={14} color="#f59e0b" title="Modified from Standard" />}
                      {section.status === 'approved' && <ShieldCheck size={14} color="var(--success-color)" title="Approved by Legal" />}
                    </div>
                    <div style={{display: 'flex', gap: '0.25rem'}} onClick={e => e.stopPropagation()}>
                      <button className="toolbar-btn" style={{color: isActive ? 'white' : 'inherit'}} onClick={() => moveSection(index, -1)} disabled={index === 0}><ChevronUp size={16} /></button>
                      <button className="toolbar-btn" style={{color: isActive ? 'white' : 'inherit'}} onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1}><ChevronDown size={16} /></button>
                      {!section.locked && currentUserRole === 'legal' && <button className="toolbar-btn" style={{color: isActive ? '#fca5a5' : 'var(--danger-color)'}} onClick={() => removeSection(section.id)}><Trash2 size={16} /></button>}
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="clay-btn" style={{marginTop: '2rem', width: '100%'}} onClick={() => setShowClauseModal(true)}>
              <Plus size={18} /> Add Library Clause
            </button>
          </div>
        )}

        {/* PANEL 2: COMPILER PREVIEW */}
        <div className="clay-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--surface-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
            <div style={{display: 'flex', gap: '1.5rem'}}>
              <span style={{fontSize: '0.9rem', fontWeight: 700, color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><CheckCircle2 size={16} /> AST Compiled</span>
              <span style={{fontSize: '0.9rem', fontWeight: 700, color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><CheckCircle2 size={16} /> Refs Resolved</span>
            </div>
            <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600}}>A4 Document Layout</span>
          </div>
          
          <div className="document-container" style={{position: 'relative'}}>
            {/* Watermark for unapproved documents */}
            {(progressPercent < 100 || sections.some(s => s.status !== 'approved' && !s.locked)) && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)',
                fontSize: '120px', fontWeight: 900, color: 'rgba(0,0,0,0.03)', pointerEvents: 'none', zIndex: 0,
                whiteSpace: 'nowrap', userSelect: 'none'
              }}>
                DRAFT - IN REVIEW
              </div>
            )}
            
            <div className="document-paper" ref={documentRef} style={{position: 'relative', zIndex: 1}}>
              
              {/* Official Government Header Decoration */}
              {metadata.agreementType === 'U.S. Federal Government Procurement Agreement' && (
                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                  <div style={{width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #1e293b', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{width: '64px', height: '64px', borderRadius: '50%', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <span style={{fontSize: '32px'}}>🦅</span>
                    </div>
                  </div>
                  <h2 style={{fontFamily: 'serif', margin: 0, fontSize: '14pt', letterSpacing: '2px', textTransform: 'uppercase'}}>UNITED STATES GOVERNMENT</h2>
                  <p style={{fontFamily: 'serif', margin: '0.25rem 0 0 0', fontSize: '10pt', fontStyle: 'italic'}}>Department of Defense • Civilian Agencies</p>
                </div>
              )}

              <div style={{borderBottom: '4px double #1e293b', paddingBottom: '1.5rem', marginBottom: '3rem'}}>
                <h1 style={{textAlign: 'center', textTransform: 'uppercase', fontSize: '18pt', letterSpacing: '1px', margin: 0, fontFamily: 'serif', fontWeight: 900}}>{metadata.agreementType || 'AGREEMENT'}</h1>
              </div>
              
              <div style={{marginBottom: '3rem', fontSize: '11pt'}}>
                <p style={{marginBottom: '0.75rem'}}><strong>EFFECTIVE DATE:</strong> {metadata.date}</p>
                <p style={{marginBottom: '0.75rem'}}><strong>BETWEEN:</strong> {metadata.partyA || '[Party A]'} AND {metadata.partyB || '[Party B]'}</p>
                <p style={{marginBottom: '0.75rem'}}><strong>JURISDICTION:</strong> {metadata.jurisdiction}</p>
              </div>

              {compiled.sections.map((section) => {
                if (section.type === 'signatures') {
                  return (
                    <div key={section.id} style={{marginTop: '5rem', display: 'flex', justifyContent: 'space-between', fontSize: '11pt'}}>
                      <div style={{width: '45%'}}>
                        <p style={{fontWeight: 'bold', marginBottom: '3rem'}}>FOR {metadata.partyA}:</p>
                        <div style={{borderBottom: '1px solid black', height: '1px'}}></div>
                        <p style={{marginTop: '0.5rem'}}>Name: ________________</p>
                        <p style={{marginTop: '0.5rem'}}>Date: ________________</p>
                      </div>
                      <div style={{width: '45%'}}>
                        <p style={{fontWeight: 'bold', marginBottom: '3rem'}}>FOR {metadata.partyB}:</p>
                        <div style={{borderBottom: '1px solid black', height: '1px'}}></div>
                        <p style={{marginTop: '0.5rem'}}>Name: ________________</p>
                        <p style={{marginTop: '0.5rem'}}>Date: ________________</p>
                      </div>
                    </div>
                  );
                }

                const isEditing = editingSectionId === section.id;
                const isActive = useStore.getState().activeSectionId === section.id;
                
                return (
                  <div id={`doc-sec-${section.id}`} key={section.id} style={{
                    marginBottom: '2rem', 
                    marginLeft: `${(section.depth || 0) * 1.5}rem`,
                    position: 'relative',
                    padding: '1rem',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    background: isActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                    borderLeft: isActive ? '4px solid var(--accent-color)' : '4px solid transparent',
                    boxShadow: isActive ? 'inset 0 0 10px rgba(59, 130, 246, 0.1)' : 'none'
                  }}>
                    <div style={{display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem'}}>
                      {section.displayIndex && <strong style={{fontSize: section.depth === 0 ? '12pt' : '11pt'}}>{section.displayIndex}</strong>}
                      <h3 style={{fontSize: section.depth === 0 ? '12pt' : '11pt', margin: 0, fontWeight: section.depth === 0 ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        {section.title}
                        {section.status === 'approved' && <ShieldCheck size={14} color="var(--success-color)" title="Approved" />}
                      </h3>
                      {!section.locked && currentUserRole === 'legal' && (
                        <button 
                          onClick={() => setEditingSectionId(isEditing ? null : section.id)}
                          style={{background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0 5px'}}
                        ><PenTool size={14} /></button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <textarea 
                        value={section.content}
                        onChange={(e) => updateSectionContent(section.id, e.target.value)}
                        style={{
                          width: '100%', minHeight: '100px', fontFamily: 'monospace', fontSize: '10pt',
                          border: 'none', padding: '1rem', resize: 'vertical',
                          background: '#f1f5f9', color: '#0f172a', outline: 'none', borderRadius: '8px',
                          boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)'
                        }}
                      />
                    ) : (
                      <>
                        <p style={{fontSize: '11pt', textAlign: 'justify', margin: 0, marginBottom: (section.type.startsWith('table_')) ? '1rem' : '0'}}>
                          {section.resolvedContent}
                        </p>
                        
                        {section.type === 'table_deliverables' && (
                          <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '10pt'}}>
                            <thead>
                              <tr style={{background: '#1e293b', color: 'white'}}>
                                <th style={{border: '1px solid #1e293b', padding: '8px', textAlign: 'left'}}>CLIN</th>
                                <th style={{border: '1px solid #1e293b', padding: '8px', textAlign: 'left'}}>Description of Supplies/Services</th>
                                <th style={{border: '1px solid #1e293b', padding: '8px', textAlign: 'left'}}>Delivery Timeline</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px', fontWeight: 'bold'}}>0001</td>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>Initial System Deployment and Configuration</td>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>Within {metadata.deliveryTimelineDays || '45'} days of Award</td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {section.type === 'table_sla' && (
                          <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '10pt'}}>
                            <thead>
                              <tr style={{background: '#1e293b', color: 'white'}}>
                                <th style={{border: '1px solid #1e293b', padding: '8px', textAlign: 'left'}}>Service Level Metric</th>
                                <th style={{border: '1px solid #1e293b', padding: '8px', textAlign: 'left'}}>Target Commitment</th>
                                <th style={{border: '1px solid #1e293b', padding: '8px', textAlign: 'left'}}>Service Credit (%)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>System Uptime (Monthly)</td>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>{metadata.uptimeSLA || '99.9'}%</td>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>10% of monthly fee</td>
                              </tr>
                              <tr>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>Critical Incident Response</td>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>{metadata.incidentResponseMins || '30'} Minutes</td>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>5% per hour delayed</td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {section.type === 'table_pricing' && (
                          <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '10pt'}}>
                            <thead>
                              <tr style={{background: '#1e293b', color: 'white'}}>
                                <th style={{border: '1px solid #1e293b', padding: '8px', textAlign: 'left'}}>Line Item</th>
                                <th style={{border: '1px solid #1e293b', padding: '8px', textAlign: 'left'}}>Description</th>
                                <th style={{border: '1px solid #1e293b', padding: '8px', textAlign: 'right'}}>Annual Cost</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>Platform License</td>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>Enterprise GovCloud Access</td>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right'}}>${metadata.baseLicenseFee || '100,000'}</td>
                              </tr>
                              <tr>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>Security Cleared Support</td>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>24/7 dedicated government tier</td>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right'}}>${metadata.supportFee || '25,000'}</td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {section.type === 'table_insurance' && (
                          <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '10pt'}}>
                            <thead>
                              <tr style={{background: '#1e293b', color: 'white'}}>
                                <th style={{border: '1px solid #1e293b', padding: '8px', textAlign: 'left'}}>Coverage Type</th>
                                <th style={{border: '1px solid #1e293b', padding: '8px', textAlign: 'left'}}>Minimum Limit</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>Commercial General Liability</td>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>$1,000,000 per occurrence</td>
                              </tr>
                              <tr>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>Cyber Liability & Data Breach</td>
                                <td style={{border: '1px solid #cbd5e1', padding: '8px'}}>$5,000,000 aggregate</td>
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* PANEL 3: CONTEXTUAL INSPECTOR */}
        {!isFullscreen && (
        <div className="clay-card" style={{ overflowY: 'auto', padding: '1.5rem' }}>
          
          {useStore.getState().activeSectionId ? (
            // CONTEXTUAL SECTION SETTINGS
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem'}}>
                <button className="toolbar-btn" onClick={() => useStore.getState().setActiveSection(null)}><Undo2 size={18} /></button>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '1px', color: 'var(--accent-color)' }}>
                  CLAUSE DETAILS
                </h2>
              </div>
              
              {(() => {
                const activeSec = sections.find(s => s.id === useStore.getState().activeSectionId);
                if (!activeSec) return null;
                return (
                  <>
                  <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem'}}>
                    <h3 style={{fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.5rem'}}>{activeSec.title}</h3>
                    
                    {!activeSec.variables || activeSec.variables.length === 0 ? (
                      <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>This clause has no specific business variables to configure.</p>
                    ) : (
                      activeSec.variables.map(v => (
                        <div className="input-group" key={v.key}>
                          <label>{v.label}</label>
                          {v.type === 'select' ? (
                            <select className="clay-input" value={metadata[v.key] || v.default} onChange={(e) => updateMetadata({ [v.key]: e.target.value })} disabled={activeSec.locked}>
                              {v.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : v.type === 'textarea' ? (
                            <textarea className="clay-input" style={{resize: 'vertical', minHeight: '80px'}} value={metadata[v.key] || v.default} onChange={(e) => updateMetadata({ [v.key]: e.target.value })} disabled={activeSec.locked} />
                          ) : (
                            <input type={v.type === 'number' ? 'number' : 'text'} className="clay-input" value={metadata[v.key] || v.default} onChange={(e) => updateMetadata({ [v.key]: e.target.value })} disabled={activeSec.locked} />
                          )}
                        </div>
                      ))
                    )}
                    
                    {!activeSec.locked && currentUserRole === 'legal' && (
                      <button className="clay-btn clay-btn-primary" style={{width: '100%', marginTop: '1rem', background: 'var(--success-color)'}} onClick={() => approveSection(activeSec.id)}>
                        <ShieldCheck size={16} /> Approve & Lock Clause
                      </button>
                    )}
                    
                    {activeSec.locked && currentUserRole === 'legal' && (
                      <button className="clay-btn" style={{width: '100%', marginTop: '1rem', background: 'rgba(255,255,255,0.1)'}} onClick={() => unlockSection(activeSec.id)}>
                        <Unlock size={16} /> Unlock for Revision
                      </button>
                    )}
                  </div>

                  {activeSec.fallbacks && activeSec.fallbacks.length > 0 && !activeSec.locked && (
                    <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-color)'}}>
                      <h3 style={{fontSize: '0.85rem', color: 'var(--accent-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <BookOpen size={14}/> Legal Playbook (Fallbacks)
                      </h3>
                      <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem'}}>
                        Alternate phrasing approved for negotiation.
                      </p>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                        {activeSec.fallbacks.map(fb => (
                          <button 
                            key={fb.id} 
                            className="clay-btn" 
                            style={{padding: '0.75rem', fontSize: '0.85rem', textAlign: 'left', justifyContent: 'flex-start', background: 'rgba(255,255,255,0.02)'}}
                            onClick={() => {
                              updateSectionContent(activeSec.id, fb.content);
                              alert(`Clause swapped to: ${fb.title}`);
                            }}
                          >
                            Swap to: <strong>{fb.title}</strong>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px'}}>
                    <h3 style={{fontSize: '0.85rem', color: 'var(--accent-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><MessageSquare size={14}/> Internal Notes</h3>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem'}}>
                      {activeSec.comments?.length > 0 ? activeSec.comments.map(c => (
                        <div key={c.id} style={{background: 'white', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', borderLeft: '3px solid var(--accent-color)'}}>
                          <strong style={{display: 'block', color: 'var(--accent-color)', marginBottom: '0.25rem'}}>{c.author}</strong>
                          {c.text}
                        </div>
                      )) : <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>No notes yet.</p>}
                    </div>

                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <input 
                        type="text" className="clay-input" placeholder="Add a note..." 
                        style={{flex: 1, padding: '0.75rem', fontSize: '0.85rem'}}
                        value={newComment} onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddComment(activeSec.id)}
                      />
                      <button className="clay-btn clay-btn-primary" style={{padding: '0.5rem'}} onClick={() => handleAddComment(activeSec.id)}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </>
                );
              })()}
            </div>
          ) : (
            // GLOBAL METADATA SETTINGS
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '1px', marginBottom: '2rem', color: 'var(--text-secondary)' }}>GLOBAL SETTINGS</h2>
              
              <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem'}}>
                <h3 style={{fontSize: '0.85rem', color: 'var(--accent-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Core Metadata</h3>
                <div className="input-group">
                  <label>Agreement Type</label>
                  <input type="text" className="clay-input" value={metadata.agreementType || ''} onChange={(e) => updateMetadata({ agreementType: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Provider / Party A</label>
                  <input type="text" className="clay-input" value={metadata.partyA || ''} onChange={(e) => updateMetadata({ partyA: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Client / Party B</label>
                  <input type="text" className="clay-input" value={metadata.partyB || ''} onChange={(e) => updateMetadata({ partyB: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Effective Date</label>
                  <input type="date" className="clay-input" value={metadata.date || ''} onChange={(e) => updateMetadata({ date: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Jurisdiction</label>
                  <select className="clay-input" value={metadata.jurisdiction || 'Bangladesh'} onChange={(e) => updateMetadata({ jurisdiction: e.target.value })}>
                    <option>Bangladesh</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>International</option>
                  </select>
                </div>
              </div>

              <div className="input-group" style={{marginTop: '2rem'}}>
                <label style={{marginBottom: '1rem', display: 'block'}}>Export Source</label>
                <button className="clay-btn" style={{width: '100%', justifyContent: 'center'}} onClick={handleLatexExport}>
                  <FileText size={18} style={{marginRight: '8px', color: 'var(--accent-color)'}} /> Generate LaTeX
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const { currentView } = useStore();
  return (
    <>
      <Toaster position="top-right" 
        toastOptions={{
          style: {
            background: '#f1f5f9',
            color: '#1e293b',
            boxShadow: '10px 10px 20px rgba(163, 177, 198, 0.4), -10px -10px 20px rgba(255, 255, 255, 1)',
            borderRadius: '16px',
            fontWeight: 600
          },
        }}
      />
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'wizard' && <Wizard />}
      {currentView === 'workspace' && <Workspace />}
    </>
  );
}

export default App;
