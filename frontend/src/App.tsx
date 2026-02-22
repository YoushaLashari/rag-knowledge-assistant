




import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}
interface Document {
  name: string
  chunks: number
}

/* ═══════════════════════════════════════════════════════════
   ARCTIC FROST CSS — crisp white · ice blue · deep navy
═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

:root {
  /* Arctic Frost Palette */
  --ice-white:   #f0f7ff;
  --frost-1:     #e2eeff;
  --frost-2:     #c8dff7;
  --sky:         #7ab3e0;
  --ocean:       #1e6fb5;
  --navy:        #0a3d73;
  --abyss:       #040e1f;

  /* Functional */
  --bg:          #eef5fd;
  --bg-deep:     #e0ecf8;
  --surface:     rgba(255,255,255,0.85);
  --surface-2:   rgba(255,255,255,0.6);
  --border:      rgba(30,111,181,0.12);
  --border-md:   rgba(30,111,181,0.22);
  --border-str:  rgba(30,111,181,0.4);
  --text:        #0a3d73;
  --text-mid:    #2a6098;
  --text-muted:  rgba(10,61,115,0.45);
  --text-subtle: rgba(10,61,115,0.25);
  --shadow-sm:   0 2px 12px rgba(10,61,115,0.08);
  --shadow-md:   0 6px 28px rgba(10,61,115,0.12);
  --shadow-lg:   0 16px 56px rgba(10,61,115,0.16);
  --glow:        rgba(30,111,181,0.25);
}

html, body, #root { height:100%; overflow:hidden; }
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
}

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width:3px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:linear-gradient(to bottom, var(--ocean), var(--sky)); border-radius:4px; }

/* ── BACKGROUND MESH ── */
.frost-bg {
  position:fixed; inset:0; z-index:0; pointer-events:none;
  background:
    radial-gradient(ellipse 100% 70% at 15% 10%, rgba(122,179,224,0.22) 0%, transparent 55%),
    radial-gradient(ellipse 80% 60% at 85% 90%, rgba(30,111,181,0.14) 0%, transparent 55%),
    radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,223,247,0.3) 0%, transparent 70%),
    linear-gradient(160deg, #eef5fd 0%, #e4effa 40%, #dce9f5 70%, #eef5fd 100%);
}

/* ── GRID ── */
.frost-grid {
  position:fixed; inset:0; z-index:0; pointer-events:none;
  background-image:
    linear-gradient(rgba(30,111,181,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30,111,181,0.05) 1px, transparent 1px);
  background-size:48px 48px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,0,0,0.6) 0%, transparent 80%);
}

/* ── FLOATING ORBS ── */
.orb {
  position:fixed; border-radius:50%;
  pointer-events:none; z-index:0; filter:blur(70px);
}
.orb-1 {
  width:560px; height:420px; top:-160px; left:-80px;
  background:radial-gradient(ellipse, rgba(122,179,224,0.3) 0%, transparent 70%);
  animation:orbA 20s ease-in-out infinite;
}
.orb-2 {
  width:480px; height:480px; bottom:-180px; right:-80px;
  background:radial-gradient(ellipse, rgba(30,111,181,0.18) 0%, transparent 70%);
  animation:orbB 26s ease-in-out infinite;
}
.orb-3 {
  width:300px; height:300px; top:45%; left:55%;
  background:radial-gradient(ellipse, rgba(200,223,247,0.5) 0%, transparent 70%);
  animation:orbC 17s ease-in-out infinite;
}

@keyframes orbA {
  0%,100%{transform:translate(0,0) scale(1);}
  33%{transform:translate(50px,70px) scale(1.07);}
  66%{transform:translate(-30px,30px) scale(0.95);}
}
@keyframes orbB {
  0%,100%{transform:translate(0,0) scale(1);}
  50%{transform:translate(-60px,-50px) scale(1.1);}
}
@keyframes orbC {
  0%,100%{transform:translate(0,0); opacity:0.7;}
  50%{transform:translate(40px,-30px); opacity:1;}
}

/* ── GLASS CARD ── */
.glass {
  background: var(--surface);
  backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid var(--border);
}
.glass-deep {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--border-md);
}

