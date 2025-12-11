import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Code, Brain, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserPDFs,
  getUserQuizzes,
  getUserCodeSessions,
  getUserFlashcardSets,
} from "@/lib/firestore";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  title: string;
  type: "pdf" | "code" | "quiz" | "flashcard";
  time: string;
  createdAt: any;
}

const typeConfig = {
  pdf: { icon: FileText, color: "text-red-500 bg-red-100 dark:bg-red-900/30" },
  code: { icon: Code, color: "text-purple-500 bg-purple-100 dark:bg-purple-900/30" },
  quiz: { icon: Brain, color: "text-primary bg-primary/20" },
  flashcard: { icon: Layers, color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30" },
};

export function RecentActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  const loadActivities = async () => {
    if (!user) return;
    try {
      const [pdfs, quizzes, codeSessions, flashcards] = await Promise.all([
        getUserPDFs(user.uid),
        getUserQuizzes(user.uid),
        getUserCodeSessions(user.uid),
        getUserFlashcardSets(user.uid),
      ]);

      const allActivities: Activity[] = [
        ...pdfs.map((p: any) => ({
          id: p.id,
          title: p.title || p.fileName,
          type: "pdf" as const,
          createdAt: p.createdAt,
          time: formatDistanceToNow(p.createdAt?.toDate() || new Date(), { addSuffix: true }),
        })),
        ...quizzes.map((q: any) => ({
          id: q.id,
          title: q.title,
          type: "quiz" as const,
          createdAt: q.createdAt,
          time: formatDistanceToNow(q.createdAt?.toDate() || new Date(), { addSuffix: true }),
        })),
        ...codeSessions.map((c: any) => ({
          id: c.id,
          title: c.title || "Code Session",
          type: "code" as const,
          createdAt: c.createdAt,
          time: formatDistanceToNow(c.createdAt?.toDate() || new Date(), { addSuffix: true }),
        })),
        ...flashcards.map((f: any) => ({
          id: f.id,
          title: f.title,
          type: "flashcard" as const,
          createdAt: f.createdAt,
          time: formatDistanceToNow(f.createdAt?.toDate() || new Date(), { addSuffix: true }),
        })),
      ];

      // Sort by createdAt and take first 5
      allActivities.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

      setActivities(allActivities.slice(0, 5));
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };
  
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card animate-slide-in-up">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg">Recent Activity</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/saved")}
          className="text-primary hover:text-primary"
        >
          See All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No recent activity</p>
        ) : (
          activities.map((activity) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            
            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors duration-200 cursor-pointer"
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
