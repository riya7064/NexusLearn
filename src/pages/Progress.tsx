import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserQuizzes,
  getUserCodeSessions,
  getUserPomodoroSessions,
  getUserChatSessions,
  getUserPDFs,
  getUserFlashcardSets,
} from "@/lib/firestore";
import {
  Clock,
  Brain,
  Code2,
  Flame,
  Trophy,
  TrendingUp,
  Calendar,
  FileText,
  MessageSquare,
  Layers,
} from "lucide-react";

export default function Progress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHours: 0,
    quizCount: 0,
    codeCount: 0,
    streak: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [quizPerformance, setQuizPerformance] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [quizzes, codeSessions, pomodoroSessions, chatSessions, pdfs, flashcardSets] = await Promise.all([
        getUserQuizzes(user.uid),
        getUserCodeSessions(user.uid),
        getUserPomodoroSessions(user.uid, 30),
        getUserChatSessions(user.uid),
        getUserPDFs(user.uid),
        getUserFlashcardSets(user.uid),
      ]);

      // Calculate total study hours from Pomodoro sessions
      const totalMinutes = pomodoroSessions.length * 25;
      const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

      // Calculate streak
      const streak = calculateStreak(pomodoroSessions);

      setStats({
        totalHours,
        quizCount: quizzes.length,
        codeCount: codeSessions.length,
        streak,
      });

      // Build weekly data
      const weekly = buildWeeklyData(pomodoroSessions);
      setWeeklyData(weekly);

      // Build recent activity
      const activity = buildRecentActivity(quizzes, pdfs, codeSessions, flashcardSets, pomodoroSessions);
      setRecentActivity(activity);

      // Build quiz performance (group by subject/title)
      const performance = buildQuizPerformance(quizzes);
      setQuizPerformance(performance);

    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (sessions: any[]) => {
    if (sessions.length === 0) return 0;
    
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

  const buildWeeklyData = (sessions: any[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayName = days[date.getDay()];
      const sessionsOnDay = sessions.filter(s => {
        const sessionDate = s.createdAt?.toDate();
        if (!sessionDate) return false;
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === date.getTime();
      });

      const hours = Math.round((sessionsOnDay.length * 25 / 60) * 10) / 10;
      
      weekData.push({
        day: dayName,
        hours,
        color: hours > 4 ? "bg-primary" : hours > 2 ? "bg-primary/70" : "bg-primary/50"
      });
    }

    return weekData;
  };

  const buildRecentActivity = (quizzes: any[], pdfs: any[], code: any[], flashcards: any[], pomodoro: any[]) => {
    const activities: any[] = [];

    // Add recent quizzes
    quizzes.slice(0, 2).forEach(quiz => {
      activities.push({
        type: "quiz",
        title: quiz.title || "Quiz",
        score: quiz.results?.score ? `${quiz.results.score}%` : undefined,
        time: formatTimeAgo(quiz.createdAt),
        timestamp: quiz.createdAt?.toMillis() || 0,
      });
    });

    // Add recent PDFs
    pdfs.slice(0, 1).forEach(pdf => {
      activities.push({
        type: "pdf",
        title: `${pdf.title || pdf.fileName} Summary`,
        time: formatTimeAgo(pdf.createdAt),
        timestamp: pdf.createdAt?.toMillis() || 0,
      });
    });

    // Add recent code sessions
    code.slice(0, 1).forEach(session => {
      activities.push({
        type: "code",
        title: session.title || `${session.language} Code Session`,
        time: formatTimeAgo(session.createdAt),
        timestamp: session.createdAt?.toMillis() || 0,
      });
    });

    // Add recent flashcards
    flashcards.slice(0, 1).forEach(set => {
      activities.push({
        type: "flashcard",
        title: `Reviewed ${set.cards?.length || 0} cards`,
        time: formatTimeAgo(set.createdAt),
        timestamp: set.createdAt?.toMillis() || 0,
      });
    });

    // Count today's pomodoro sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = pomodoro.filter(s => {
      const sessionDate = s.createdAt?.toDate();
      if (!sessionDate) return false;
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    if (todaySessions.length > 0) {
      activities.push({
        type: "pomodoro",
        title: `${todaySessions.length} focus session${todaySessions.length > 1 ? 's' : ''}`,
        time: "Today",
        timestamp: Date.now(),
      });
    }

    // Sort by most recent
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  };

  const buildQuizPerformance = (quizzes: any[]) => {
    const subjects = new Map<string, { totalScore: number; count: number }>();

    quizzes.forEach(quiz => {
      if (quiz.results?.score) {
        const subject = quiz.title?.split(' ')[0] || 'General';
        const existing = subjects.get(subject) || { totalScore: 0, count: 0 };
        subjects.set(subject, {
          totalScore: existing.totalScore + quiz.results.score,
          count: existing.count + 1,
        });
      }
    });

    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
    
    return Array.from(subjects.entries())
      .map(([subject, data], index) => ({
        subject,
        score: Math.round(data.totalScore / data.count),
        color: colors[index % colors.length],
      }))
      .slice(0, 4);
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Recently";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Progress Dashboard</h1>
          <p className="text-muted-foreground">Track your learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Hours", value: stats.totalHours.toString(), icon: Clock, change: loading ? "..." : "+12%" },
            { label: "Quizzes Completed", value: stats.quizCount.toString(), icon: Brain, change: loading ? "..." : `+${stats.quizCount}` },
            { label: "Code Sessions", value: stats.codeCount.toString(), icon: Code2, change: loading ? "..." : `+${stats.codeCount}` },
            { label: "Current Streak", value: stats.streak.toString(), icon: Flame, suffix: "days" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl p-5 shadow-card animate-slide-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{stat.value}</span>
                {stat.suffix && <span className="text-sm text-muted-foreground">{stat.suffix}</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Weekly Study Hours</h3>
              {!loading && weeklyData.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span>Last 7 days</span>
                </div>
              )}
            </div>
            
            {loading ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : weeklyData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No study data yet. Start a Pomodoro session!
              </div>
            ) : (
              <div className="flex items-end justify-between h-48 gap-2">
                {weeklyData.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-secondary rounded-lg overflow-hidden" style={{ height: "160px" }}>
                      <div
                        className={cn("w-full rounded-lg transition-all duration-500", day.color)}
                        style={{ height: `${Math.min((day.hours / 8) * 100, 100)}%`, marginTop: `${100 - Math.min((day.hours / 8) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                    <span className="text-xs font-medium">{day.hours}h</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quiz Performance */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h3 className="font-bold text-lg mb-6">Quiz Performance</h3>
            
            {loading ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : quizPerformance.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-center text-muted-foreground">
                No quiz results yet
              </div>
            ) : (
              <div className="space-y-4">
                {quizPerformance.map((item) => (
                  <div key={item.subject}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.subject}</span>
                      <span className="font-semibold">{item.score}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", item.color)}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Heatmap - Removed for now, can add later with real data */}
        
        {/* Recent Activity */}
        <div className="mt-6 bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-bold text-lg mb-6">Recent Activity</h3>
          
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading...</div>
          ) : recentActivity.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No activity yet. Start studying to see your progress!
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    {activity.type === "quiz" && <Brain className="w-5 h-5 text-purple-500" />}
                    {activity.type === "pdf" && <FileText className="w-5 h-5 text-blue-500" />}
                    {activity.type === "code" && <Code2 className="w-5 h-5 text-green-500" />}
                    {activity.type === "flashcard" && <Layers className="w-5 h-5 text-orange-500" />}
                    {activity.type === "pomodoro" && <Clock className="w-5 h-5 text-red-500" />}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  
                  {activity.score && (
                    <span className="px-3 py-1 bg-primary/20 text-primary-foreground rounded-full text-sm font-semibold">
                      {activity.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
