import { useState, useEffect } from "react";
import { Plus, Users, Lock, Unlock, Copy, Trash2, DoorOpen, Radio, Wifi, Sparkles, Search, Volume2, Headphones, Timer, MessageCircle, Mic, MicOff, Crown } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "@/config";

const ROOM_VIBES = [
  { tag: "🔥 Intense", bg: "from-orange-500/10 via-amber-500/5 to-transparent", border: "border-orange-400/20", glow: "hover:shadow-[0_0_30px_rgba(249,115,22,0.08)]", accent: "text-orange-500", accentBg: "bg-orange-500/10", stripe: "from-orange-500/40 via-amber-400/20 to-transparent" },
  { tag: "💎 Focus", bg: "from-blue-500/10 via-sky-500/5 to-transparent", border: "border-blue-400/20", glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]", accent: "text-blue-500", accentBg: "bg-blue-500/10", stripe: "from-blue-500/40 via-sky-400/20 to-transparent" },
  { tag: "🌿 Chill", bg: "from-emerald-500/10 via-green-500/5 to-transparent", border: "border-emerald-400/20", glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]", accent: "text-emerald-500", accentBg: "bg-emerald-500/10", stripe: "from-emerald-500/40 via-green-400/20 to-transparent" },
  { tag: "⚡ Grind", bg: "from-violet-500/10 via-purple-500/5 to-transparent", border: "border-violet-400/20", glow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]", accent: "text-violet-500", accentBg: "bg-violet-500/10", stripe: "from-violet-500/40 via-purple-400/20 to-transparent" },
  { tag: "🚀 Sprint", bg: "from-pink-500/10 via-rose-500/5 to-transparent", border: "border-pink-400/20", glow: "hover:shadow-[0_0_30px_rgba(236,72,153,0.08)]", accent: "text-pink-500", accentBg: "bg-pink-500/10", stripe: "from-pink-500/40 via-rose-400/20 to-transparent" },
  { tag: "🧠 Deep", bg: "from-cyan-500/10 via-teal-500/5 to-transparent", border: "border-cyan-400/20", glow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.08)]", accent: "text-cyan-500", accentBg: "bg-cyan-500/10", stripe: "from-cyan-500/40 via-teal-400/20 to-transparent" },
];

const getVibe = (id) => ROOM_VIBES[parseInt(id, 10) % ROOM_VIBES.length] || ROOM_VIBES[0];

// Using Real DB Instead of Initial Rooms

