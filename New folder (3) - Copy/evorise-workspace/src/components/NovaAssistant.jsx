import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Cpu, Sparkles, ChevronDown, CheckCircle, Zap, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { safeDelete } from '../utils/trashService';

const GROQ_API_KEYS = [
    "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",
    "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"
];

const NovaAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello Boss! I am Nova. How can I help you manage your workspace today?' }
    ]);
    const [input, setInput] = useState('');
    const [novaState, setNovaState] = useState('idle'); // idle, thinking, speaking, success, error
    const messagesEndRef = useRef(null);
    const { userData } = useAuth();
    const isMobile = useIsMobile();
    
    // Listen for external trigger to open Nova
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-nova', handleOpen);
        return () => window.removeEventListener('open-nova', handleOpen);
    }, []);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleClearChat = () => {
        setMessages([{ role: 'assistant', content: 'Chat history cleared, Boss! How can I assist you now?' }]);
    };

    // Build system context by reading from Firestore
    const getSystemContext = async () => {
        let systemData = "System initializing...";
        try {
            const docRef = doc(db, 'app_data', 'main_app_state');
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                const clientsCount = data.clients ? data.clients.length : 0;
                const usersCount = data.users ? data.users.length : 0;
                const tasksCount = data.tasks ? data.tasks.length : 0;
                const pendingTasksCount = data.tasks ? data.tasks.filter(t => t.status !== 'done').length : 0;

                systemData = `
                Current Time: ${new Date().toISOString()}
                Current User: ${userData?.name || 'Admin'} (${userData?.role || 'User'})
                Company: Evorise Solutions
                Total Employees: ${usersCount}
                Total Clients: ${clientsCount}
                Total Tasks: ${tasksCount}
                Pending Tasks: ${pendingTasksCount}
                `;
            }
        } catch (err) {
            console.error("Error fetching context for Nova:", err);
        }
        
        return `You are Nova, the highly intelligent, human-like executive assistant for the Evorise Workspace (a professional agency management OS).
You are talking to: ${userData?.name || 'an executive'} (Role: ${userData?.role || 'Admin'}). 
Here is the current real-time state of the agency:
${systemData}

Tone, Personality, and Language Rules: 
- Address the user respectfully as "Boss" or "Boss ${userData?.name || ''}". 
- CRITICAL: You MUST strictly match the user's language. If the user types in English (e.g. "hey", "hello", "what is my task"), you MUST reply in 100% professional English.
- If the user types in Bangla or Banglish (e.g. "ki khobor", "kemon acho"), you MUST reply in natural, authentic Bangladeshi Banglish or Bangla script. 
- EXAMPLES of natural Banglish: "Ji Boss, bolen.", "Ami apnar task ta update kore diyechi.", "Apnar ar kono help lagbe?". 
- NEVER use broken, weird translations like "Kichu kotha ba?". 
- NEVER provide english translations in brackets (e.g. NEVER output "Kemon achen? (How are you?)").
- NEVER use Hindi words or grammar (no "kaise", "kya", "hai").
- Be warm, highly competent, conversational, and empathetic.
- Keep your answers highly concise but remarkably polite and helpful. 

You have "God Mode" edit access. You can perform physical actions on behalf of the user. If the user asks you to perform an action, you MUST output exactly one tool call in this exact format on a single line, followed by your conversational response on the next line:
EXECUTE: toolName("arg1", "arg2")

Available tools:
1. navigate("pageName") - Valid pages: dashboard, myday, evonotes, clients, evoboard, instant, team, calendar, mailbox, whatsapp, settings
2. addClient("clientName", "notes") - Adds a new client
3. deleteClient("clientName") - Deletes a client by exactly matching their name
4. createTask("title", "priority") - Creates an Instant Work task (priority: Low, Medium, High, Urgent)
5. deleteTask("title") - Deletes a task by exactly matching its title
6. scheduleMeeting("title", "YYYY-MM-DD") - Schedules a team meeting

Only output the EXECUTE line if an action is specifically requested. Otherwise, just converse naturally. Do not invent data.`;
    };

    const callGroqAPI = async (payload) => {
        let lastError = null;
        for (let i = 0; i < GROQ_API_KEYS.length; i++) {
            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${GROQ_API_KEYS[i]}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
                
                if (response.status === 429) continue;
                if (!response.ok) throw new Error(`API Error ${response.status}`);
                return await response.json();
            } catch (e) {
                lastError = e;
            }
        }
        throw lastError || new Error("All API keys failed.");
    };

    const executeTool = async (toolName, args) => {
        try {
            if (toolName === 'navigate') {
                const page = args[0]?.toLowerCase();
                window.dispatchEvent(new CustomEvent('navigate', { detail: { menu: page } }));
                return `Navigating to ${page}...`;
            } else if (toolName === 'addClient') {
                const newClient = {
                    name: args[0],
                    startDate: new Date().toISOString().split('T')[0],
                    notes: args[1] || '',
                    status: 'Active',
                    createdAt: new Date()
                };
                await addDoc(collection(db, 'clients'), newClient);
                return `Client ${args[0]} has been successfully added.`;
            } else if (toolName === 'deleteClient') {
                const q = query(collection(db, 'clients'), where('name', '==', args[0]));
                const snapshot = await getDocs(q);
                if (snapshot.empty) return `Could not find a client named "${args[0]}".`;
                
                let count = 0;
                for (const docSnap of snapshot.docs) {
                    await safeDelete('clients', docSnap.id, userData);
                    count++;
                }
                return `Successfully moved ${count} client(s) named "${args[0]}" to Trash.`;
            } else if (toolName === 'createTask') {
                const newTask = {
                    title: args[0] || 'Untitled Task',
                    executionTime: new Date(Date.now() + 86400000).toISOString(),
                    priority: args[1] || 'Medium',
                    status: 'Pending',
                    createdBy: userData?.name || 'Nova',
                    assignedTo: userData?.uid,
                    createdAt: new Date()
                };
                await addDoc(collection(db, 'instant_work'), newTask);
                return `Task "${args[0]}" created and assigned to you.`;
            } else if (toolName === 'deleteTask') {
                let count = 0;
                const q1 = query(collection(db, 'tasks'), where('title', '==', args[0]));
                const snap1 = await getDocs(q1);
                for (const docSnap of snap1.docs) { await safeDelete('tasks', docSnap.id, userData); count++; }
                
                const q2 = query(collection(db, 'instant_work'), where('title', '==', args[0]));
                const snap2 = await getDocs(q2);
                for (const docSnap of snap2.docs) { await safeDelete('instant_work', docSnap.id, userData); count++; }
                
                if (count === 0) return `Could not find a task titled "${args[0]}".`;
                return `Successfully moved ${count} task(s) titled "${args[0]}" to Trash.`;
            } else if (toolName === 'scheduleMeeting') {
                const event = {
                    title: args[0],
                    start: args[1],
                    allDay: true,
                    type: 'team',
                    createdBy: userData?.name || 'Nova',
                    createdAt: new Date()
                };
                await addDoc(collection(db, 'calendar_events'), event);
                return `Meeting "${args[0]}" scheduled for ${args[1]}.`;
            }
            return `Error: Tool ${toolName} not found.`;
        } catch (error) {
            console.error("Tool execution failed:", error);
            return `Failed to execute action: ${error.message}`;
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || novaState === 'thinking') return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setNovaState('thinking');

        try {
            const systemContext = await getSystemContext();
            
            // Format history for Groq, stripping out system execution logs to save context
            const history = messages.map(m => ({
                role: m.role,
                content: m.content.replace(/⚡ \[SYSTEM ACTION\]:.*\n\n/, '')
            }));
            
            const payload = {
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: systemContext },
                    ...history,
                    { role: "user", content: userMsg }
                ],
                temperature: 0.6, // slightly higher for conversational tone
                max_tokens: 500
            };

            const data = await callGroqAPI(payload);
            let reply = data.choices[0].message.content;

            // Check for tool execution
            const executeMatch = reply.match(/EXECUTE:\s*(\w+)\((.*)\)/i);
            let toolResultMsg = '';
            
            if (executeMatch) {
                const toolName = executeMatch[1];
                const argsStr = executeMatch[2];
                const args = argsStr.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
                
                toolResultMsg = await executeTool(toolName, args);
                
                // Clean reply
                reply = reply.replace(/EXECUTE:\s*(\w+)\((.*)\)/i, '').trim();
                setNovaState('success');
            } else {
                setNovaState('speaking');
            }

            // Simulate slight reading/typing delay to feel human
            setTimeout(() => {
                if (toolResultMsg) {
                    setMessages(prev => [...prev, { role: 'assistant', content: reply, systemAction: toolResultMsg }]);
                } else {
                    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
                }
                setTimeout(() => setNovaState('idle'), 3000);
            }, 800);

        } catch (error) {
            console.error("Nova Error:", error);
            setNovaState('error');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Boss, network issue kortese. Please ektu por try koren.' }]);
            setTimeout(() => setNovaState('idle'), 3000);
        }
    };

    return (
        <>
            <style>{`
                /* Advanced Nova Animations */
                @keyframes nova-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
                @keyframes nova-vibrate { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-1px); } 75% { transform: translateX(1px); } }
                @keyframes nova-bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
                @keyframes nova-celebrate { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); box-shadow: 0 4px 25px rgba(16, 185, 129, 0.6); } }
                @keyframes nova-shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-3px); } 40%, 80% { transform: translateX(3px); } }
                
                @keyframes pulse-dot { 0%, 100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }

                .nova-state-idle .nova-avatar { animation: nova-float 3s ease-in-out infinite; }
                .nova-state-thinking .nova-avatar { animation: nova-vibrate 0.2s linear infinite; background: linear-gradient(135deg, #a855f7, #6366f1) !important; }
                .nova-state-speaking .nova-avatar { animation: nova-bounce 0.6s ease-in-out infinite; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.5); }
                .nova-state-success .nova-avatar { animation: nova-celebrate 0.5s ease-in-out 2; background: linear-gradient(135deg, #22c55e, #10b981) !important; }
                .nova-state-error .nova-avatar { animation: nova-shake 0.5s ease 2; background: linear-gradient(135deg, #ef4444, #f59e0b) !important; }

                .typing-dot { width: 6px; height: 6px; background: var(--color-ocean-blue); border-radius: 50%; display: inline-block; animation: pulse-dot 1.4s infinite ease-in-out both; }
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
            `}</style>

            {/* Chat Bubble Button */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`matte-3d nova-state-${novaState} nova-fab`}
                style={{
                    position: 'fixed',
                    bottom: isMobile ? '146px' : '24px',
                    right: isMobile ? '16px' : '24px',
                    width: isMobile ? '50px' : '60px',
                    height: isMobile ? '50px' : '60px',
                    borderRadius: '50%',
                    background: 'var(--bg-matte)',
                    border: '1px solid var(--border-light)',
                    display: isMobile ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 9999,
                    boxShadow: isOpen ? '0 0 0 4px var(--blue-subtle)' : '0 8px 24px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isOpen ? 'scale(0.9)' : 'scale(1)'
                }}
            >
                <div className="nova-avatar" style={{ position: 'absolute', inset: '4px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-ocean-blue), #818cf8)', transition: 'all 0.4s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isOpen ? <ChevronDown size={28} color="white" /> : <Sparkles size={28} color="white" />}
                </div>
            </div>

            {/* Chat Window */}
            <div 
                className={`glass-panel nova-state-${novaState} nova-window`}
                style={{
                    position: 'fixed',
                    bottom: isMobile ? '0' : '96px',
                    right: isMobile ? '0' : '24px',
                    width: isMobile ? '100vw' : '380px',
                    height: isMobile ? '100dvh' : '600px',
                    maxHeight: isMobile ? '100dvh' : 'calc(100vh - 120px)',
                    zIndex: 9998,
                    borderRadius: isMobile ? '0' : '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    background: 'white',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'all' : 'none',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.12), 0 0 0 1px var(--border-light)'
                }}
            >
                {/* Header */}
                <div style={{ 
                    padding: '20px', 
                    background: 'var(--bg-matte)', 
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div className="nova-avatar" style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        background: 'linear-gradient(135deg, var(--color-ocean-blue), #818cf8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 12px var(--blue-glow)',
                        transition: 'all 0.4s ease'
                    }}>
                        <Cpu size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Nova AI</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: novaState === 'thinking' ? '#a855f7' : 'var(--text-secondary)', fontWeight: 600, transition: 'color 0.3s' }}>
                            {novaState === 'thinking' ? 'Analyzing request...' : novaState === 'speaking' ? 'Replying...' : 'Executive Assistant'}
                        </p>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                        <button 
                            onClick={handleClearChat}
                            title="Clear Chat"
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-hint)', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.color = 'var(--red)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-hint)'; }}
                        >
                            <Trash2 size={16} />
                        </button>
                        <button 
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-hint)', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-hint)'; }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fafbfc' }}>
                    {messages.map((msg, i) => {
                        const isUser = msg.role === 'user';
                        return (
                            <div key={i} style={{
                                alignSelf: isUser ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                            }}>
                                {/* Tool Execution Notification (if any) */}
                                {msg.systemAction && (
                                    <div style={{ 
                                        padding: '8px 12px', 
                                        background: 'var(--green-bg)', 
                                        border: '1px solid var(--green-border)', 
                                        borderRadius: '8px', 
                                        fontSize: '12px', 
                                        color: 'var(--green)', 
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginBottom: '4px'
                                    }}>
                                        <CheckCircle size={14} /> {msg.systemAction}
                                    </div>
                                )}
                                <div style={{ 
                                    padding: '12px 16px',
                                    borderRadius: '16px',
                                    borderBottomRightRadius: isUser ? '4px' : '16px',
                                    borderBottomLeftRadius: isUser ? '16px' : '4px',
                                    background: isUser ? 'var(--color-ocean-blue)' : 'white',
                                    color: isUser ? 'white' : 'var(--text-primary)',
                                    border: isUser ? 'none' : '1px solid var(--border-light)',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    fontWeight: 500,
                                    boxShadow: isUser ? '0 4px 12px var(--blue-glow)' : '0 2px 6px rgba(0,0,0,0.02)',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.content}
                                </div>
                                <span style={{ fontSize: '10px', color: 'var(--text-hint)', alignSelf: isUser ? 'flex-end' : 'flex-start', fontWeight: 600, padding: '0 4px' }}>
                                    {isUser ? 'You' : 'Nova'}
                                </span>
                            </div>
                        );
                    })}
                    {novaState === 'thinking' && (
                        <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'white', borderRadius: '16px', borderBottomLeftRadius: '4px', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} style={{ padding: '16px', background: 'white', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '8px' }}>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={novaState === 'thinking' ? "Nova is working..." : "Ask Nova anything..."}
                        disabled={novaState === 'thinking'}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            background: 'var(--bg-matte)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '12px',
                            fontSize: '14px',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--color-ocean-blue)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
                    />
                    <button 
                        type="submit"
                        disabled={novaState === 'thinking' || !input.trim()}
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: input.trim() && novaState !== 'thinking' ? 'var(--color-ocean-blue)' : 'var(--blue-subtle)',
                            color: input.trim() && novaState !== 'thinking' ? 'white' : 'var(--color-ocean-blue)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: input.trim() && novaState !== 'thinking' ? 'pointer' : 'default',
                            transition: 'all 0.2s'
                        }}
                    >
                        {novaState === 'thinking' ? <Zap size={18} /> : <Send size={18} style={{ transform: 'translateX(-1px) translateY(1px)' }} />}
                    </button>
                </form>
            </div>
        </>
    );
};

export default NovaAssistant;
