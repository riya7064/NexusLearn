import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getUserProfile, 
  updateUserProfile,
  getUserQuizzes,
  getUserCodeSessions,
  getUserPomodoroSessions,
  getUserChatSessions,
  getUserPDFs,
} from "@/lib/firestore";
import { toast } from "sonner";
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  FileText,
  Code2,
  Settings,
  Bell,
  Shield,
  Clock,
  MessageSquare,
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [stats, setStats] = useState({
    studyHours: 0,
    quizzes: 0,
    codeSessions: 0,
    chatSessions: 0,
    savedPDFs: 0,
    dayStreak: 0,
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const data = await getUserProfile(user.uid);
      setProfile(data);
      setDisplayName(data?.displayName || user.displayName || "");
      setDepartment(data?.department || "");
      setBio(data?.bio || "");
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    try {
      const [quizzes, codeSessions, pomodoroSessions, chatSessions, pdfs] = await Promise.all([
        getUserQuizzes(user.uid),
        getUserCodeSessions(user.uid),
        getUserPomodoroSessions(user.uid, 30),
        getUserChatSessions(user.uid),
        getUserPDFs(user.uid),
      ]);

      // Calculate study hours from Pomodoro sessions (25 min sessions)
      const totalMinutes = pomodoroSessions.length * 25;
      const studyHours = Math.round((totalMinutes / 60) * 10) / 10;

      // Calculate day streak (simplified - count consecutive days with activity)
      const dayStreak = calculateStreak(pomodoroSessions);

      setStats({
        studyHours,
        quizzes: quizzes.length,
        codeSessions: codeSessions.length,
        chatSessions: chatSessions.length,
        savedPDFs: pdfs.length,
        dayStreak,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const calculateStreak = (sessions: any[]) => {
    if (sessions.length === 0) return 0;
    
    // Sort sessions by date (most recent first)
    const sortedSessions = [...sessions].sort((a, b) => 
      b.createdAt?.toMillis() - a.createdAt?.toMillis()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sortedSessions) {
      const sessionDate = session.createdAt?.toDate();
      if (!sessionDate) continue;
      
      sessionDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, {
        displayName,
        department,
        bio,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const getJoinedDate = () => {
    if (user?.metadata?.creationTime) {
      const date = new Date(user.metadata.creationTime);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return "Recently";
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-32 bg-gradient-lime relative">
            <div className="absolute -bottom-12 left-6">
              <Avatar className="w-24 h-24 rounded-2xl border-4 border-card shadow-card">
                <AvatarImage src={user.photoURL || ''} alt={displayName} />
                <AvatarFallback className="text-4xl font-bold">
                  {displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <div className="pt-16 pb-6 px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{displayName || user.email}</h2>
                <p className="text-muted-foreground">{department || bio || "Student"}</p>
              </div>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Update your profile information</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department/Major</Label>
                      <Input
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself"
                      />
                    </div>
                    <Button onClick={handleSaveProfile} className="w-full">
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
              <div className="bg-secondary/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <p className="text-2xl font-bold">{stats.studyHours}h</p>
                </div>
                <p className="text-sm text-muted-foreground">Study Hours</p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-primary" />
                  <p className="text-2xl font-bold">{stats.quizzes}</p>
                </div>
                <p className="text-sm text-muted-foreground">Quizzes</p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Code2 className="w-4 h-4 text-primary" />
                  <p className="text-2xl font-bold">{stats.codeSessions}</p>
                </div>
                <p className="text-sm text-muted-foreground">Code Sessions</p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <p className="text-2xl font-bold">{stats.dayStreak}</p>
                </div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Info */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h3 className="font-bold text-lg mb-4">Account Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-medium">{displayName || user.displayName || "Not set"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <GraduationCap className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium">{department || "Not set"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium">{getJoinedDate()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h3 className="font-bold text-lg mb-4">Your Activity</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Saved PDFs</span>
                </div>
                <span className="text-sm text-muted-foreground">{stats.savedPDFs} items</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <span className="font-medium">AI Chat Sessions</span>
                </div>
                <span className="text-sm text-muted-foreground">{stats.chatSessions} chats</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Code2 className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Code Analysis</span>
                </div>
                <span className="text-sm text-muted-foreground">{stats.codeSessions} sessions</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Quiz Attempts</span>
                </div>
                <span className="text-sm text-muted-foreground">{stats.quizzes} quizzes</span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="md:col-span-2 bg-card rounded-2xl p-6 shadow-card">
            <h3 className="font-bold text-lg mb-4">Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">General</span>
              </button>
              
              <button className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Notifications</span>
              </button>
              
              <button className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Privacy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
