// Fun study reminder messages grouped by vibe
const REMINDER_MESSAGES = {
  motivational: [
    { title: "⚡ Time to Level Up!", body: "Your brain XP bar is waiting. Get back to studying!" },
    { title: "🔥 Streak Alert!", body: "Don't let your study streak die! Start a session now." },
    { title: "🏆 Champions Study!", body: "Top rankers are grinding right now. Join them!" },
    { title: "💎 Rare Drop Incoming!", body: "Knowledge is the rarest loot. Go farm some!" },
    { title: "🚀 Launch Sequence!", body: "3... 2... 1... Time to blast through your notes!" },
  ],
  funny: [
    { title: "📚 Your Books Miss You", body: "They've been crying on the shelf. Give them attention!" },
    { title: "🧠 Brain.exe Idle", body: "Your brain is running a screensaver. Wake it up!" },
    { title: "🐌 Procrastination Boss", body: "A wild Procrastination appeared! Use Study to defeat it!" },
    { title: "🎮 Side Quest Available", body: "New quest: Open your textbook for 25 minutes. Reward: Knowledge!" },
    { title: "🤖 System Alert", body: "Warning: Intelligence levels dropping. Immediate study required!" },
  ],
  chill: [
    { title: "🌿 Gentle Reminder", body: "Hey, whenever you're ready — your study session awaits." },
    { title: "☕ Coffee & Study?", body: "Grab a drink and ease into a focused session." },
    { title: "🎵 Lo-fi & Learn", body: "Put on some chill beats and start studying." },
    { title: "🌙 Peaceful Progress", body: "Even 15 minutes of study moves you forward." },
    { title: "✨ Small Steps", body: "You don't have to be perfect. Just start." },
  ],
  breaks: [
    { title: "🧘 Break Time!", body: "You've been grinding! Stretch, hydrate, breathe." },
    { title: "🎉 Great Session!", body: "Take 5. You earned it, champion!" },
    { title: "👀 Eye Rest", body: "Look away from the screen for 20 seconds. Your eyes thank you!" },
    { title: "💧 Hydration Check", body: "Have you had water recently? Stay hydrated, stay sharp!" },
  ],
};

export function getRandomMessage(vibe = "motivational") {
  const messages = REMINDER_MESSAGES[vibe] || REMINDER_MESSAGES.motivational;
  return messages[Math.floor(Math.random() * messages.length)];
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

export function sendNotification(vibe = "motivational") {
  if (Notification.permission !== "granted") return null;
  const msg = getRandomMessage(vibe);
  const notification = new Notification(msg.title, {
    body: msg.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [200, 100, 200],
    tag: "study-reminder",
    renotify: true,
  });
  return notification;
}

// Timer manager for scheduling reminders
class ReminderScheduler {
  constructor() {
    this.timers = [];
    this.breakTimer = null;
  }

  clearAll() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    if (this.breakTimer) {
      clearInterval(this.breakTimer);
      this.breakTimer = null;
    }
  }

  // Schedule reminders at specific times today
  scheduleAtTimes(times, vibe) {
    const now = new Date();
    times.forEach((timeStr) => {
      const [h, m] = timeStr.split(":").map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) {
        // Schedule for tomorrow
        target.setDate(target.getDate() + 1);
      }
      const delay = target - now;
      const timer = setTimeout(() => {
        sendNotification(vibe);
        // Re-schedule for next day
        this.scheduleAtTimes([timeStr], vibe);
      }, delay);
      this.timers.push(timer);
    });
  }

  // Schedule reminders at an interval (in minutes)
  scheduleInterval(minutes, vibe) {
    const ms = minutes * 60 * 1000;
    const timer = setInterval(() => sendNotification(vibe), ms);
    this.breakTimer = timer;
  }

  // Smart break: notify after X minutes of study
  scheduleSmartBreak(studyMinutes) {
    const ms = studyMinutes * 60 * 1000;
    const timer = setTimeout(() => {
      sendNotification("breaks");
    }, ms);
    this.timers.push(timer);
    return timer;
  }
}

export const reminderScheduler = new ReminderScheduler();