const PulsingDot = ({ color = "bg-emerald-400", size = "w-2 h-2" }) => (
  <span className="relative flex">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-40`} />
    <span className={`relative inline-flex rounded-full ${size} ${color}`} />
  </span>
);

const MemberAvatar = ({ member, index, isHost }) => (
  <motion.div
    initial={{ scale: 0, y: 5 }}
    animate={{ scale: 1, y: 0 }}
    transition={{ delay: 0.05 + index * 0.04, type: "spring", stiffness: 300 }}
    className="relative group/av"
  >
    <div className={`w-9 h-9 rounded-full bg-secondary/80 border-[2.5px] border-background flex items-center justify-center text-sm shadow-sm ${
      index > 0 ? "-ml-2.5" : ""
    } ${member.status === "studying" ? "ring-2 ring-emerald-400/30" : ""}`}>
      {member.avatar}
    </div>
    {isHost && index === 0 && (
      <Crown className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 text-amber-400 drop-shadow-sm" />
    )}
    {member.status === "studying" && (
      <span className="absolute -bottom-0.5 -right-0.5">
        <PulsingDot size="w-2.5 h-2.5" />
      </span>
    )}
    <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-foreground/95 backdrop-blur-sm text-background text-[9px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover/av:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
      {member.name}
      <span className="text-background/50 ml-1">{member.status === "studying" ? "• studying" : "• idle"}</span>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground/95 rotate-45" />
    </div>
  </motion.div>
);

const RoomCard = ({ room, vibe, onCopy, onDelete, onJoin, index }) => {
  const studyingCount = room.members.filter((m) => m.status === "studying").length;
  const isFull = room.members.length >= room.maxMembers;
  const fillPercent = (room.members.length / room.maxMembers) * 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, x: -50, filter: "blur(6px)" }}
      transition={{ type: "spring", stiffness: 180, damping: 20, delay: index * 0.04 }}
      className={`relative rounded-[20px] border ${vibe.border} overflow-hidden group ${vibe.glow} transition-all duration-300`}
    >
      {/* Top gradient stripe */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${vibe.stripe}`} />

      <div className={`relative bg-gradient-to-br ${vibe.bg} p-5 md:p-6`}>
        {/* Decorative orbs */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${vibe.accentBg} opacity-30 blur-3xl pointer-events-none`} />
        <div className={`absolute -bottom-8 -left-8 w-24 h-24 rounded-full ${vibe.accentBg} opacity-20 blur-2xl pointer-events-none`} />

        {/* Row 1: Name + Topic + Actions */}
        <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
              <h3 className="font-display font-black text-[17px] text-foreground truncate leading-none">{room.name}</h3>
              {room.isPrivate ? (
                <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.15em] bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400 px-2 py-0.5 rounded-md border border-purple-200/50 dark:border-purple-500/20">
                  <Lock className="w-2.5 h-2.5" /> Private
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.15em] bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-500/20">
                  <Unlock className="w-2.5 h-2.5" /> Open
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {room.topic && (
                <p className={`text-[11px] font-medium flex items-center gap-1 ${vibe.accent}`}>
                  <Radio className="w-3 h-3" /> {room.topic}
                </p>
              )}
              {room.timer && (
                <p className="text-[11px] text-muted-foreground font-mono font-medium flex items-center gap-1">
                  <Timer className="w-3 h-3" /> {room.timer}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onCopy(room.code)}
              className="p-2 rounded-xl text-muted-foreground/40 hover:text-foreground hover:bg-secondary/60 transition-all" title="Copy code">
              <Copy className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(room._id || room.id)}
              className="p-2 rounded-xl text-muted-foreground/20 hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        {/* Row 2: Members + capacity bar + Join */}
        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatars */}
            <div className="flex items-center shrink-0">
              {room.members.slice(0, 4).map((m, i) => (
                <MemberAvatar key={m.name} member={m} index={i} isHost={true} />
              ))}
              {room.members.length > 4 && (
                <div className="w-9 h-9 -ml-2.5 rounded-full bg-secondary/80 border-[2.5px] border-background flex items-center justify-center text-[10px] font-black text-muted-foreground shadow-sm">
                  +{room.members.length - 4}
                </div>
              )}
            </div>

            {/* Capacity + studying */}
            <div className="flex-1 min-w-0 hidden sm:block">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3" /> {room.members.length}/{room.maxMembers}
                </span>
                <span className="text-[9px] font-bold flex items-center gap-1">
                  <PulsingDot size="w-1.5 h-1.5" />
                  <span className="text-emerald-500">{studyingCount} active</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${
                    fillPercent >= 80 ? "from-red-400 to-orange-400" : fillPercent >= 50 ? "from-amber-400 to-yellow-400" : "from-emerald-400 to-green-400"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Code + Join */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onCopy(room.code)}
              className="text-[10px] font-mono font-bold text-muted-foreground/60 bg-secondary/60 hover:bg-secondary px-2.5 py-1.5 rounded-lg border border-border/20 transition-colors hidden sm:block"
            >
              {room.code}
            </button>
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onJoin(room)}
              disabled={isFull}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-display font-bold transition-all ${
                isFull
                  ? "bg-secondary text-muted-foreground cursor-not-allowed"
                  : "bg-foreground text-background shadow-lg shadow-foreground/10 hover:shadow-xl hover:shadow-foreground/15"
              }`}
            >
              <DoorOpen className="w-3.5 h-3.5" />
              {isFull ? "Full" : "Join Room"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StudyRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/rooms`);
      setRooms(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load rooms");
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      const { data } = await axios.post(`${API_URL}/api/rooms`, {
        name: newRoomName,
        topic: newTopic,
        isPrivate
      });
      setRooms([data, ...rooms]);
      setNewRoomName("");
      setNewTopic("");
      setShowCreate(false);
      toast.success("Room created!");
      navigate(`/rooms/${data._id}`);
    } catch (err) {
      toast.error("Failed to create room");
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Room code copied!");
  };

  const joinRoom = (room) => {
    navigate(`/rooms/${room._id}`);
  };

  const deleteRoom = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/rooms/${id}`);
      setRooms(rooms.filter((r) => (r._id || r.id) !== id));
    } catch (e) {
      toast.error("Failed to delete room");
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || (filterType === "public" && !r.isPrivate) || (filterType === "private" && r.isPrivate);
    return matchSearch && matchType;
  });

  const totalStudying = rooms.reduce((s, r) => s + r.members.filter((m) => m.status === "studying").length, 0);
  const totalMembers = rooms.reduce((s, r) => s + r.members.length, 0);

  return (
    <PageTransition>
      <div className="min-h-screen p-4 md:p-8 pt-20 max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between">
          <div>
            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">
              <Headphones className="w-3.5 h-3.5" /> Study Together
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-foreground tracking-tight leading-none">Study Rooms</h1>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl font-display font-bold text-sm shadow-lg">
            <Plus className="w-4 h-4" /> New Room
          </motion.button>
        </motion.div>

        {/* Live Banner */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl soft-shadow overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.03] via-transparent to-primary/[0.03]" />
          <div className="relative p-4 flex items-center gap-4">
            <div className="relative shrink-0">
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-400/20 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-emerald-500" />
              </motion.div>
              <span className="absolute -top-0.5 -right-0.5"><PulsingDot /></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                <span className="text-emerald-500">{totalStudying}</span> studying now
                <span className="text-muted-foreground/30">•</span>
                <span className="text-muted-foreground text-xs font-normal">{totalMembers} online across {rooms.length} rooms</span>
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                {ROOM_VIBES.slice(0, 4).map((v, i) => (
                  <span key={i} className={`text-[9px] font-bold ${v.accent} ${v.accentBg} px-2 py-0.5 rounded-md`}>{v.tag}</span>
                ))}
              </div>
            </div>
            <div className="flex -space-x-2 shrink-0">
              {["🧑‍💻", "🧙", "🤖", "⚛️", "🦉"].map((e, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 + i * 0.04 }}
                  className="w-8 h-8 rounded-full bg-secondary/80 border-2 border-background flex items-center justify-center text-xs shadow-sm">
                  {e}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Create Form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }} transition={{ type: "spring", stiffness: 200, damping: 22 }} className="overflow-hidden">
              <div className="glass rounded-2xl p-5 soft-shadow border border-primary/10 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-display font-bold text-foreground">Create Room</span>
                </div>
                <input type="text" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="Room name..."
                  className="w-full bg-background text-foreground rounded-xl px-4 py-3 text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/50" onKeyDown={(e) => e.key === "Enter" && createRoom()} autoFocus />
                <input type="text" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="Current topic (optional)..."
                  className="w-full bg-background/50 text-foreground rounded-xl px-4 py-2.5 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 border border-border/30" />
                <div className="flex items-center gap-3">
                  <motion.button whileTap={{ scale: 0.92 }} onClick={() => setIsPrivate(!isPrivate)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isPrivate ? "bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/20" : "bg-secondary/50 text-muted-foreground border-border/30 hover:text-foreground"}`}>
                    {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    {isPrivate ? "Private" : "Public"}
                  </motion.button>
                  <div className="flex-1" />
                  <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">Cancel</button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={createRoom}
                    className="bg-foreground text-background px-5 py-2 rounded-xl text-xs font-bold shadow-md">Create</motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + Filters */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rooms or codes..."
              className="w-full bg-secondary/40 text-foreground rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border/20 transition-all focus:bg-secondary/60" />
          </div>
          <div className="flex gap-0.5 bg-secondary/50 rounded-xl p-0.5 border border-border/20 shrink-0">
            {[
              { key: "all", label: "All", count: rooms.length },
              { key: "public", label: "Open", count: rooms.filter(r => !r.isPrivate).length },
              { key: "private", label: "Private", count: rooms.filter(r => r.isPrivate).length },
            ].map((f) => (
              <button key={f.key} onClick={() => setFilterType(f.key)} className="relative px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all">
                {filterType === f.key && (
                  <motion.div layoutId="rf2" className="absolute inset-0 bg-foreground rounded-[10px]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                )}
                <span className={`relative z-10 flex items-center gap-1 ${filterType === f.key ? "text-background" : "text-muted-foreground"}`}>
                  {f.label} <span className={`text-[9px] ${filterType === f.key ? "text-background/50" : "text-muted-foreground/40"}`}>{f.count}</span>
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Room Cards */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredRooms.map((room, idx) => (
              <RoomCard key={room._id || room.id} room={room} vibe={getVibe(room._id || room.id)} onCopy={copyCode} onDelete={deleteRoom} onJoin={joinRoom} index={idx} />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty */}
        {filteredRooms.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <motion.div animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-5 inline-block">🏠</motion.div>
            <p className="font-display font-black text-foreground text-xl">No rooms found</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              {search ? "Try a different search" : "Create the first room to start studying together!"}
            </p>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default StudyRooms;
