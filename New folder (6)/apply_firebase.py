import codecs
import re

path = 'g:/Download Official/New folder (6)/EvoRise Document Generator - EvoRise Solutions.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Add Firebase scripts to <head>
firebase_scripts = """    <!-- Firebase App (the core Firebase SDK) is always required and must be listed first -->
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics-compat.js"></script>
"""
if "firebase-app-compat" not in content:
    content = content.replace("</head>", firebase_scripts + "</head>")

# 2. Replace Drafts UI
drafts_ui_old = """                    <!-- NEW: Draft Management -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;" bis_skin_checked="1">
                        <div style="font-size: 0.85rem; color: #475569; font-weight: 600;">💾 Saved Drafts</div>
                        <div style="display: flex; gap: 8px; flex-grow: 1; max-width: 400px;">
                            <select id="draft-select" class="form-control" style="flex-grow: 1; padding: 6px; font-size: 0.8rem; height: auto;">
                                <option value="">-- Select a saved draft --</option>
                            </select>
                            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="loadNamedDraft()">Load</button>
                            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem; color: #dc2626; border-color: #fca5a5;" onclick="deleteNamedDraft()">Delete</button>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <input type="text" id="draft-name" placeholder="Draft name..." class="form-control" style="width: 140px; padding: 6px; font-size: 0.8rem; height: auto;">
                            <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="saveNamedDraft()">Save Draft</button>
                        </div>
                    </div>"""

drafts_ui_new = """                    <!-- NEW: Firebase Cloud Drafts Management -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                        <div style="font-size: 0.85rem; color: #475569; font-weight: 600;">☁️ Cloud Drafts</div>
                        
                        <div style="display: flex; gap: 8px;">
                            <input type="text" id="draft-name" placeholder="Enter draft name..." class="form-control" style="width: 180px; padding: 6px; font-size: 0.8rem; height: auto;">
                            <button id="btn-save-draft" class="btn btn-primary" style="padding: 6px 16px; font-size: 0.75rem; background: linear-gradient(135deg, #10b981, #059669);" onclick="saveNamedDraft()">Save to Cloud</button>
                            <button class="btn btn-secondary" style="padding: 6px 16px; font-size: 0.75rem;" onclick="document.getElementById('firebase-drafts-modal').style.display='flex'; loadCloudDrafts();">Browse Cloud Drafts</button>
                        </div>
                    </div>"""

if "💾 Saved Drafts" in content:
    # We will use re to safely replace
    content = re.sub(r'<!-- NEW: Draft Management -->.*?Save Draft</button>\s*</div>\s*</div>', drafts_ui_new, content, flags=re.DOTALL)


# 3. Add modal to end of body
modal_html = """
    <!-- Firebase Drafts Dashboard Modal -->
    <div id="firebase-drafts-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:99999; align-items:center; justify-content:center;">
        <div style="background:white; border-radius:12px; width:800px; max-width:90%; height:80vh; max-height:80vh; display:flex; flex-direction:column; overflow:hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
            <div style="padding:16px 24px; background:linear-gradient(135deg, #4f46e5, #6366f1); color:white; display:flex; justify-content:space-between; align-items:center;">
                <h2 style="margin:0; font-size:1.2rem; display:flex; align-items:center; gap:8px;">☁️ Cloud Drafts Dashboard</h2>
                <button onclick="document.getElementById('firebase-drafts-modal').style.display='none'" style="background:transparent; border:none; color:white; font-size:1.5rem; cursor:pointer; padding:0;">&times;</button>
            </div>
            <div style="padding:16px 24px; border-bottom:1px solid #e2e8f0; display:flex; gap:10px; background:#f8fafc;">
                <input type="text" id="draft-search" placeholder="Search drafts by name..." class="form-control" style="flex-grow:1; font-size:0.95rem; padding:10px;" onkeyup="renderDraftsList()">
                <button class="btn btn-secondary" onclick="loadCloudDrafts()" style="padding:10px 20px;">Refresh</button>
            </div>
            <div style="padding:24px; overflow-y:auto; flex-grow:1;" id="drafts-list-container">
                <!-- Drafts injected here -->
                <div style="text-align:center; padding:40px; color:#64748b;">Loading drafts...</div>
            </div>
        </div>
    </div>
"""
if "firebase-drafts-modal" not in content:
    content = content.replace("</body>", modal_html + "\n</body>")


