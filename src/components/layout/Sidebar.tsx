import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Brain,
  Calendar,
  Code2,
  MessageSquare,
  Layers,
  BarChart3,
  User,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "PDF Summarizer", icon: FileText, path: "/pdf-summarizer" },
  { title: "Quiz Generator", icon: Brain, path: "/quiz" },
  { title: "Study Planner", icon: Calendar, path: "/planner" },
  { title: "Code Assistant", icon: Code2, path: "/coding" },
  { title: "AI Tutor", icon: MessageSquare, path: "/tutor" },
  { title: "Flashcards", icon: Layers, path: "/flashcards" },
  { title: "Saved Content", icon: Bookmark, path: "/saved" },
  { title: "Progress", icon: BarChart3, path: "/progress" },
  { title: "Profile", icon: User, path: "/profile" },
];

interface SidebarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export function Sidebar({ isDark, toggleTheme }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <div className="w-10 h-10 bg-gradient-lime rounded-xl flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight">StudyAI</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "animate-pulse-slow")} />
              {!collapsed && (
                <span className="font-medium text-sm">{item.title}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* User Info */}
        {user && !collapsed && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent/50 mb-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className={cn("w-full", collapsed ? "px-0 justify-center" : "justify-start")}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span className="ml-2">{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className={cn("w-full text-red-500 hover:text-red-600 hover:bg-red-50", collapsed ? "px-0 justify-center" : "justify-start")}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("w-full", collapsed ? "px-0 justify-center" : "justify-start")}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-2">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
