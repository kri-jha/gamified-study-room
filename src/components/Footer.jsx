import { Link } from "react-router-dom";
import { Sparkles, Github, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-extrabold text-base">Productivity</span>
            </div>
            <p className="text-sm opacity-60 leading-relaxed">
              Level up your study game. Track hours, build streaks, and climb the ranks with your friends.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-display font-bold text-sm mb-4">Features</h4>
            <ul className="space-y-2.5 text-sm opacity-60">
              <li><Link to="/timer" className="hover:opacity-100 transition-opacity">Focus Timer</Link></li>
              <li><Link to="/quests" className="hover:opacity-100 transition-opacity">Daily Quests</Link></li>
              <li><Link to="/rooms" className="hover:opacity-100 transition-opacity">Study Rooms</Link></li>
              <li><Link to="/profile" className="hover:opacity-100 transition-opacity">Rank System</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold text-sm mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm opacity-60">
              <li><a href="#" className="hover:opacity-100 transition-opacity">About</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Blog</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Careers</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Contact</a></li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-display font-bold text-sm mb-4">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-40">© 2026 Productivity. All rights reserved.</p>
          <div className="flex gap-6 text-sm opacity-40">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
