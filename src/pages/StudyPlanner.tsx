import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { generateStudySchedule } from "@/lib/ai";
import { toast } from "sonner";
import {
  Plus,
  Calendar,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Loader2,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  category: "study" | "coding" | "college" | "exam";
  priority: "low" | "medium" | "high";
  deadline: string;
  completed: boolean;
}

const categoryColors = {
  study: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  coding: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  college: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  exam: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const priorityColors = {
  low: "border-l-green-500",
  medium: "border-l-yellow-500",
  high: "border-l-red-500",
};

interface ScheduleItem {
  time: string;
  duration: number;
  subject: string;
  activity: string;
}

export default function StudyPlanner() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [studyMinutes, setStudyMinutes] = useState(0);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  
  // New task form
  const [newTask, setNewTask] = useState({
    title: "",
    category: "study" as Task["category"],
    priority: "medium" as Task["priority"],
    deadline: "",
  });

  // Pomodoro timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setStudyMinutes((mins) => mins + 25);
            toast.success("Pomodoro session complete! 🎉");
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, pomodoroTime]);

  const addTask = () => {
    if (!newTask.title.trim() || !newTask.deadline) {
      toast.error("Please fill in all fields");
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      category: newTask.category,
      priority: newTask.priority,
      deadline: newTask.deadline,
      completed: false,
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", category: "study", priority: "medium", deadline: "" });
    setIsAddTaskOpen(false);
    toast.success("Task added successfully!");
  };

  const generateAISchedule = async () => {
    if (tasks.length === 0) {
      toast.error("Please add some tasks first");
      return;
    }

    setIsGeneratingSchedule(true);
    try {
      const subjects = tasks.map(t => t.title);
      const preferences = `Include breaks and focus on high priority tasks: ${tasks.filter(t => t.priority === 'high').map(t => t.title).join(', ')}`;
      
      const aiSchedule = await generateStudySchedule(subjects, preferences);
      setSchedule(aiSchedule);
      toast.success("AI schedule generated!");
    } catch (error: any) {
      console.error("Error generating schedule:", error);
      toast.error(error.message || "Failed to generate schedule");
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (25 * 60 - pomodoroTime) / (25 * 60);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Study Planner</h1>
          <p className="text-muted-foreground">Organize your tasks and track study time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pomodoro Timer */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h3 className="font-bold text-lg mb-6 text-center">Pomodoro Timer</h3>
              
              {/* Circular Timer */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={2 * Math.PI * 88 * (1 - progress)}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">{formatTime(pomodoroTime)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3">
                <Button
                  variant={isRunning ? "outline" : "lime"}
                  size="lg"
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setPomodoroTime(25 * 60);
                    setIsRunning(false);
                  }}
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-6 p-4 bg-secondary rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today's study time</span>
                  <span className="font-bold">{studyMinutes} min</span>
                </div>
                <div className="h-2 bg-background rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-lime rounded-full"
                    style={{ width: `${Math.min((studyMinutes / 240) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Goal: 4 hours</p>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Tasks</h3>
                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button variant="lime" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                      <DialogDescription>Create a new task for your study plan</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="title">Task Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Complete Chapter 5"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newTask.category}
                          onValueChange={(value) => setNewTask({ ...newTask, category: value as Task["category"] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="study">Study</SelectItem>
                            <SelectItem value="coding">Coding</SelectItem>
                            <SelectItem value="college">College</SelectItem>
                            <SelectItem value="exam">Exam</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task["priority"] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input
                          id="deadline"
                          type="date"
                          value={newTask.deadline}
                          onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                        />
                      </div>
                      <Button onClick={addTask} className="w-full">
                        Add Task
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No tasks yet</p>
                  <p className="text-sm">Click "Add Task" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">{tasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border-l-4 transition-all duration-200 hover:bg-secondary",
                      priorityColors[task.priority],
                      task.completed && "opacity-60"
                    )}
                  >
                    <button onClick={() => toggleTask(task.id)}>
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-medium",
                        task.completed && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          categoryColors[task.category]
                        )}>
                          {task.category}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {task.deadline}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                </div>
              )}
            </div>

            {/* AI Schedule */}
            <div className="mt-6 bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">AI-Generated Schedule</h3>
                </div>
                <Button 
                  onClick={generateAISchedule} 
                  disabled={isGeneratingSchedule || tasks.length === 0}
                  size="sm"
                  variant="outline"
                >
                  {isGeneratingSchedule ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Schedule
                    </>
                  )}
                </Button>
              </div>
              
              {schedule.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No schedule generated yet</p>
                  <p className="text-sm">Add tasks and click "Generate Schedule"</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {schedule.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <span className="text-sm font-mono text-muted-foreground w-32">
                        {item.time}
                      </span>
                      <div className="flex-1">
                        <span className="font-medium text-sm">{item.subject}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.activity}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                        {item.duration} min
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
