import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import StudentHeader from '../components/StudentHeader';

export default function Conversation() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Load student accepted connections from database
  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      try {
        const res = await client.get('/requests/sent');
        // Filter requests that have been accepted by mentors
        const accepted = res.data.filter(req => req.status === 'accepted');
        setConnections(accepted);
        if (accepted.length > 0) {
          setSelectedConnection(accepted[0]);
        }
      } catch (err) {
        console.error("Failed to load connections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);

  // Sync mock messages when selected connection changes
  useEffect(() => {
    if (selectedConnection) {
      const mentorName = selectedConnection.mentor?.name || 'Mentor';
      setMessages([
        { id: 1, sender: 'mentor', text: `Hi! I read your connection request regarding "${selectedConnection.answer_1.substring(0, 45)}...". I think we can outline some concrete milestones during our first chat.`, timestamp: 'Yesterday, 3:45 PM' },
        { id: 2, sender: 'student', text: `Thanks for accepting my request! I have already tried setting up some basic architectures.`, timestamp: 'Yesterday, 4:10 PM' },
        { id: 3, sender: 'mentor', text: `Perfect. What timezone are you in? Let's aim to hop on a quick call this week.`, timestamp: 'Yesterday, 4:12 PM' }
      ]);
    } else {
      setMessages([]);
    }
  }, [selectedConnection]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConnection) return;

    const studentMessage = {
      id: Date.now(),
      sender: 'student',
      text: inputText,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, studentMessage]);
    setInputText('');

    // Simulate realistic mentor response after a 1.2s delay
    setTimeout(() => {
      const mentorReply = {
        id: Date.now() + 1,
        sender: 'mentor',
        text: `Got it! Let me review that. I'm open to discussing this in detail. Let's sync up on coordinates soon.`,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, mentorReply]);
    }, 1200);
  };

  const getInitials = (name) => {
    if (!name) return 'MM';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="h-dvh bg-dark-canvas text-silver flex flex-col justify-between overflow-hidden bg-grid-dots">
      <div className="radial-spotlight"></div>
      
      {/* Shared Nav Header */}
      <div className="shrink-0">
        <StudentHeader />
      </div>

      {/* Main Workspace Frame (Strict 100vh sub-layout) */}
      <main className="flex-grow flex p-4 md:p-8 overflow-hidden relative z-10 h-[calc(100dvh-80px)]">
        
        {/* Focus overlay canvas when input is active */}
        <div className={`absolute inset-0 bg-[#050505]/30 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-none z-10 ${
          isInputFocused ? 'opacity-100' : 'opacity-0'
        }`}></div>

        <div className="w-full h-full max-w-7xl mx-auto flex rounded-3xl border border-white/8 bg-[#0D0D11]/70 backdrop-blur-xl overflow-hidden shadow-2xl">
          
          {/* LEFT PANE (350px Thread list) */}
          <div className="w-full md:w-[350px] border-r border-white/8 flex flex-col shrink-0 bg-[#0D0D11]/90">
            <div className="p-5 border-b border-white/8 shrink-0">
              <h3 className="text-xs font-black text-cyber-white uppercase tracking-wider">Active Workspace Chats</h3>
              <p className="text-[10px] text-slate-muted mt-1">Select an approved mentor connection to begin</p>
            </div>

            {loading ? (
              <div className="flex-grow flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/10 border-t-white"></div>
              </div>
            ) : connections.length === 0 ? (
              /* State Cleansing elegant Empty State */
              <div className="flex-grow p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-10 h-10 rounded-xl bg-glow-blue/10 border border-glow-blue/20 flex items-center justify-center text-glow-blue">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-black text-cyber-white uppercase">No Active Chats</h4>
                  <p className="text-slate-muted text-[10px] mt-1 leading-relaxed">
                    You can only chat with mentors who have accepted your connection request.
                  </p>
                </div>
                <Link
                  to="/browse"
                  className="py-2.5 px-4 rounded-xl bg-cyber-white text-black font-extrabold text-[10px] uppercase cursor-pointer hover:scale-102 interactive-element text-center"
                >
                  Find a Mentor to start chatting
                </Link>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto p-3 space-y-1">
                {connections.map((conn) => {
                  const isSelected = selectedConnection?.id === conn.id;
                  return (
                    <button
                      key={conn.id}
                      onClick={() => setSelectedConnection(conn)}
                      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-white/5 border border-white/8 shadow-inner' 
                          : 'hover:bg-white/3 border border-transparent'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-glow-violet to-glow-blue flex items-center justify-center text-cyber-white font-extrabold text-sm shadow-md shrink-0">
                        {getInitials(conn.mentor?.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-cyber-white text-xs truncate">{conn.mentor?.name}</h4>
                          <span className="text-[9px] text-slate-dark shrink-0">Active</span>
                        </div>
                        <p className="text-slate-muted text-[10px] truncate mt-0.5">📍 {conn.mentor?.city}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT PANE (Flex-grow Conversation Window) */}
          <div className="flex-grow flex flex-col h-full bg-[#050505]/40 relative z-20">
            {selectedConnection ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 border-b border-white/8 flex items-center justify-between bg-[#0D0D11]/40 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-glow-violet to-glow-blue flex items-center justify-center text-cyber-white font-extrabold text-xs">
                      {getInitials(selectedConnection.mentor?.name)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-cyber-white">{selectedConnection.mentor?.name}</h3>
                      <span className="text-[9px] text-emerald-450 font-semibold block mt-0.5">🟢 Online • Active now</span>
                    </div>
                  </div>
                  <Link
                    to={`/mentor/${selectedConnection.mentor_id}`}
                    className="py-1 px-3 rounded-lg border border-white/8 hover:border-white/15 text-[10px] font-bold text-slate-muted hover:text-cyber-white interactive-element"
                  >
                    View Profile
                  </Link>
                </div>

                {/* Messages Bubbles list */}
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  {messages.map((msg) => {
                    const isMentor = msg.sender === 'mentor';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMentor ? 'justify-start' : 'justify-end'} animate-stagger-fade`}
                      >
                        <div className="max-w-[70%] space-y-1">
                          {/* Chat Bubbles UI */}
                          <div 
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isMentor
                                ? 'bg-[#16161C] text-cyber-white rounded-tl-none border border-white/5'
                                : 'bg-cyber-white text-[#050505] rounded-tr-none font-medium'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className={`text-[9px] text-slate-dark block ${!isMentor && 'text-right'}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Input Component */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-white/8 bg-[#0D0D11]/90 flex gap-3 shrink-0"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder={`Message ${selectedConnection.mentor?.name || 'mentor'}...`}
                    className="flex-grow bg-[#050505] border border-white/8 text-xs text-cyber-white placeholder-slate-dark rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:border-white focus:ring-0"
                  />
                  <button
                    type="submit"
                    className="py-3 px-5 rounded-xl bg-cyber-white text-black font-extrabold text-xs hover:scale-102 interactive-element cursor-pointer"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              /* Empty state right pane */
              <div className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-2">
                <p className="text-slate-muted text-xs">No mentor conversation active.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
