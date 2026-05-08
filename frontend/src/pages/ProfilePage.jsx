import RankBadge from "@/components/RankBadge";
import AllRanksModal from "@/components/AllRanksModal";
import StreakGrid from "@/components/StreakGrid";
import ProductivityCharts from "@/components/ProductivityCharts";
import FollowListModal from "@/components/FollowListModal";
import {
  Flame, Users, Globe, Clock, Star, Zap, Pencil,
  Eye, DoorOpen, Trophy, ExternalLink, Plus, Trash2, UserPlus, UserMinus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateStreakData = (days) => {
  const studySet = new Set(Array.isArray(days) ? days : []);
  const data = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const studied = studySet.has(dateStr);
    data.push({ date: dateStr, percentage: studied ? 100 : 0, level: studied ? 4 : 0 });
  }
  return data;
};

const calcCurrentStreak = (days) => {
  const studyDays = Array.isArray(days) ? days : [];
  if (!studyDays.length) return 0;
  const sorted = [...studyDays].sort().reverse();
  let streak = 0;
  let checkDate = new Date().toISOString().split("T")[0];
  for (const day of sorted) {
    if (day === checkDate) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    } else break;
  }
  return streak;
};

const calcMaxStreak = (days) => {
  const studyDays = Array.isArray(days) ? days : [];
  if (!studyDays.length) return 0;
  const sorted = [...studyDays].sort();
  let max = 1, curr = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round((new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000);
    if (diff === 1) { curr++; max = Math.max(max, curr); }
    else if (diff > 0) curr = 1;
  }
  return max;
};

// Known link labels mapped to icons/colors
const LINK_META = {
  github:    { icon: "🐙", color: "bg-gray-800 text-white dark:bg-gray-700" },
  linkedin:  { icon: "💼", color: "bg-blue-700 text-white" },
  twitter:   { icon: "🐦", color: "bg-sky-500 text-white" },
  x:         { icon: "✖️", color: "bg-black text-white" },
  youtube:   { icon: "▶️", color: "bg-red-600 text-white" },
  portfolio: { icon: "🌐", color: "bg-violet-600 text-white" },
  website:   { icon: "🔗", color: "bg-primary text-primary-foreground" },
  instagram: { icon: "📸", color: "bg-pink-600 text-white" },
  discord:   { icon: "💬", color: "bg-indigo-600 text-white" },
  default:   { icon: "🔗", color: "bg-secondary text-foreground" },
};

const getLinkMeta = (label) => {
  const key = label?.toLowerCase().trim();
  return LINK_META[key] || LINK_META.default;
};

