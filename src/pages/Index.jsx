import { Link } from "react-router-dom";
import { Timer, ListTodo, User, Users, Zap, Trophy, Flame, Sparkles, ArrowRight, Star, TrendingUp, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { mockUser } from "@/lib/mockData";
import { getRank } from "@/lib/ranks";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem } from "@/components/AnimationWrappers";
import heroImg from "@/assets/hero-study.png";
import streaksImg from "@/assets/feature-streaks.png";
import timerImg from "@/assets/feature-timer.png";
import roomsImg from "@/assets/feature-rooms.png";

const Index = () => {
  const rank = getRank(mockUser.totalStudyHours);

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
          {/* Background decoration */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl -z-10"
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl -z-10"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left - Copy */}
              <div className="space-y-6 text-center md:text-left">
                <FadeIn delay={0.1}>
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Gamified productivity for students
                  </div>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <h1 className="text-4xl md:text-6xl font-display font-extrabold text-foreground leading-tight">
                    Study smarter.
                    <br />
                    <span className="text-primary">Level up faster.</span>
                  </h1>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <p className="text-muted-foreground text-lg max-w-lg">
                    Track your study hours, build insane streaks, earn XP, and compete with friends.
                    The productivity app that actually makes studying fun. 💪
                  </p>
                </FadeIn>
                <FadeIn delay={0.4}>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        to="/signin"
                        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                      >
                        Get Started Free
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        to="/timer"
                        className="inline-flex items-center justify-center gap-2 bg-secondary text-foreground px-8 py-3.5 rounded-full font-bold text-sm hover:bg-secondary/80 transition-all"
                      >
                        Try the Timer
                      </Link>
                    </motion.div>
                  </div>
                </FadeIn>
                <FadeIn delay={0.5}>
                  <div className="flex items-center gap-4 justify-center md:justify-start pt-2">
                    <div className="flex -space-x-2">
                      {["🧑‍💻", "👩‍🎓", "🧑‍🎓", "👨‍💻"].map((emoji, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-sm"
                        >
                          {emoji}
                        </motion.div>
                      ))}
                    </div>
                    <div className="text-sm">
                      <span className="font-bold text-foreground">2,400+</span>
                      <span className="text-muted-foreground"> students grinding</span>
                    </div>
                  </div>
                </FadeIn>
              </div>

              {/* Right - Hero Image */}
              <FadeIn direction="left" delay={0.3}>
                <div className="flex justify-center md:justify-end">
                  <div className="relative">
                    <motion.div
                      className="w-full max-w-md"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <img src={heroImg} alt="Student studying with productivity tools" className="w-full h-auto" />
                    </motion.div>
                    {/* Floating stat cards */}
                    <motion.div
                      className="absolute -left-4 top-8 glass rounded-xl p-3 soft-shadow"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
                      transition={{ opacity: { delay: 0.8 }, x: { delay: 0.8 }, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-neon-orange" />
                        <div>
                          <p className="text-xs font-bold text-foreground">23 Day Streak</p>
                          <p className="text-[10px] text-muted-foreground">Keep going!</p>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      className="absolute -right-4 bottom-20 glass rounded-xl p-3 soft-shadow"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
                      transition={{ opacity: { delay: 1 }, x: { delay: 1 }, y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 } }}
                    >
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-rank-gold" />
                        <div>
                          <p className="text-xs font-bold text-foreground">Gold III</p>
                          <p className="text-[10px] text-muted-foreground">290h studied</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-border bg-card/50">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: "2.4K+", label: "Active Students" },
                { value: "50K+", label: "Hours Logged" },
                { value: "1.2M+", label: "Tasks Completed" },
                { value: "33", label: "Ranks to Climb" },
              ].map((stat) => (
                <StaggerItem key={stat.label}>
                  <p className="text-2xl md:text-3xl font-display font-extrabold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <FadeIn className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                Features
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
                Everything you need to stay on track
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                Built by students, for students. Every feature is designed to keep you motivated and accountable.
              </p>
            </FadeIn>

            {/* Feature 1 - Timer */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <FadeIn direction="right" className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-4">
                  <Timer className="w-3 h-3" />
                  Focus Timer
                </div>
                <h3 className="text-2xl font-display font-extrabold text-foreground mb-3">Anti-cheat focus timer</h3>
                <p className="text-muted-foreground mb-6">
                  Our smart timer detects when you switch tabs and pauses automatically. No more fake study hours — only real focus counts toward your rank.
                </p>
                <ul className="space-y-3">
                  {["Pauses on tab switch", "Earn 2 XP per minute", "Track total study hours"].map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </FadeIn>
              <ScaleIn className="order-1 md:order-2 flex justify-center">
                <motion.div
                  className="bg-secondary/50 rounded-3xl p-8 w-full max-w-sm"
                  whileHover={{ scale: 1.03, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img src={timerImg} alt="Focus timer feature" className="w-full h-auto" />
                </motion.div>
              </ScaleIn>
            </div>

            {/* Feature 2 - Streaks */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <ScaleIn className="flex justify-center">
                <motion.div
                  className="bg-secondary/50 rounded-3xl p-8 w-full max-w-sm"
                  whileHover={{ scale: 1.03, rotate: -1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img src={streaksImg} alt="Streak tracking feature" className="w-full h-auto" />
                </motion.div>
              </ScaleIn>
              <FadeIn direction="left">
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium mb-4">
                  <TrendingUp className="w-3 h-3" />
                  Streaks & Progress
                </div>
                <h3 className="text-2xl font-display font-extrabold text-foreground mb-3">Build your streak. Don't break it.</h3>
                <p className="text-muted-foreground mb-6">
                  Just like LeetCode, your contribution grid shows your daily consistency. The more tasks you complete, the darker the green. Stay consistent and watch your streak grow.
                </p>
                <ul className="space-y-3">
                  {["GitHub-style streak grid", "Color intensity based on completion %", "Max streak tracking"].map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </FadeIn>
            </div>

            {/* Feature 3 - Rooms */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <FadeIn direction="right" className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 bg-neon-purple/10 text-neon-purple px-3 py-1 rounded-full text-xs font-medium mb-4">
                  <Users className="w-3 h-3" />
                  Study Rooms
                </div>
                <h3 className="text-2xl font-display font-extrabold text-foreground mb-3">Study together, grow together</h3>
                <p className="text-muted-foreground mb-6">
                  Create or join study rooms with your friends. Share invite codes, see who's online, and keep each other accountable while grinding.
                </p>
                <ul className="space-y-3">
                  {["Create public or private rooms", "Share invite codes", "See live study buddies"].map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </FadeIn>
              <ScaleIn className="order-1 md:order-2 flex justify-center">
                <motion.div
                  className="bg-secondary/50 rounded-3xl p-8 w-full max-w-sm"
                  whileHover={{ scale: 1.03, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img src={roomsImg} alt="Study rooms feature" className="w-full h-auto" />
                </motion.div>
              </ScaleIn>
            </div>
          </div>
        </section>

        {/* Rank System Preview */}
        <section className="py-20 bg-card/50 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-rank-gold/10 text-rank-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Trophy className="w-4 h-4" />
                Rank System
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mb-4">From Bronze to Conqueror</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-12">
                33 ranks across 9 tiers. Start from Bronze V and grind your way to the legendary Conqueror rank at 2,200+ study hours.
              </p>
            </FadeIn>
            <StaggerContainer className="flex flex-wrap justify-center gap-3" staggerDelay={0.08}>
              {[
                { tier: "Bronze", icon: "🥉", color: "bg-rank-bronze/10 text-rank-bronze border-rank-bronze/20" },
                { tier: "Silver", icon: "🥈", color: "bg-rank-silver/10 text-rank-silver border-rank-silver/20" },
                { tier: "Gold", icon: "🥇", color: "bg-rank-gold/10 text-rank-gold border-rank-gold/20" },
                { tier: "Platinum", icon: "💎", color: "bg-rank-platinum/10 text-rank-platinum border-rank-platinum/20" },
                { tier: "Diamond", icon: "💠", color: "bg-rank-diamond/10 text-rank-diamond border-rank-diamond/20" },
                { tier: "Crown", icon: "👑", color: "bg-rank-crown/10 text-rank-crown border-rank-crown/20" },
                { tier: "Ace", icon: "🔥", color: "bg-rank-ace/10 text-rank-ace border-rank-ace/20" },
                { tier: "Conqueror", icon: "🏆", color: "bg-rank-conqueror/10 text-rank-conqueror border-rank-conqueror/20" },
              ].map((r) => (
                <StaggerItem key={r.tier}>
                  <motion.div
                    whileHover={{ scale: 1.08, y: -3 }}
                    className={`${r.color} border rounded-xl px-5 py-3 font-display font-bold text-sm flex items-center gap-2 cursor-default`}
                  >
                    <span className="text-lg">{r.icon}</span>
                    {r.tier}
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <FadeIn className="max-w-3xl mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mb-4">Ready to start grinding?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Join thousands of students who are leveling up their productivity every single day.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Start for Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </FadeIn>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
