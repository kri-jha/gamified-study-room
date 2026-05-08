/**
 * saveSession.js
 * Shared utility: saves a completed study session to the backend.
 * Both StudyTimer and StudyRoomSession call this when the user stops the clock.
 *
 * XP Rate: 1 XP per 2 minutes studied.
 * Bonus  : +2 XP for every complete hour.
 *
 * @param {string} userId   - MongoDB user._id
 * @param {number} seconds  - Total seconds studied in this session
 * @returns {{ xp, totalStudySeconds, xpGain } | null}
 */
import API_URL from "@/config";

export const saveSession = async (userId, seconds) => {
  if (!userId || seconds < 120) return null; // minimum 2 min

  try {
    const res = await fetch(`${API_URL}/api/users/${userId}/xp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ seconds }),
    });

    if (!res.ok) throw new Error("Failed to save session");
    return await res.json();
  } catch (err) {
    console.error("[saveSession] Error:", err);
    return null;
  }
};
