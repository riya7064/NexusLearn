import { Clock, BookOpen, Code, Brain } from "lucide-react";

interface ScheduleItem {
  time: string;
  title: string;
  type: "study" | "coding" | "quiz" | "break";
  duration: string;
}

const scheduleItems: ScheduleItem[] = [
  { time: "09:00", title: "Data Structures", type: "study", duration: "2h" },
  { time: "11:00", title: "LeetCode Practice", type: "coding", duration: "1h 30m" },
  { time: "12:30", title: "Lunch Break", type: "break", duration: "1h" },
  { time: "14:00", title: "Machine Learning Quiz", type: "quiz", duration: "45m" },
  { time: "15:00", title: "Python Projects", type: "coding", duration: "2h" },
];

const typeIcons = {
  study: BookOpen,
  coding: Code,
  quiz: Brain,
  break: Clock,
};

const typeColors = {
  study: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  coding: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  quiz: "bg-primary/20 text-primary-foreground dark:text-primary",
  break: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
};

export function ScheduleCard() {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card animate-slide-in-up">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg">Today's Schedule</h3>
        <span className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </span>
      </div>
      
      <div className="space-y-3">
        {scheduleItems.map((item, index) => {
          const Icon = typeIcons[item.type];
          return (
            <div
              key={index}
              className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors duration-200"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[item.type]}`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.duration}</p>
              </div>
              
              <span className="text-sm font-semibold text-muted-foreground">
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