# 4. Replace JS functions
js_old = """        // --- DRAFT MANAGEMENT ---
        function updateDraftDropdown() {
            const select = document.getElementById('draft-select');
            if (!select) return;
            const savedDrafts = JSON.parse(localStorage.getItem('evoriseDrafts') || '{}');
            select.innerHTML = '<option value="">-- Select a saved draft --</option>';
            Object.keys(savedDrafts).forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                select.appendChild(opt);
            });
        }

        function saveNamedDraft() {
            const name = document.getElementById('draft-name').value.trim();
            if (!name) return alert("Please enter a draft name.");
            
            const state = JSON.parse(localStorage.getItem('evoriseDocumentState') || '{}');
            const savedDrafts = JSON.parse(localStorage.getItem('evoriseDrafts') || '{}');
            savedDrafts[name] = state;
            localStorage.setItem('evoriseDrafts', JSON.stringify(savedDrafts));
            updateDraftDropdown();
            document.getElementById('draft-select').value = name;
            alert(`Draft '${name}' saved successfully!`);
        }

        function loadNamedDraft() {
            const name = document.getElementById('draft-select').value;
            if (!name) return alert("Please select a draft to load.");
            
            const savedDrafts = JSON.parse(localStorage.getItem('evoriseDrafts') || '{}');
            if (savedDrafts[name]) {
                localStorage.setItem('evoriseDocumentState', JSON.stringify(savedDrafts[name]));
                loadDocumentState();
                alert(`Draft '${name}' loaded!`);
            }
        }
        
        function deleteNamedDraft() {
            const name = document.getElementById('draft-select').value;
            if (!name) return alert("Please select a draft to delete.");
            
            if (confirm(`Are you sure you want to delete draft '${name}'?`)) {
                const savedDrafts = JSON.parse(localStorage.getItem('evoriseDrafts') || '{}');
                delete savedDrafts[name];
                localStorage.setItem('evoriseDrafts', JSON.stringify(savedDrafts));
                updateDraftDropdown();
            }
        }"""

