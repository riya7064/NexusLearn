import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function WelcomeCard() {
  const { user } = useAuth();
  const name = user?.displayName?.split(' ')[0] || 'Student';
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  
  const quotes = [
    "The expert in anything was once a beginner.",
    "Success is the sum of small efforts repeated daily.",
    "Learn as if you will live forever.",
    "Education is the passport to the future.",
    "The beautiful thing about learning is that no one can take it away from you.",
  ];
  
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-lime p-6 lg:p-8 shadow-glow animate-fade-in">
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-foreground/10 rounded-full blur-3xl" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary-foreground/80" />
          <span className="text-sm font-medium text-primary-foreground/80 uppercase tracking-wider">
            {greeting}
          </span>
        </div>
        
        <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-3">
          Welcome back, {name} 👋
        </h1>
        
        <p className="text-primary-foreground/80 text-lg italic max-w-xl">
          "{quote}"
        </p>
      </div>
    </div>
  );
}
