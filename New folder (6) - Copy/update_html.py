import sys; sys.stdout.reconfigure(encoding='utf-8');
path = 'g:/Download Official/New folder (6)/EvoRise Document Generator - EvoRise Solutions.html'
with open(path, encoding='utf-8', errors='ignore') as f:
    c = f.read()

import re

# 1. Remove old ai-fab
c = re.sub(r'<button id="ai-fab"[^>]*>.*?</button>', '', c)

# 2. Add AI History Modal HTML before AI Comment Modal
history_modal_html = '''
    <!-- AI History Modal -->
    <div id="ai-history-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:100000; align-items:center; justify-content:center; font-family:'Inter', sans-serif;">
        <div style="background:white; border-radius:12px; width:700px; max-width:95%; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); overflow:hidden;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:20px; border-bottom:1px solid #e2e8f0; background:#f8fafc; flex-shrink:0;">
                <h3 style="margin:0; font-size:1.1rem; color:#1e293b; display:flex; align-items:center; gap:8px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> AI Change History</h3>
                <button onclick="document.getElementById('ai-history-modal').style.display='none'" style="background:transparent; border:none; font-size:1.5rem; cursor:pointer; color:#64748b; line-height:1;">&times;</button>
            </div>
            <div id="ai-history-list" style="padding:20px; overflow-y:auto; flex:1; background:#f1f5f9; display:flex; flex-direction:column; gap:12px;">
                <!-- History Items go here -->
            </div>
        </div>
    </div>
'''
c = c.replace('<!-- AI Comment Modal -->', history_modal_html + '\n    <!-- AI Comment Modal -->')

# 3. Add AI History logic JS
history_js = '''
        function openAIHistoryModal() {
            const list = document.getElementById('ai-history-list');
            list.innerHTML = '';
            if (globalUndoStack.length === 0) {
                list.innerHTML = '<div style="text-align:center; color:#64748b; padding:40px;">No AI changes made yet.</div>';
            } else {
                [...globalUndoStack].reverse().forEach((action, index) => {
                    const realIndex = globalUndoStack.length - 1 - index;
                    const el = document.createElement('div');
                    el.style = "background:white; border-radius:8px; padding:16px; border:1px solid #cbd5e1; box-shadow:0 2px 8px rgba(0,0,0,0.04); flex-shrink:0;";
                    el.innerHTML = `
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <span style="font-weight:700; color:#1e293b; font-size:0.9rem;">${action.instruction || 'AI Edit'}</span>
                            <span style="font-size:0.75rem; color:#94a3b8;">${action.timestamp || ''}</span>
                        </div>
                        <div style="font-size:0.8rem; color:#64748b; margin-bottom:12px; display:flex; gap:10px;">
                            <span style="background:#f1f5f9; padding:2px 8px; border-radius:12px;">Target: ${action.isEditor ? 'Editor' : 'Input Field'}</span>
                            <span style="background:#f1f5f9; padding:2px 8px; border-radius:12px;">World: ${action.world}</span>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                            <div style="background:#fef2f2; border:1px solid #fecaca; padding:8px; border-radius:6px; font-size:0.75rem; max-height:100px; overflow-y:auto; color:#991b1b; white-space:pre-wrap; word-break:break-all;">
                                <strong style="display:block; margin-bottom:4px;">Before:</strong>${escapeHTML((action.oldValue||'').substring(0, 200))}${(action.oldValue||'').length > 200 ? '...' : ''}
                            </div>
                            <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:8px; border-radius:6px; font-size:0.75rem; max-height:100px; overflow-y:auto; color:#166534; white-space:pre-wrap; word-break:break-all;">
                                <strong style="display:block; margin-bottom:4px;">After:</strong>${escapeHTML((action.newValue||'').substring(0, 200))}${(action.newValue||'').length > 200 ? '...' : ''}
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <button onclick="undoSpecificAI(${realIndex})" style="background:linear-gradient(135deg, #ef4444, #dc2626); color:white; border:none; padding:6px 14px; border-radius:6px; font-size:0.75rem; font-weight:600; cursor:pointer;">Undo This Change</button>
                        </div>
                    `;
                    list.appendChild(el);
                });
            }
            document.getElementById('ai-history-modal').style.display = 'flex';
        }

        function escapeHTML(str) {
            return (str||'').replace(/[&<>'"]/g, tag => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
            }[tag] || tag));
        }

        function undoSpecificAI(index) {
            const action = globalUndoStack[index];
            if (!action) return;
            
            if (action.isEditor) {
                if (action.world === 'proposal') {
                    sunEditorProposal.setContents(action.oldValue);
                } else {
                    sunEditorAgreement.setContents(action.oldValue);
                }
            } else {
                action.element.value = action.oldValue;
                action.element.innerText = action.oldValue;
                action.element.dispatchEvent(new Event('input', { bubbles: true }));
                triggerAutoPreview();
            }
            globalUndoStack.splice(index, 1);
            alert("Change undone successfully!");
            openAIHistoryModal();
        }
'''
c = c.replace('function undoGlobalAI() {', history_js + '\n        function undoGlobalAI() {')

