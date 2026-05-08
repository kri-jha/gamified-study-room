import { createContext, useContext, useEffect, useState } from "react";
import API_URL from "@/config";

const AuthContext = createContext({ 
  user: null, 
  session: null, 
  profile: null, 
  loading: true, 
  signOut: async () => {}, 
  refreshProfile: async () => {},
  signIn: async () => {},
  signUp: async () => {} 
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null); // maps to token
  const [user, setUser] = useState(null); // basic auth details
  const [profile, setProfile] = useState(null); // profile details
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          id: data._id,
          user_id: data._id,
          username: data.username,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          bio: data.bio,
          contact_no: data.contact_no,
          theme: data.theme,
          // XP & stats
          xp: data.xp || 0,
          totalStudySeconds: data.totalStudySeconds || 0,
          studyDays: data.studyDays || []
        });
        setUser({ id: data._id, email: data.email });
        setSession({ access_token: token });
      } else if (res.status === 401) {
        // Token invalid/expired — log out
        signOut();
      }
      // For other errors (500, network), keep current state, don't log out
    } catch (err) {
      console.error("fetchProfile error:", err);
      // Network error — don't sign out, backend may be temporarily down
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchProfile(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    
    localStorage.setItem("access_token", data.token);
    setSession({ access_token: data.token });
    setUser({ id: data.user.id, email: data.user.email });
    await fetchProfile(data.token);
    return { data, error: null };
  };

  const signUp = async (email, password, full_name, username) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name, username })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    localStorage.setItem("access_token", data.token);
    setSession({ access_token: data.token });
    setUser({ id: data.user.id, email: data.user.email });
    await fetchProfile(data.token);
    return { data, error: null };
  };

  const signOut = async () => {
    localStorage.removeItem("access_token");
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem("access_token");
    if (token) await fetchProfile(token);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};
