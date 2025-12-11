import { useState, useEffect } from "react";
import { Clock, Target, Flame, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserPDFs,
  getUserQuizzes,
  getUserPomodoroSessions,
  getUserTasks,
} from "@/lib/firestore";

export function StatsGrid() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    studyHours: 0,
    tasksDone: 0,
    dayStreak: 0,
    quizScore: 0,
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    try {
      const [pdfs, quizzes, pomodoro, tasks] = await Promise.all([
        getUserPDFs(user.uid),
        getUserQuizzes(user.uid),
        getUserPomodoroSessions(user.uid),
        getUserTasks(user.uid),
      ]);

      // Calculate study hours from pomodoro sessions
      const totalMinutes = pomodoro.reduce((sum: number, session: any) => {
        return sum + (session.duration || 25);
      }, 0);
      const studyHours = (totalMinutes / 60).toFixed(1);

      // Count completed tasks
      const completedTasks = tasks.filter((t: any) => t.completed).length;

      // Calculate average quiz score
      const quizResults = quizzes.filter((q: any) => q.score !== undefined);
      const avgScore = quizResults.length > 0
        ? Math.round(quizResults.reduce((sum: number, q: any) => sum + q.score, 0) / quizResults.length)
        : 0;

      // Calculate streak (simplified - just count recent activity)
      const dayStreak = Math.min(pdfs.length + quizzes.length, 30);

      setStats({
        studyHours: parseFloat(studyHours),
        tasksDone: completedTasks,
        dayStreak,
        quizScore: avgScore,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const statsDisplay = [
    { label: "Study Hours", value: stats.studyHours.toString(), icon: Clock, suffix: "hrs", change: "+12%" },
    { label: "Tasks Done", value: stats.tasksDone.toString(), icon: Target, suffix: "", change: "+8%" },
    { label: "Day Streak", value: stats.dayStreak.toString(), icon: Flame, suffix: "days", change: "+2" },
    { label: "Quiz Score", value: stats.quizScore.toString(), icon: Trophy, suffix: "%", change: "+5%" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsDisplay.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-card rounded-2xl p-4 shadow-card hover:shadow-hover transition-all duration-300 animate-slide-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
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
            <span className="text-sm text-muted-foreground">{stat.suffix}</span>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
