import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { ArrowLeft, Users, Send, Play, Pause, Square, Bot, Trophy, MessageCircle, Clock, Share2, Check, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { saveSession } from "@/lib/saveSession";
import API_URL from "@/config";

const socket = io(API_URL);

// ─── Background-safe Timer ────────────────────────────────────────────────────
// Instead of incrementing seconds, we store the exact Date.now() when timer
// started. This way switching tabs / other pages never pauses the clock.
const TIMER_START_KEY = "gazen_timer_start";
const TIMER_OFFSET_KEY = "gazen_timer_offset"; // accumulated seconds from previous runs
const TIMER_RUNNING_KEY = "gazen_timer_running";

const getElapsed = () => {
  const start = Number(localStorage.getItem(TIMER_START_KEY) || 0);
  const offset = Number(localStorage.getItem(TIMER_OFFSET_KEY) || 0);
  if (!start) return offset;
  return offset + Math.floor((Date.now() - start) / 1000);
};

const StudyRoomSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, session, profile, refreshProfile, loading: authLoading } = useAuth();

  const [room, setRoom] = useState(null);
  const [status, setStatus] = useState("studying");
  const [activeTab, setActiveTab] = useState("chat");

  // Chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // AI Chatbot
  const [aiMessages, setAiMessages] = useState([{ sender: "Tutor", text: "Hi! I'm your AI Study Tutor. Ask me any question you have during your session! 🧠" }]);
  const [newAiMessage, setNewAiMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);

  // Timer — driven by timestamp, not interval counter
  const [timerMode, setTimerMode] = useState("personal");
  const [timerSeconds, setTimerSeconds] = useState(() => getElapsed());
  const [isTimerRunning, setIsTimerRunning] = useState(
    () => localStorage.getItem(TIMER_RUNNING_KEY) === "true"
  );
  const timerRef = useRef(null);

  // Share
  const [copied, setCopied] = useState(false);

  // ── Load room + Socket setup ───────────────────────────────────────────────
  useEffect(() => {
    const fetchRoom = async () => {
      if (!session?.access_token) return;
      try {
        const { data } = await axios.get(`${API_URL}/api/rooms/${id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        setRoom(data);
        socket.emit("join_room", { roomId: data._id, token: session.access_token });
        // Mark user as live in localStorage (for green dot on profile)
        localStorage.setItem("gazen_in_room", data._id);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.msg || "Error loading room");
        navigate("/rooms");
      }
    };

    fetchRoom();

    socket.on("user_joined", () => toast.success("A new user joined the room 👋"));
    socket.on("user_left", () => toast("A user left the room"));
    socket.on("room_join_denied", (data) => {
      toast.error(data?.msg || "Access denied");
      navigate("/rooms");
    });
    socket.on("receive_message", (data) => setMessages((prev) => [...prev, data]));
    socket.on("sync_timer", (val) => { if (timerMode === "group") setTimerSeconds(val); });

    // Restore running state from localStorage on mount
    if (localStorage.getItem(TIMER_RUNNING_KEY) === "true") {
      setIsTimerRunning(true);
    }

    return () => {
      // Cleanup: remove live status when leaving the room page
      localStorage.removeItem("gazen_in_room");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("room_join_denied");
      socket.off("receive_message");
      socket.off("sync_timer");
      // NOTE: we do NOT emit leave_room here so timer keeps running in background
    };
  }, [id, navigate, timerMode, session?.access_token]);

  // ── Page Visibility API — re-sync timer when tab becomes active again ──────
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        setTimerSeconds(getElapsed());
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ── Timer tick (updates display every second) ─────────────────────────────
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(getElapsed());
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  // ── Timer Controls ────────────────────────────────────────────────────────
  const startTimer = () => {
    // Save offset = previously accumulated seconds, store new start
    localStorage.setItem(TIMER_OFFSET_KEY, String(timerSeconds));
    localStorage.setItem(TIMER_START_KEY, String(Date.now()));
    localStorage.setItem(TIMER_RUNNING_KEY, "true");
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    // Save current elapsed as offset, clear start
    localStorage.setItem(TIMER_OFFSET_KEY, String(getElapsed()));
    localStorage.removeItem(TIMER_START_KEY);
    localStorage.setItem(TIMER_RUNNING_KEY, "false");
    setIsTimerRunning(false);
  };

  const stopTimerAndSaveXP = async () => {
    pauseTimer();
    const elapsed = getElapsed();

    if (elapsed < 120) {
      toast.info("Focus for at least 2 minutes to earn XP!");
      resetTimer();
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in to earn XP!");
      resetTimer();
      return;
    }

    const result = await saveSession(user.id, elapsed);
    if (result) {
      toast.success(`🎉 Session saved! +${result.xpGain} XP · Total: ${result.xp} XP`);
      await refreshProfile(); // re-sync profile
    } else {
      toast.error("Failed to save session");
    }
    resetTimer();
  };

  const resetTimer = () => {
    localStorage.removeItem(TIMER_START_KEY);
    localStorage.removeItem(TIMER_OFFSET_KEY);
    localStorage.setItem(TIMER_RUNNING_KEY, "false");
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  // ── Leaderboard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "leaderboard") {
      axios.get(`${API_URL}/api/users/leaderboard`)
        .then(res => setLeaderboard(res.data))
        .catch(err => console.error("Leaderboard fetch failed", err));
    }
  }, [activeTab]);

  // ── Chat ──────────────────────────────────────────────────────────────────
  const sendRoomMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !room) return;
    const data = { roomId: room._id, text: newMessage, sender: user?.username || "Guest", timestamp: new Date().toISOString() };
    socket.emit("send_message", data);
    setMessages((prev) => [...prev, data]);
    setNewMessage("");
  };

  // ── AI Tutor ──────────────────────────────────────────────────────────────
  const sendAiMessage = async (e) => {
    e.preventDefault();
    if (!newAiMessage.trim()) return;
    const userMsg = { sender: "Me", text: newAiMessage };
    setAiMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);
    setNewAiMessage("");
    try {
      const { data } = await axios.post(`${API_URL}/api/ai/chat`, { message: userMsg.text });
      setAiMessages(prev => [...prev, { sender: "Tutor", text: data.reply }]);
    } catch (err) {
      toast.error("AI couldn't respond right now.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // ── Share Room ────────────────────────────────────────────────────────────
  const shareRoom = async () => {
    if (!room) return;
    const shareUrl = `${window.location.origin}/rooms/${room._id}`;
    const isPrivateOwner = room.isPrivate && room.owner === user?.id && room.code;
    const shareText = isPrivateOwner ? room.code : shareUrl;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      if (isPrivateOwner) {
        toast.success("Room code copied!");
      } else {
      toast.success("Room link copied! Share it with your study buddies 🔗");
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy invite");
    }
  };

  // ── Format time ──────────────────────────────────────────────────────────
  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading auth...</div>;
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Lock className="w-12 h-12 text-primary" />
        <h1 className="text-2xl font-display font-black">Authentication Required</h1>
        <p className="text-muted-foreground">Please sign in to join this study session.</p>
        <button onClick={() => navigate("/signin")} className="bg-foreground text-background px-6 py-2 rounded-xl font-bold">Sign In</button>
      </div>
    );
  }

  if (!room) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading room...</p>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen p-4 md:p-8 pt-20 max-w-6xl mx-auto flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4 shrink-0">
          <button onClick={() => navigate("/rooms")} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-black font-display">{room.name}</h1>
            <p className="text-sm text-emerald-500 font-bold flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Room • {room.topic || "General Focus"}
            </p>
          </div>
          {/* Room Code - Only visible to owner */}
          {room.isPrivate && room.owner === user?.id && room.code && (
            <div className="bg-secondary/50 px-4 py-2 rounded-xl text-sm font-mono font-bold text-muted-foreground border border-border/20">
              {room.code}
            </div>
          )}
          {/* Share Button */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={shareRoom}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm font-bold hover:bg-primary/20 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Copied!" : "Share"}
          </motion.button>
        </div>

        {/* Main Interface Layout */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
          
          {/* Main Focus Area */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="glass flex-1 rounded-[24px] border border-border/20 p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-lg shadow-black/5">
                {/* Top Controls */}
                <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center">
                  {/* Timer Mode Toggle */}
                  <div className="flex items-center bg-secondary/50 rounded-xl p-1 border border-border/10">
                    <button onClick={() => setTimerMode("personal")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timerMode === "personal" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Personal</button>
                    <button onClick={() => setTimerMode("group")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timerMode === "group" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Group Sync</button>
                  </div>
                  <button onClick={() => {
                      const newStatus = status === "studying" ? "idle" : "studying";
                      setStatus(newStatus);
                      socket.emit("status_change", { roomId: room._id, userId: socket.id, status: newStatus });
                  }} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${status === "studying" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}>
                    {status === "studying" ? "🎯 Studying" : "☕ Taking a Break"}
                  </button>
                </div>

                {/* Timer Display */}
                <motion.h2
                  key={Math.floor(timerSeconds / 60)} // animate on minute change
                  className="text-7xl md:text-9xl font-black font-mono tracking-tighter tabular-nums"
                  style={{ color: isTimerRunning ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
                >
                  {formatTime(timerSeconds)}
                </motion.h2>
                
                {isTimerRunning && (
                  <p className="text-emerald-500 font-bold text-sm mt-3 flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    Timer running in background — switch tabs freely!
                  </p>
                )}
                {!isTimerRunning && timerSeconds > 0 && (
                  <p className="text-amber-500 font-medium text-sm mt-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Paused at {formatTime(timerSeconds)}
                  </p>
                )}
                {!isTimerRunning && timerSeconds === 0 && (
                  <p className="text-muted-foreground font-medium text-sm mt-4 flex items-center gap-2">
                    <Clock className="w-4 h-4"/> Stop timer to earn XP (2 min = 1 XP)
                  </p>
                )}

                <div className="flex gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={isTimerRunning ? pauseTimer : startTimer}
                    className="h-16 w-16 rounded-full bg-foreground text-background flex items-center justify-center shadow-xl"
                  >
                    {isTimerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={stopTimerAndSaveXP}
                    title="Stop and Save XP"
                    className="h-16 w-16 rounded-full bg-red-500/10 border-2 border-red-500/30 text-red-500 flex items-center justify-center shadow-md hover:bg-red-500/20 transition-colors"
                  >
                    <Square className="w-5 h-5" />
                  </motion.button>
                </div>
            </div>

            {/* Active Members Bar */}
            <div className="h-28 glass rounded-2xl border border-border/20 p-4 flex gap-3 overflow-x-auto items-center">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-full ${isTimerRunning ? "bg-emerald-500/20 border-emerald-500" : "bg-secondary/50 border-border/40"} border-2 flex items-center justify-center text-xl shadow-md transition-all`}>
                      {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover rounded-full" /> : "🧑‍💻"}
                    </div>
                    {isTimerRunning && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse"></span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-foreground">{profile?.username || "You"}</span>
                </div>
                <div className="w-[1px] h-10 bg-border/40 mx-2"></div>
                <div className="text-sm font-bold text-muted-foreground flex gap-2 items-center">
                  <Users className="w-4 h-4" /> Others appear here when they join
                </div>
            </div>
          </div>

          {/* Right Panel (Tabs) */}
          <div className="w-full lg:w-96 flex flex-col glass rounded-[24px] border border-border/20 overflow-hidden shrink-0 shadow-lg shadow-black/5">
            {/* Tabs Header */}
            <div className="flex p-2 gap-1 border-b border-border/10 bg-secondary/10">
               <button onClick={() => setActiveTab("chat")} className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === "chat" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/50"}`}><MessageCircle className="w-3.5 h-3.5" /> Chat</button>
               <button onClick={() => setActiveTab("ai")} className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === "ai" ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-secondary/50"}`}><Bot className="w-3.5 h-3.5" /> AI Tutor</button>
               <button onClick={() => setActiveTab("leaderboard")} className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === "leaderboard" ? "bg-amber-500/10 text-amber-600 shadow-sm" : "text-muted-foreground hover:bg-secondary/50"}`}><Trophy className="w-3.5 h-3.5" /> Rank</button>
            </div>

            {/* Tab: Room Chat */}
            {activeTab === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No messages yet. Say hi!
                    </div>
                  )}
                  <AnimatePresence>
                    {messages.map((m, i) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex flex-col ${m.sender === (user?.username || "Guest") ? "items-end" : "items-start"}`}>
                        <span className="text-[10px] text-muted-foreground mb-1 ml-1">{m.sender}</span>
                        <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${m.sender === (user?.username || "Guest") ? "bg-foreground text-background rounded-tr-sm" : "bg-secondary text-foreground rounded-tl-sm"}`}>
                          {m.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <form onSubmit={sendRoomMessage} className="p-3 bg-secondary/20 border-t border-border/10 relative mt-auto">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Say hi..." className="w-full bg-background rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border/30" />
                  <button disabled={!newMessage.trim()} type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 bg-foreground text-background rounded-lg disabled:opacity-50 disabled:bg-secondary transition-colors"><Send className="w-3.5 h-3.5" /></button>
                </form>
              </>
            )}

            {/* Tab: AI Tutor */}
            {activeTab === "ai" && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-primary/5">
                  <AnimatePresence>
                    {aiMessages.map((m, i) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex flex-col ${m.sender === "Me" ? "items-end" : "items-start"}`}>
                        <span className={`text-[10px] font-bold mb-1 ml-1 flex items-center gap-1 ${m.sender === "Tutor" ? "text-primary" : "text-muted-foreground"}`}>{m.sender === "Tutor" && <Bot className="w-3 h-3"/>} {m.sender}</span>
                        <div className={`px-4 py-3 rounded-2xl max-w-[90%] text-sm leading-relaxed whitespace-pre-wrap ${m.sender === "Me" ? "bg-foreground text-background rounded-tr-sm" : "bg-background border border-primary/20 text-foreground rounded-tl-sm shadow-sm"}`}>
                          {m.text}
                        </div>
                      </motion.div>
                    ))}
                    {isAiLoading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start">
                        <span className="text-[10px] font-bold mb-1 ml-1 flex items-center gap-1 text-primary"><Bot className="w-3 h-3"/> Tutor</span>
                        <div className="px-4 py-3 rounded-2xl bg-background border border-primary/20 text-muted-foreground text-sm flex gap-1.5 rounded-tl-sm">
                          <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.15s" }}></span>
                          <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.3s" }}></span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <form onSubmit={sendAiMessage} className="p-3 bg-primary/5 border-t border-primary/10 relative mt-auto">
                  <input type="text" value={newAiMessage} onChange={(e) => setNewAiMessage(e.target.value)} placeholder="Ask a study question..." className="w-full bg-background rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 border border-primary/20" />
                  <button disabled={!newAiMessage.trim() || isAiLoading} type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 transition-colors"><Send className="w-3.5 h-3.5" /></button>
                </form>
              </>
            )}

            {/* Tab: Leaderboard */}
            {activeTab === "leaderboard" && (
              <div className="flex-1 overflow-y-auto bg-amber-500/5">
                <div className="p-5 border-b border-amber-500/10">
                   <h3 className="font-display font-black text-amber-600 text-lg flex items-center gap-2"><Trophy className="w-5 h-5"/> Top Scholars</h3>
                   <p className="text-xs text-muted-foreground mt-1">1 XP per 2 minutes · +2 XP bonus per hour!</p>
                </div>
                <div className="p-3">
                  {leaderboard.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground text-sm">No grinders yet. Start the timer to claim #1! 🏆</div>
                  ) : (
                    leaderboard.map((u, i) => (
                      <div key={u._id} className="flex items-center gap-3 p-3 hover:bg-amber-500/10 rounded-xl transition-colors">
                        <div className={`w-7 text-center font-black text-lg ${i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-muted-foreground/40 text-sm"}`}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                        </div>
                        <div className="relative w-8 h-8 rounded-full bg-secondary overflow-hidden shrink-0">
                          {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xs">🧑‍💻</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">{u.username || u.full_name || "Anonymous Grinder"}</p>
                          <p className="text-[10px] text-muted-foreground">{Math.floor((u.totalStudySeconds || 0) / 3600)} hrs total</p>
                        </div>
                        <div className="font-mono font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded-md text-xs">{u.xp} XP</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </PageTransition>
  );
};

export default StudyRoomSession;