js_new = """        // --- FIREBASE & CLOUD DRAFT MANAGEMENT ---
        const firebaseConfig = {
            apiKey: "AIzaSyBR-Ve4HbryTvPoe39ruTWf5G4Zzh1dDBU",
            authDomain: "evorise-client-notificat-4731e.firebaseapp.com",
            projectId: "evorise-client-notificat-4731e",
            storageBucket: "evorise-client-notificat-4731e.firebasestorage.app",
            messagingSenderId: "36069190125",
            appId: "1:36069190125:web:b7339d0962f2f4a1b95fe4",
            measurementId: "G-YP4RFH3CB8"
        };
        
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.firestore();
        
        let allCloudDrafts = [];
        
        async function loadCloudDrafts() {
            document.getElementById('drafts-list-container').innerHTML = '<div style="text-align:center; padding:40px; color:#64748b;">Loading drafts from Cloud...</div>';
            try {
                const snapshot = await db.collection("drafts").orderBy("updatedAt", "desc").get();
                allCloudDrafts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderDraftsList();
            } catch (e) {
                console.error("Error loading drafts from Firestore", e);
                document.getElementById('drafts-list-container').innerHTML = '<div style="text-align:center; padding:40px; color:#ef4444;">Failed to load drafts. Check console for details.</div>';
            }
        }
        
        function renderDraftsList() {
            const container = document.getElementById('drafts-list-container');
            const search = document.getElementById('draft-search').value.toLowerCase();
            
            container.innerHTML = '';
            const filtered = allCloudDrafts.filter(d => d.name.toLowerCase().includes(search));
            
            if (filtered.length === 0) {
                container.innerHTML = '<div style="text-align:center; color:#64748b; padding:40px;">No drafts found.</div>';
                return;
            }
            
            filtered.forEach(draft => {
                const dateStr = new Date(draft.updatedAt).toLocaleString();
                const div = document.createElement('div');
                div.style = "display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border:1px solid #e2e8f0; border-radius:10px; margin-bottom:12px; background:#ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition:all 0.2s;";
                div.onmouseover = () => div.style.borderColor = '#6366f1';
                div.onmouseout = () => div.style.borderColor = '#e2e8f0';
                
                div.innerHTML = `
                    <div>
                        <div style="font-weight:700; color:#1e293b; font-size:1.1rem; margin-bottom:4px;">${draft.name}</div>
                        <div style="font-size:0.85rem; color:#64748b; display:flex; align-items:center; gap:6px;">
                            <span>🕒</span> Last saved: ${dateStr}
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn btn-primary" style="padding:8px 16px; font-size:0.85rem;" onclick="loadDraftFromCloud('${draft.id}')">Open Draft</button>
                        <button class="btn btn-secondary" style="padding:8px 16px; font-size:0.85rem; color:#ef4444; border-color:#fca5a5;" onclick="deleteDraftFromCloud('${draft.id}')">Delete</button>
                    </div>
                `;
                container.appendChild(div);
            });
        }
        
        async function saveNamedDraft() {
            const name = document.getElementById('draft-name').value.trim();
            if (!name) return alert("Please enter a draft name.");
            
            // Collect the very latest state before saving
            collectData(); 
            if (currentWorld === 'proposal') {
                try {
                    proposalData.editorHtml = sunEditorProposal.getContents(true);
                } catch(e){}
            }
            if (currentWorld === 'agreement') {
                collectAgreementData();
                try {
                    agreementData.editorHtml = sunEditorAgreement.getContents(true);
                } catch(e){}
            }
            saveDocumentState(); // Ensure local storage is also updated as a fallback backup
            
            const state = JSON.parse(localStorage.getItem('evoriseDocumentState') || '{}');
            const btn = document.getElementById('btn-save-draft');
            const oldText = btn.innerText;
            btn.innerText = "Saving to Cloud...";
            btn.disabled = true;
            
            try {
                // Ensure name is safe for doc ID
                const docId = name.replace(/[^a-zA-Z0-9 -_]/g, '');
                if (!docId) throw new Error("Invalid draft name.");
                
                await db.collection("drafts").doc(docId).set({
                    name: name,
                    state: JSON.stringify(state),
                    updatedAt: Date.now()
                });
                alert(`Draft '${name}' successfully saved to Cloud!`);
                document.getElementById('draft-name').value = '';
            } catch (e) {
                console.error("Error saving draft to cloud", e);
                alert("Failed to save draft to cloud.");
            }
            btn.innerText = oldText;
            btn.disabled = false;
        }
        
        function loadDraftFromCloud(id) {
            const draft = allCloudDrafts.find(d => d.id === id);
            if (!draft) return;
            
            localStorage.setItem('evoriseDocumentState', draft.state);
            loadDocumentState();
            document.getElementById('firebase-drafts-modal').style.display = 'none';
            alert(`Draft '${draft.name}' loaded from Cloud!`);
        }
        
        async function deleteDraftFromCloud(id) {
            if (!confirm(`Are you sure you want to permanently delete this draft from the Cloud?`)) return;
            try {
                await db.collection("drafts").doc(id).delete();
                allCloudDrafts = allCloudDrafts.filter(d => d.id !== id);
                renderDraftsList();
            } catch(e) {
                console.error(e);
                alert("Failed to delete draft from Cloud.");
            }
        }
        
        function updateDraftDropdown() {
            // Deprecated - Replaced by Firebase Cloud Dashboard
        }"""

if "function updateDraftDropdown()" in content:
    content = re.sub(r'// --- DRAFT MANAGEMENT ---.*?updateDraftDropdown\(\);\s*\}\s*\}', js_new, content, flags=re.DOTALL)
else:
    print("WARNING: Could not find JS draft functions using Regex.")

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Firebase changes applied successfully.")
