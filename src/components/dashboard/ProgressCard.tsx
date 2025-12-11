import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  value: number;
  max: number;
  icon: React.ReactNode;
  color?: "lime" | "blue" | "purple" | "orange";
}

export function ProgressCard({ title, value, max, icon, color = "lime" }: ProgressCardProps) {
  const percentage = Math.round((value / max) * 100);
  
  const colorClasses = {
    lime: "bg-primary",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card hover:shadow-hover transition-all duration-300 animate-slide-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
          {icon}
        </div>
        <span className="text-2xl font-bold">{percentage}%</span>
      </div>
      
      <h3 className="font-semibold text-card-foreground mb-2">{title}</h3>
      
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className="text-sm text-muted-foreground mt-2">
        {value} / {max} completed
      </p>
    </div>
  );
}