/* ── 3D LOGIN REVEAL ── */
@keyframes cardReveal {
  from {
    opacity:0;
    transform: perspective(900px) rotateX(14deg) rotateY(-5deg) translateY(48px) scale(0.93);
    box-shadow: 0 0 0 rgba(10,61,115,0);
  }
  to {
    opacity:1;
    transform: perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1);
    box-shadow: var(--shadow-lg);
  }
}
.login-3d {
  animation: cardReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.22,1,0.36,1), box-shadow 0.6s ease;
}
.login-3d:hover {
  transform: perspective(900px) rotateX(-2deg) rotateY(2.5deg) translateZ(16px);
  box-shadow: -10px 24px 64px rgba(10,61,115,0.2), var(--shadow-lg);
}

/* ── SHIMMER LINE ── */
@keyframes shimLine {
  0%{background-position:-200% center;}
  100%{background-position:200% center;}
}
.shim-line {
  background: linear-gradient(90deg, transparent, rgba(30,111,181,0.4), rgba(122,179,224,0.6), rgba(30,111,181,0.4), transparent);
  background-size: 200% auto;
  animation: shimLine 3s linear infinite;
}

/* ── BRAND TEXT ── */
@keyframes brandShim {
  0%{background-position:-300% center;}
  100%{background-position:300% center;}
}
.brand-text {
  background: linear-gradient(90deg, #0a3d73 0%, #1e6fb5 30%, #7ab3e0 55%, #1e6fb5 75%, #0a3d73 100%);
  background-size:300% auto;
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  background-clip:text;
  animation: brandShim 5s linear infinite;
}

/* ── INPUTS ── */
.frost-input {
  background: rgba(255,255,255,0.7);
  border: 1.5px solid var(--border-md);
  outline:none; transition:all 0.3s ease;
  caret-color: var(--ocean);
  font-family:'Plus Jakarta Sans',sans-serif;
  color: var(--text);
}
.frost-input:focus {
  border-color: var(--ocean);
  background: rgba(255,255,255,0.95);
  box-shadow: 0 0 0 4px rgba(30,111,181,0.1), var(--shadow-sm);
}
.frost-input::placeholder { color: var(--text-muted); }

/* ── BUTTON ── */
.btn-frost {
  background: linear-gradient(135deg, #1e6fb5 0%, #0a3d73 100%);
  border: none; color:#fff; cursor:pointer; outline:none;
  font-family:'Plus Jakarta Sans',sans-serif; font-weight:700;
  position:relative; overflow:hidden; transition:all 0.3s ease;
  letter-spacing:0.3px;
}
.btn-frost::before {
  content:'';
  position:absolute; inset:0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  opacity:0; transition:opacity 0.3s;
}
.btn-frost::after {
  content:'';
  position:absolute; top:0; left:-100%; width:55%; height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
  transition:left 0.5s ease;
}
.btn-frost:hover:not(:disabled)::before { opacity:1; }
.btn-frost:hover:not(:disabled)::after  { left:140%; }
.btn-frost:hover:not(:disabled) {
  transform:translateY(-2px);
  box-shadow: 0 8px 32px rgba(10,61,115,0.35), 0 0 0 1px rgba(30,111,181,0.3);
}
.btn-frost:active:not(:disabled) { transform:translateY(0); }
.btn-frost:disabled { opacity:0.35; cursor:not-allowed; }

/* ── LOGO PULSE ── */
@keyframes logoPulse {
  0%,100%{ box-shadow:0 0 0 0 rgba(30,111,181,0.35), var(--shadow-md); }
  50%    { box-shadow:0 0 0 12px rgba(30,111,181,0), var(--shadow-md); }
}
.logo-pulse { animation:logoPulse 2.8s ease-in-out infinite; }

/* ── STATUS DOT ── */
@keyframes dotPulse {
  0%,100%{ opacity:1; transform:scale(1); }
  50%    { opacity:0.5; transform:scale(0.7); }
}
.status-dot { animation:dotPulse 2s ease-in-out infinite; }

/* ── MESSAGES ── */
@keyframes msgIn {
  from{opacity:0; transform:translateY(12px) scale(0.98);}
  to{opacity:1; transform:translateY(0) scale(1);}
}
.msg-in { animation:msgIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }

/* ── THINKING ── */
@keyframes thinkDot {
  0%,80%,100%{transform:scale(0.55); opacity:0.25;}
  40%{transform:scale(1.25); opacity:1;}
}
.think { animation:thinkDot 1.4s ease-in-out infinite; }

/* ── UPLOAD ZONE ── */
.upload-zone {
  border: 1.5px dashed var(--border-str);
  cursor:pointer; transition:all 0.3s ease;
  background: rgba(255,255,255,0.4);
}
.upload-zone:hover {
  border-color: var(--ocean);
  background: rgba(30,111,181,0.06) !important;
  box-shadow: 0 0 0 4px rgba(30,111,181,0.06), var(--shadow-sm);
}

/* ── DOC CHIP ── */
.doc-chip { transition:all 0.25s ease; cursor:default; }
.doc-chip:hover {
  border-color: var(--border-str) !important;
  background: rgba(30,111,181,0.06) !important;
  transform:translateX(3px);
  box-shadow: var(--shadow-sm);
}

/* ── SEND BOX ── */
.send-box { transition:all 0.3s ease; }
.send-box:focus-within {
  border-color: rgba(30,111,181,0.45) !important;
  box-shadow: 0 0 0 4px rgba(30,111,181,0.08), var(--shadow-md) !important;
}

/* ── SUGGESTION CHIP ── */
.suggestion-chip {
  background: rgba(255,255,255,0.7);
  border: 1.5px solid var(--border-md);
  transition: all 0.25s ease; cursor:pointer;
}
.suggestion-chip:hover {
  background: rgba(30,111,181,0.08);
  border-color: var(--ocean);
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  color: var(--ocean) !important;
}

/* ── SPIN ── */
@keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
.spin { animation:spin 0.8s linear infinite; }
.spin-slow { animation:spin 9s linear infinite; }
.spin-rev  { animation:spin 13s linear infinite reverse; }

/* ── PARTICLES ── */
@keyframes floatUp {
  0%   {transform:translateY(0) translateX(0); opacity:0;}
  10%  {opacity:0.6;}
  90%  {opacity:0.6;}
  100% {transform:translateY(-100px) translateX(15px); opacity:0;}
}
.particle { position:fixed; border-radius:50%; pointer-events:none; z-index:1; animation:floatUp linear infinite; }

/* ── DIVIDER LINE ── */
.divider {
  height:1px;
  background: linear-gradient(90deg, transparent, var(--border-str), var(--sky), var(--border-str), transparent);
}

/* ── ERROR BOX ── */
.error-box {
  background: rgba(255,60,60,0.06);
  border: 1.5px solid rgba(220,60,60,0.22);
  color: #b91c1c;
}
`

/* ── ICONS ── */
const Icon = {
  Send: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Upload: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  Trash: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  ),
  Doc: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  User: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Lock: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Zap: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Clear: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    </svg>
  ),
  Brain: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="brainG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e6fb5"/>
          <stop offset="100%" stopColor="#7ab3e0"/>
        </linearGradient>
      </defs>
      <path stroke="url(#brainG)" d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
      <path stroke="url(#brainG)" d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  ),
}

/* ── Particles ── */
const PARTICLES = [
  { x:'5%',  y:'72%', s:4, d:14, delay:0,   c:'rgba(30,111,181,0.5)' },
  { x:'20%', y:'88%', s:3, d:10, delay:2,   c:'rgba(122,179,224,0.6)' },
  { x:'38%', y:'80%', s:5, d:16, delay:4,   c:'rgba(30,111,181,0.4)' },
  { x:'60%', y:'92%', s:3, d:11, delay:1,   c:'rgba(122,179,224,0.5)' },
  { x:'77%', y:'78%', s:4, d:13, delay:3,   c:'rgba(30,111,181,0.45)' },
  { x:'90%', y:'86%', s:3, d:9,  delay:5,   c:'rgba(122,179,224,0.55)' },
]
function Particles() {
  return <>{PARTICLES.map((p, i) => (
    <div key={i} className="particle" style={{
      left:p.x, top:p.y, width:p.s, height:p.s,
      background:p.c, boxShadow:`0 0 ${p.s*3}px ${p.c}`,
      animationDuration:`${p.d}s`, animationDelay:`${p.delay}s`,
    }}/>
  ))}</>
}

/* ── Bracket corners (frost style) ── */
function Brackets({ color = 'rgba(30,111,181,0.35)' }: { color?: string }) {
  const b: React.CSSProperties = { position:'absolute', width:14, height:14, borderColor:color, borderStyle:'solid' }
  return <>
    <div style={{...b, top:-1, left:-1,   borderWidth:'2px 0 0 2px'}}/>
    <div style={{...b, top:-1, right:-1,  borderWidth:'2px 2px 0 0'}}/>
    <div style={{...b, bottom:-1, left:-1, borderWidth:'0 0 2px 2px'}}/>
    <div style={{...b, bottom:-1, right:-1, borderWidth:'0 2px 2px 0'}}/>
  </>
}

/* ── Background ── */
function Background() {
  return <>
    <div className="frost-bg"/>
    <div className="frost-grid"/>
    <div className="orb orb-1"/>
    <div className="orb orb-2"/>
    <div className="orb orb-3"/>
    <Particles/>
  </>
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function App() {
  const [isLoggedIn, setIsLoggedIn]     = useState(false)
  const [username, setUsername]         = useState('')
  const [password, setPassword]         = useState('')
  const [loggedInUser, setLoggedInUser] = useState('')
  const [loginError, setLoginError]     = useState('')
  const [messages, setMessages]         = useState<Message[]>([])
  const [question, setQuestion]         = useState('')
  const [documents, setDocuments]       = useState<Document[]>([])
  const [isThinking, setIsThinking]     = useState(false)
  const [isUploading, setIsUploading]   = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/login`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        const d = await res.json()
        setIsLoggedIn(true); setLoggedInUser(d.username)
        setLoginError(''); fetchDocuments()
      } else { setLoginError('Invalid credentials — please try again') }
    } catch { setLoginError('Cannot reach server') }
  }

  const fetchDocuments = async () => {
    try { const r = await fetch(`${API}/documents`); const d = await r.json(); setDocuments(d.documents) } catch {}
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setIsUploading(true)
    const fd = new FormData()
    Array.from(e.target.files).forEach(f => fd.append('files', f))
    await fetch(`${API}/upload`, { method:'POST', body:fd })
    await fetchDocuments(); setIsUploading(false)
  }

  const handleDelete = async (name: string) => {
    await fetch(`${API}/delete`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({doc_name:name}) })
    fetchDocuments()
  }

  const handleClearAll = async () => {
    await fetch(`${API}/clear`, { method:'DELETE' })
    setDocuments([]); setMessages([])
  }

  const handleChat = async () => {
    if (!question.trim() || isThinking) return
    const userMsg: Message = { role:'user', content:question }
    const updated = [...messages, userMsg]
    setMessages(updated); setQuestion(''); setIsThinking(true)
    try {
      const res = await fetch(`${API}/chat`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ question, chat_history: updated.map(m => ({role:m.role, content:m.content})) }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role:'assistant', content:data.answer, sources:data.sources }])
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content:'⚠ Connection error. Please try again.' }])
    }
    setIsThinking(false)
  }

  const SUGGESTIONS = ['What is this document about?', 'Summarize the key findings', 'List the main conclusions']

  /* ══════════════════════════════
     LOGIN
  ══════════════════════════════ */
  if (!isLoggedIn) return (
    <>
      <style>{CSS}</style>
      <Background/>
      <div style={{
        height:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        position:'relative', zIndex:10, padding:20,
      }}>
        <div className="login-3d" style={{ width:'100%', maxWidth:440 }}>
          {/* Outer gradient border */}
          <div style={{
            position:'relative', borderRadius:24, padding:1.5,
            background:'linear-gradient(135deg, rgba(30,111,181,0.5), rgba(122,179,224,0.2), rgba(30,111,181,0.1))',
            boxShadow:'0 32px 80px rgba(10,61,115,0.18), 0 0 0 1px rgba(255,255,255,0.5)',
          }}>
            <div className="glass-deep" style={{ borderRadius:23, padding:'52px 44px', border:'none', position:'relative' }}>
              <Brackets/>

              {/* Status */}
              <div style={{
                position:'absolute', top:18, right:20,
                display:'flex', alignItems:'center', gap:6,
                fontSize:10, fontFamily:"'IBM Plex Mono',monospace",
                color:'var(--text-muted)', letterSpacing:'1px',
              }}>
                <div className="status-dot" style={{ width:7, height:7, borderRadius:'50%', background:'#1e6fb5', boxShadow:'0 0 8px rgba(30,111,181,0.6)' }}/>
                SECURE
              </div>

              {/* Logo */}
              <div style={{ textAlign:'center', marginBottom:40 }}>
                <div className="logo-pulse glass" style={{
                  width:68, height:68, borderRadius:20, margin:'0 auto 18px',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  border:'1.5px solid var(--border-str)',
                  background:'linear-gradient(135deg, rgba(30,111,181,0.12), rgba(122,179,224,0.08))',
                }}>
                  <Icon.Brain size={32}/>
                </div>
                <h1 className="brand-text" style={{
                  fontSize:28, fontWeight:800, letterSpacing:'-0.3px', lineHeight:1,
                }}>
                  RAG Assistant
                </h1>
                <p style={{ color:'var(--text-muted)', fontSize:12, marginTop:7, fontFamily:"'IBM Plex Mono',monospace", letterSpacing:'1.5px' }}>
                  KNOWLEDGE INTELLIGENCE SYSTEM
                </p>
              </div>

              {/* Divider */}
              <div className="divider" style={{ marginBottom:32 }}/>

              {/* Form */}
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { type:'text',     val:username, set:setUsername, ph:'Username', icon:<Icon.User/> },
                  { type:'password', val:password, set:setPassword, ph:'Password', icon:<Icon.Lock/> },
                ].map(({ type, val, set, ph, icon }) => (
                  <div key={ph} style={{ position:'relative' }}>
                    <div style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }}>
                      {icon}
                    </div>
                    <input
                      className="frost-input"
                      type={type} placeholder={ph} value={val}
                      onChange={e => set(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && handleLogin()}
                      style={{ width:'100%', height:52, borderRadius:12, paddingLeft:46, paddingRight:16, fontSize:14 }}
                    />
                  </div>
                ))}

                {loginError && (
                  <div className="error-box" style={{ borderRadius:10, padding:'10px 16px', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
                    ⚠ {loginError}
                  </div>
                )}

                <button className="btn-frost" onClick={handleLogin}
                  style={{ height:52, borderRadius:12, fontSize:15, marginTop:6 }}>
                  Sign In
                </button>
              </div>

              <p style={{ color:'var(--text-subtle)', fontSize:10, textAlign:'center', marginTop:28, fontFamily:"'IBM Plex Mono',monospace", letterSpacing:'1.5px' }}>
                SECURE · PRIVATE · DOCUMENT-GROUNDED
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  /* ══════════════════════════════
     MAIN APP
  ══════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>
      <Background/>

      <div style={{ height:'100vh', display:'flex', flexDirection:'column', position:'relative', zIndex:10, overflow:'hidden' }}>

        {/* ── HEADER ── */}
        <header style={{
          height:60, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px',
          background:'rgba(240,247,255,0.88)', backdropFilter:'blur(24px)',
          borderBottom:'1px solid var(--border-md)', position:'relative',
        }}>
          {/* Brand */}
          <div style={{ display:'flex', alignItems:'center', gap:13 }}>
            <div className="glass" style={{
              width:36, height:36, borderRadius:10, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              border:'1.5px solid var(--border-str)',
              background:'linear-gradient(135deg,rgba(30,111,181,0.1),rgba(122,179,224,0.06))',
            }}>
              <Icon.Brain size={18}/>
            </div>
            <div>
              <div className="brand-text" style={{ fontWeight:800, fontSize:16, letterSpacing:'-0.2px' }}>
                RAG Assistant
              </div>
              <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:'2px', fontFamily:"'IBM Plex Mono',monospace" }}>
                KNOWLEDGE INTELLIGENCE
              </div>
            </div>
          </div>

          {/* Center */}
          <div style={{ display:'flex', alignItems:'center', gap:6, fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'var(--text-muted)' }}>
            <div className="status-dot" style={{ width:6, height:6, borderRadius:'50%', background:'#1e6fb5', boxShadow:'0 0 7px rgba(30,111,181,0.5)' }}/>
            SYSTEM ONLINE
          </div>

          {/* Right */}
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{
              display:'flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:20,
              background:'rgba(30,111,181,0.08)', border:'1.5px solid var(--border-md)',
              fontSize:12, color:'var(--ocean)', fontFamily:"'IBM Plex Mono',monospace",
            }}>
              <Icon.Doc/> {documents.length} docs
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:30, height:30, borderRadius:'50%',
                background:'linear-gradient(135deg,#1e6fb5,#0a3d73)',
                border:'2px solid rgba(122,179,224,0.4)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:800, color:'#fff',
              }}>
                {loggedInUser[0]?.toUpperCase()||'U'}
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--text-mid)' }}>{loggedInUser}</span>
            </div>
          </div>

          {/* Bottom shimmer line */}
          <div className="shim-line" style={{ position:'absolute', bottom:0, left:'5%', right:'5%', height:1 }}/>
        </header>

        {/* ── BODY ── */}
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

          {/* ── SIDEBAR ── */}
          <aside style={{
            width:272, flexShrink:0, display:'flex', flexDirection:'column',
            background:'rgba(240,247,255,0.75)', backdropFilter:'blur(20px)',
            borderRight:'1px solid var(--border-md)', overflow:'hidden',
          }}>
            <div style={{ flex:1, overflowY:'auto', padding:'18px 14px', display:'flex', flexDirection:'column', gap:18 }}>

              {/* Upload */}
              <label className="upload-zone" style={{ borderRadius:14, padding:'22px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:10, textAlign:'center', position:'relative' }}>
                <input type="file" multiple accept=".pdf,.txt,.docx" onChange={handleUpload} style={{ display:'none' }}/>
                <Brackets color="rgba(30,111,181,0.25)"/>
                <div style={{
                  width:42, height:42, borderRadius:12,
                  background:'rgba(30,111,181,0.1)', border:'1.5px solid var(--border-str)',
                  display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ocean)',
                }}>
                  {isUploading
                    ? <div className="spin" style={{ width:16, height:16, border:'2px solid rgba(30,111,181,0.2)', borderTopColor:'var(--ocean)', borderRadius:'50%' }}/>
                    : <Icon.Upload/>}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--ocean)' }}>
                    {isUploading ? 'Uploading…' : 'Upload Documents'}
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>PDF · TXT · DOCX</div>
                </div>
              </label>

              {/* Docs list */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <span style={{ fontSize:10, fontFamily:"'IBM Plex Mono',monospace", color:'var(--text-muted)', letterSpacing:'1.5px' }}>
                    KNOWLEDGE BASE
                  </span>
                  {documents.length > 0 && (
                    <button onClick={handleClearAll} style={{
                      background:'none', border:'none', cursor:'pointer',
                      color:'rgba(185,28,28,0.6)', fontSize:10, letterSpacing:'0.5px',
                      display:'flex', alignItems:'center', gap:4, padding:'3px 7px', borderRadius:6,
                      transition:'all 0.2s', fontFamily:"'IBM Plex Mono',monospace",
                    }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='rgba(185,28,28,0.08)'; e.currentTarget.style.color='#b91c1c'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='none'; e.currentTarget.style.color='rgba(185,28,28,0.6)'; }}
                    >
                      <Icon.Clear/> Clear
                    </button>
                  )}
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {documents.length === 0 ? (
                    <div style={{
                      border:'1px dashed var(--border-str)', borderRadius:10, padding:'18px 14px',
                      textAlign:'center', color:'var(--text-subtle)', fontSize:12,
                      fontFamily:"'IBM Plex Mono',monospace",
                    }}>
                      No documents indexed
                    </div>
                  ) : documents.map((doc, i) => (
                    <div key={i} className="doc-chip glass" style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      border:'1px solid var(--border)', borderRadius:10, padding:'9px 12px',
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, overflow:'hidden' }}>
                        <span style={{ color:'var(--ocean)', flexShrink:0 }}><Icon.Doc/></span>
                        <div style={{ overflow:'hidden' }}>
                          <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text)' }}>
                            {doc.name}
                          </div>
                          <div style={{ fontSize:9, color:'var(--text-muted)', marginTop:1, fontFamily:"'IBM Plex Mono',monospace" }}>
                            {doc.chunks} chunks
                          </div>
                        </div>
                      </div>
                      <button onClick={()=>handleDelete(doc.name)} style={{
                        background:'none', border:'none', cursor:'pointer', color:'var(--text-subtle)',
                        padding:5, borderRadius:6, flexShrink:0, display:'flex', alignItems:'center', transition:'all 0.2s',
                      }}
                        onMouseEnter={e=>{ e.currentTarget.style.color='#b91c1c'; e.currentTarget.style.background='rgba(185,28,28,0.08)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.color='var(--text-subtle)'; e.currentTarget.style.background='none'; }}
                      >
                        <Icon.Trash/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar footer */}
            <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', textAlign:'center' }}>
              <div style={{ fontSize:9, color:'var(--text-subtle)', letterSpacing:'1.5px', fontFamily:"'IBM Plex Mono',monospace" }}>
                ANSWERS GROUNDED IN YOUR DOCUMENTS
              </div>
            </div>
          </aside>

          {/* ── CHAT ── */}
          <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
            {/* Subtle inner glow */}
            <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0, background:'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(122,179,224,0.1) 0%, transparent 70%)' }}/>

            {/* Messages scroll */}
            <div style={{ flex:1, overflowY:'auto', padding:'32px 9%', position:'relative', zIndex:1 }}>

              {/* Empty state */}
              {messages.length === 0 && (
                <div style={{
                  height:'100%', display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', gap:30, textAlign:'center',
                  animation:'msgIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards',
                }}>
                  {/* Orbit logo */}
                  <div style={{ position:'relative', width:110, height:110 }}>
                    <div className="logo-pulse glass-deep" style={{
                      width:86, height:86, borderRadius:24, margin:'12px auto 0',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      border:'1.5px solid var(--border-str)',
                    }}>
                      <Icon.Brain size={42}/>
                    </div>
                    <div className="spin-slow" style={{
                      position:'absolute', inset:0,
                      border:'1.5px solid rgba(30,111,181,0.12)',
                      borderRadius:'50%', borderTopColor:'rgba(30,111,181,0.45)',
                    }}/>
                    <div className="spin-rev" style={{
                      position:'absolute', inset:-14,
                      border:'1px solid rgba(122,179,224,0.08)',
                      borderRadius:'50%', borderRightColor:'rgba(122,179,224,0.3)',
                    }}/>
                  </div>

                  <div>
                    <h2 className="brand-text" style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.3px', marginBottom:12 }}>
                      Ask your documents anything
                    </h2>
                    <p style={{ color:'var(--text-muted)', fontSize:14, maxWidth:420, lineHeight:1.8 }}>
                      {documents.length > 0
                        ? `${documents.length} document${documents.length>1?'s':''} indexed and ready.`
                        : 'Upload documents from the sidebar to get started.'}
                    </p>
                  </div>

                  {/* Suggestion chips */}
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
                    {SUGGESTIONS.map(s => (
                      <button key={s} className="suggestion-chip" onClick={()=>setQuestion(s)} style={{
                        borderRadius:20, padding:'9px 18px', fontSize:13,
                        color:'var(--text-mid)', fontWeight:500,
                        display:'flex', alignItems:'center', gap:6,
                        fontFamily:"'Plus Jakarta Sans',sans-serif",
                      }}>
                        <Icon.Zap/> {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, i) => (
                <div key={i} className="msg-in" style={{
                  display:'flex', flexDirection:'column',
                  alignItems: msg.role==='user' ? 'flex-end' : 'flex-start',
                  gap:8, marginBottom:22,
                }}>
                  <div style={{
                    display:'flex', gap:12, alignItems:'flex-start', maxWidth:'76%',
                    flexDirection: msg.role==='user' ? 'row-reverse' : 'row',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width:34, height:34, borderRadius:10, flexShrink:0,
                      background: msg.role==='user'
                        ? 'linear-gradient(135deg,#1e6fb5,#0a3d73)'
                        : 'rgba(255,255,255,0.9)',
                      border: `1.5px solid ${msg.role==='user' ? 'rgba(122,179,224,0.4)' : 'var(--border-md)'}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize: msg.role==='user' ? 13 : 16,
                      fontWeight:800, color: msg.role==='user' ? '#fff' : 'var(--ocean)',
                      boxShadow: msg.role==='user' ? '0 4px 16px rgba(10,61,115,0.28)' : 'var(--shadow-sm)',
                    }}>
                      {msg.role==='user' ? (loggedInUser[0]?.toUpperCase()||'U') : '◈'}
                    </div>

                    {/* Bubble */}
                    <div style={{
                      background: msg.role==='user'
                        ? 'linear-gradient(135deg,#1e6fb5 0%,#0a3d73 100%)'
                        : 'rgba(255,255,255,0.88)',
                      border: `1px solid ${msg.role==='user' ? 'rgba(30,111,181,0.4)' : 'var(--border-md)'}`,
                      borderRadius: msg.role==='user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      padding:'14px 20px',
                      color: msg.role==='user' ? 'rgba(255,255,255,0.95)' : 'var(--text)',
                      fontSize:14, lineHeight:1.8, whiteSpace:'pre-wrap',
                      backdropFilter: msg.role==='assistant' ? 'blur(12px)' : 'none',
                      boxShadow: msg.role==='user'
                        ? '0 6px 28px rgba(10,61,115,0.28), inset 0 1px 0 rgba(255,255,255,0.12)'
                        : 'var(--shadow-sm)',
                    }}>
                      {msg.content}
                    </div>
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ maxWidth:'76%', marginLeft: msg.role==='user' ? 0 : 46 }}>
                      <p style={{ color:'var(--text-subtle)', fontSize:9, fontFamily:"'IBM Plex Mono',monospace", letterSpacing:'2px', marginBottom:7 }}>
                        SOURCES
                      </p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {msg.sources.map((src, j) => (
                          <div key={j} style={{
                            background:'rgba(30,111,181,0.07)', border:'1px solid var(--border-str)',
                            borderRadius:8, padding:'5px 12px',
                            color:'var(--ocean)', fontSize:11,
                            display:'flex', alignItems:'center', gap:6,
                            fontFamily:"'IBM Plex Mono',monospace",
                          }}>
                            <Icon.Doc/> {src}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking */}
              {isThinking && (
                <div className="msg-in" style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:22 }}>
                  <div style={{
                    width:34, height:34, borderRadius:10,
                    background:'rgba(255,255,255,0.9)', border:'1.5px solid var(--border-md)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:16, color:'var(--ocean)', boxShadow:'var(--shadow-sm)',
                  }}>◈</div>
                  <div style={{
                    background:'rgba(255,255,255,0.88)', border:'1px solid var(--border-md)',
                    borderRadius:'4px 16px 16px 16px', padding:'16px 22px',
                    display:'flex', alignItems:'center', gap:7,
                    backdropFilter:'blur(12px)', boxShadow:'var(--shadow-sm)',
                  }}>
                    {[0,1,2].map(i => (
                      <div key={i} className="think" style={{
                        width:7, height:7, borderRadius:'50%',
                        background: i===0 ? '#1e6fb5' : i===1 ? '#7ab3e0' : '#0a3d73',
                        boxShadow:`0 0 8px ${i===0?'rgba(30,111,181,0.6)':i===1?'rgba(122,179,224,0.6)':'rgba(10,61,115,0.6)'}`,
                        animationDelay:`${i*0.2}s`,
                      }}/>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef}/>
            </div>

            {/* ── INPUT BAR ── */}
            <div style={{
              padding:'16px 9%', flexShrink:0, position:'relative', zIndex:1,
              background:'rgba(240,247,255,0.9)', backdropFilter:'blur(24px)',
              borderTop:'1px solid var(--border-md)',
            }}>
              {/* Top shimmer */}
              <div className="shim-line" style={{ position:'absolute', top:0, left:'10%', right:'10%', height:1 }}/>

              <div className="send-box glass-deep" style={{
                display:'flex', alignItems:'center', gap:10,
                borderRadius:14, padding:'8px 8px 8px 22px',
                boxShadow:'var(--shadow-md)',
                border:'1.5px solid var(--border-md)',
              }}>
                <input
                  type="text"
                  placeholder="Ask a question about your documents…"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && handleChat()}
                  style={{
                    flex:1, background:'transparent', border:'none', outline:'none',
                    color:'var(--text)', fontSize:14,
                    fontFamily:"'Plus Jakarta Sans',sans-serif",
                    caretColor:'var(--ocean)',
                  }}
                />
                <button className="btn-frost" onClick={handleChat}
                  disabled={isThinking || !question.trim()}
                  style={{
                    height:42, minWidth:42, borderRadius:10,
                    padding: question.trim() ? '0 20px' : '0',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                    fontSize:13, fontWeight:700,
                  }}>
                  <Icon.Send/>
                  {question.trim() && <span>Send</span>}
                </button>
              </div>

              <p style={{ color:'var(--text-subtle)', fontSize:9, textAlign:'center', marginTop:8, fontFamily:"'IBM Plex Mono',monospace", letterSpacing:'1.5px' }}>
                RESPONSES GROUNDED IN UPLOADED DOCUMENTS ONLY
              </p>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}