# 4. Modify executeAIComment pushing to include newValue, timestamp and instruction
execute_comment = '''let newValue;
                if (isEditor) {
                    let editor = currentWorld === 'proposal' ? sunEditorProposal : sunEditorAgreement;
                    if (aiTargetSelection && aiTargetRange) {
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(aiTargetRange);
                        editor.insertHTML(aiResult, true, true);
                    } else {
                        editor.setContents(aiResult);
                    }
                    newValue = editor.getContents();
                } else {
                    if (aiTargetSelection) {
                        newValue = originalContent.replace(aiTargetSelection, aiResult);
                    } else {
                        newValue = aiResult;
                    }
                    aiTargetElement.value = newValue;
                    aiTargetElement.innerText = newValue;
                    aiTargetElement.dispatchEvent(new Event('input', { bubbles: true }));
                }

                globalUndoStack.push({
                    element: aiTargetElement,
                    isEditor: isEditor,
                    world: currentWorld,
                    oldValue: originalContent,
                    newValue: newValue,
                    instruction: instruction,
                    timestamp: new Date().toLocaleTimeString()
                });'''
# Replacing the block inside executeAIComment
old_block = '''if (isEditor) {
                    let editor = currentWorld === 'proposal' ? sunEditorProposal : sunEditorAgreement;
                    if (aiTargetSelection && aiTargetRange) {
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(aiTargetRange);
                        editor.insertHTML(aiResult, true, true);
                    } else {
                        editor.setContents(aiResult);
                    }
                } else {
                    if (aiTargetSelection) {
                        aiTargetElement.value = originalContent.replace(aiTargetSelection, aiResult);
                        aiTargetElement.innerText = originalContent.replace(aiTargetSelection, aiResult);
                    } else {
                        aiTargetElement.value = aiResult;
                        aiTargetElement.innerText = aiResult;
                    }
                    aiTargetElement.dispatchEvent(new Event('input', { bubbles: true }));
                }'''

c = c.replace(old_block, execute_comment)

# Find and replace the globalUndoStack push that was before this block
old_push = '''globalUndoStack.push({
                    element: aiTargetElement,
                    isEditor: isEditor,
                    world: currentWorld,
                    oldValue: originalContent
                });
                document.getElementById('btn-undo-global-ai').style.display = 'block';'''
c = c.replace(old_push, "document.getElementById('btn-undo-global-ai').style.display = 'block';")

# 5. Fix the ai-context-menu HTML to add history button and AI chat button
old_menu = '''<button onclick="openAITransformModal()" style="width:100%; text-align:left; padding:10px; background:transparent; border:none; border-radius:6px; cursor:pointer; font-size:0.85rem; color:#1e293b; display:flex; align-items:center; gap:8px; font-weight:500; transition:background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            Transform Document
        </button>'''
new_menu = old_menu + '''
        <button onclick="toggleAIPanel(); document.getElementById('ai-context-menu').style.display='none'" style="width:100%; text-align:left; padding:10px; background:transparent; border:none; border-radius:6px; cursor:pointer; font-size:0.85rem; color:#1e293b; display:flex; align-items:center; gap:8px; font-weight:500; transition:background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Open AI Chat Assistant
        </button>
        <button onclick="openAIHistoryModal(); document.getElementById('ai-context-menu').style.display='none'" style="width:100%; text-align:left; padding:10px; background:transparent; border:none; border-radius:6px; cursor:pointer; font-size:0.85rem; color:#1e293b; display:flex; align-items:center; gap:8px; font-weight:500; transition:background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            View AI History
        </button>'''
c = c.replace(old_menu, new_menu)

# 6. Fix the floating button click issue by using a dedicated click event listener and removing the inline ones from dragEnd
# Replacing dragEnd and dragStart logic to handle clicks correctly.
c = c.replace('''if (!isDragging) {
                    // It was a click!
                    const rect = btn.getBoundingClientRect();
                    menu.style.display = 'block';
                    
                    let left = rect.left - 180;
                    let top = rect.top - 50;
                    if (left < 0) left = rect.right + 10;
                    if (top < 0) top = 10;
                    
                    menu.style.left = left + 'px';
                    menu.style.top = top + 'px';
                    
                    // For floating button click, don't set a specific target element 
                    // so AI applies to the active editor or document globally
                    if (!aiTargetElement || !aiTargetElement.closest) {
                        aiTargetElement = document.querySelector(currentWorld === 'proposal' ? '#proposal-editor-section .se-wrapper-inner' : '#agreement-editor-section .se-wrapper-inner');
                        aiTargetSelection = "";
                    }
                }''', '')

new_click_event = '''
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.isDraggingAIBtn) return;
                const rect = btn.getBoundingClientRect();
                menu.style.display = 'block';
                
                let left = rect.left - 180;
                let top = rect.top - 120;
                if (left < 0) left = rect.right + 10;
                if (top < 0) top = 10;
                
                menu.style.left = left + 'px';
                menu.style.top = top + 'px';
                
                if (!aiTargetElement || !aiTargetElement.closest) {
                    aiTargetElement = document.querySelector(currentWorld === 'proposal' ? '#proposal-editor-section .se-wrapper-inner' : '#agreement-editor-section .se-wrapper-inner');
                    aiTargetSelection = "";
                }
            });
'''
c = c.replace('btn.addEventListener(\'touchstart\', dragStart, {passive: true});', 'btn.addEventListener(\'touchstart\', dragStart, {passive: true});\n' + new_click_event)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Script execution completed successfully!')