// ─── Profile Page ─────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [ranksOpen, setRanksOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    aboutMe: "",
    links: [{ label: "", url: "" }, { label: "", url: "" }, { label: "", url: "" }, { label: "", url: "" }],
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Follow modal state
  const [followModal, setFollowModal] = useState({ open: false, type: "followers" });

  // Social stats from enriched profile
  const [socialProfile, setSocialProfile] = useState(null);
  const [globalRank, setGlobalRank] = useState(null);

  // Live presence
  const [isLive, setIsLive] = useState(() => !!localStorage.getItem("gazen_in_room"));
  useEffect(() => {
    const check = () => setIsLive(!!localStorage.getItem("gazen_in_room"));
    const interval = setInterval(check, 3000);
    window.addEventListener("storage", check);
    return () => { clearInterval(interval); window.removeEventListener("storage", check); };
  }, []);

  // Fetch enriched stats (followers, following, views, roomJoins) — no view increment for own profile
  useEffect(() => {
    if (!user?.id) return;
    const token = localStorage.getItem("access_token");
    fetch(`/api/users/${user.id}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setSocialProfile(data); })
      .catch(() => {});
  }, [user?.id, profile]);

  // Fetch leaderboard rank
  useEffect(() => {
    if (!user?.id) return;
    fetch("/api/users/leaderboard")
      .then((r) => r.ok ? r.json() : [])
      .then((users) => {
        const idx = users.findIndex((u) => u._id === user.id);
        setGlobalRank(idx >= 0 ? idx + 1 : null);
      })
      .catch(() => {});
  }, [user?.id, profile?.xp]);

  const streakData = useMemo(() => generateStreakData(profile?.studyDays), [profile?.studyDays]);
  const currentStreak = useMemo(() => calcCurrentStreak(profile?.studyDays), [profile?.studyDays]);
  const maxStreak = useMemo(() => calcMaxStreak(profile?.studyDays), [profile?.studyDays]);
  const totalStudyHours = Math.floor((profile?.totalStudySeconds || 0) / 3600);

  const openEdit = () => {
    const existing = profile?.links || [];
    const padded = [...existing];
    while (padded.length < 4) padded.push({ label: "", url: "" });
    setForm({
      name: profile?.full_name || profile?.username || user?.email?.split("@")[0] || "",
      aboutMe: profile?.bio || "",
      links: padded.slice(0, 4),
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditOpen(true);
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be less than 2MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const trimmedName = form.name.trim();
    if (!trimmedName) { toast.error("Name cannot be empty"); return; }
    if (trimmedName.length > 100) { toast.error("Name must be less than 100 characters"); return; }
    if (form.aboutMe.length > 500) { toast.error("About me must be less than 500 characters"); return; }

    setSaving(true);
    let avatarUrl = profile?.avatar_url || null;
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const uploadRes = await fetch("/api/users/avatar", {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
          body: formData
        });
        if (!uploadRes.ok) throw new Error("Failed to upload avatar");
        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.avatar_url;
      }

      const cleanLinks = form.links.filter((l) => l.url.trim());

      const updateRes = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({
          full_name: trimmedName,
          bio: form.aboutMe.trim(),
          avatar_url: avatarUrl,
          links: cleanLinks,
        })
      });

      if (!updateRes.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated!");
      await refreshProfile();
      setEditOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || (user && !profile)) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-medium">Initializing profile stats...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <p className="text-4xl">🔒</p>
            <h2 className="text-xl font-display font-bold text-foreground">Sign in to view your profile</h2>
            <p className="text-muted-foreground text-sm">Track your progress, rank, and streaks</p>
            <Link to="/signin" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold text-sm">
              Sign In
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User";
  const followersCount = socialProfile?.followers?.length ?? profile?.followers?.length ?? 0;
  const followingCount = socialProfile?.following?.length ?? profile?.following?.length ?? 0;
  const profileViews   = socialProfile?.profileViews ?? 0;
  const roomJoins      = socialProfile?.roomsJoined?.length ?? 0;
  const links          = profile?.links || socialProfile?.links || [];

  const stats = [
    { icon: <Flame className="w-5 h-5 text-neon-orange" />,    label: "Current Streak", value: `${currentStreak} days` },
    { icon: <Star className="w-5 h-5 text-neon-cyan" />,       label: "Max Streak",     value: `${maxStreak} days` },
    { icon: <Clock className="w-5 h-5 text-neon-purple" />,    label: "Total Hours",    value: `${totalStudyHours}h` },
    { icon: <Globe className="w-5 h-5 text-primary" />,        label: "Global Rank",    value: globalRank ? `#${globalRank}` : "--" },
    { icon: <Users className="w-5 h-5 text-neon-pink" />,      label: "Followers",      value: followersCount, clickType: "followers" },
    { icon: <Eye className="w-5 h-5 text-neon-cyan" />,        label: "Profile Views",  value: profileViews },
    { icon: <DoorOpen className="w-5 h-5 text-neon-orange" />, label: "Rooms Joined",   value: roomJoins },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen p-4 md:p-8 pt-20 max-w-6xl mx-auto space-y-6">

        {/* ── Header Card ────────────────────────────────────────────────── */}
        <div className="glass rounded-2xl p-6 soft-shadow">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="w-28 h-28 rounded-2xl border border-border">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={displayName} className="object-cover" />
                ) : null}
                <AvatarFallback className="rounded-2xl bg-secondary text-5xl">🧑‍💻</AvatarFallback>
              </Avatar>
              {isLive && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4" title="Currently in a study room">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-background" />
                </span>
              )}
              <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-xs font-display font-bold">
                Lv{Math.floor(totalStudyHours / 50)}
              </div>
            </div>

            {/* Name / Bio / Links */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-3xl font-display font-extrabold text-foreground">{displayName}</h1>
                <button
                  onClick={openEdit}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  title="Edit profile"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>

              {profile?.bio && (
                <p className="text-foreground/80 text-sm mt-3 max-w-md">{profile.bio}</p>
              )}

              {/* Social Links */}
              {links.filter((l) => l.url).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  {links.filter((l) => l.url).map((link, i) => {
                    const meta = getLinkMeta(link.label);
                    return (
                      <motion.a
                        key={i}
                        href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${meta.color} transition-all shadow-sm`}
                      >
                        <span>{meta.icon}</span>
                        <span>{link.label || "Link"}</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </motion.a>
                    );
                  })}
                </div>
              )}

              {/* Rank badge */}
              <div className="mt-4 cursor-pointer" onClick={() => setRanksOpen(true)}>
                <RankBadge hours={totalStudyHours} size="md" />
              </div>
            </div>

            {/* Right panel: XP + Follow counts */}
            <div className="flex flex-col gap-3 items-center shrink-0">
              {/* XP */}
              <div className="flex flex-col items-center gap-1 bg-primary/5 rounded-xl px-5 py-3 border border-primary/10 w-full">
                <Zap className="w-5 h-5 text-primary" />
                <p className="text-2xl font-display font-bold text-primary">{(profile?.xp || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XP Points</p>
              </div>

              {/* Global Rank pill */}
              {globalRank && (
                <div
                  className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 cursor-pointer hover:bg-amber-500/15 transition-colors w-full justify-center"
                  onClick={() => setRanksOpen(true)}
                >
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">Rank #{globalRank}</span>
                </div>
              )}

              {/* Follow counts */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setFollowModal({ open: true, type: "followers" })}
                  className="flex-1 flex flex-col items-center bg-secondary/60 hover:bg-secondary rounded-xl px-3 py-2 transition-colors"
                >
                  <span className="text-base font-display font-bold text-foreground">{followersCount}</span>
                  <span className="text-[10px] text-muted-foreground">Followers</span>
                </button>
                <button
                  onClick={() => setFollowModal({ open: true, type: "following" })}
                  className="flex-1 flex flex-col items-center bg-secondary/60 hover:bg-secondary rounded-xl px-3 py-2 transition-colors"
                >
                  <span className="text-base font-display font-bold text-foreground">{followingCount}</span>
                  <span className="text-[10px] text-muted-foreground">Following</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -2, scale: 1.02 }}
              onClick={stat.clickType ? () => setFollowModal({ open: true, type: stat.clickType }) : undefined}
              className={`glass rounded-xl p-4 text-center soft-shadow ${stat.clickType ? "cursor-pointer" : ""}`}
            >
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className="text-lg font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <StreakGrid data={streakData} />
        <ProductivityCharts />
      </div>

      {/* ── Edit Profile Dialog ───────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer group border border-border bg-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview || profile?.avatar_url ? (
                  <img src={avatarPreview || profile?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🧑‍💻</div>
                )}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-foreground" />
                </div>
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-primary hover:underline">
                Change photo
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                maxLength={100}
                placeholder="Your name"
              />
            </div>

            {/* About Me */}
            <div className="space-y-2">
              <Label htmlFor="edit-about">About Me</Label>
              <Textarea
                id="edit-about"
                value={form.aboutMe}
                onChange={(e) => setForm((f) => ({ ...f, aboutMe: e.target.value }))}
                maxLength={500}
                placeholder="Tell us about yourself..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">{form.aboutMe.length}/500</p>
            </div>

            {/* Social Links */}
            <div className="space-y-2">
              <Label>Social & Portfolio Links (up to 4)</Label>
              <div className="space-y-2">
                {form.links.map((link, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-lg w-6 text-center">{getLinkMeta(link.label).icon}</span>
                    <Input
                      placeholder="Label (e.g. GitHub)"
                      value={link.label}
                      onChange={(e) => {
                        const updated = [...form.links];
                        updated[i] = { ...updated[i], label: e.target.value };
                        setForm((f) => ({ ...f, links: updated }));
                      }}
                      className="w-28 shrink-0 text-sm"
                    />
                    <Input
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...form.links];
                        updated[i] = { ...updated[i], url: e.target.value };
                        setForm((f) => ({ ...f, links: updated }));
                      }}
                      className="flex-1 text-sm"
                    />
                    {(link.label || link.url) && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...form.links];
                          updated[i] = { label: "", url: "" };
                          setForm((f) => ({ ...f, links: updated }));
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Labels like "GitHub", "LinkedIn", "Portfolio" get a matching icon automatically.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <AllRanksModal open={ranksOpen} onClose={() => setRanksOpen(false)} currentHours={totalStudyHours} />
      <FollowListModal
        open={followModal.open}
        onClose={() => setFollowModal((s) => ({ ...s, open: false }))}
        userId={user?.id}
        type={followModal.type}
      />
    </PageTransition>
  );
};

export default ProfilePage;
