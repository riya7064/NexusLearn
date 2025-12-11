import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface QuickLinkCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  gradient?: boolean;
}

export function QuickLinkCard({ title, description, icon, path, gradient }: QuickLinkCardProps) {
  return (
    <Link
      to={path}
      className={cn(
        "group block rounded-2xl p-5 transition-all duration-300 hover:shadow-hover hover:scale-[1.02]",
        gradient
          ? "bg-gradient-lime text-primary-foreground"
          : "bg-card shadow-card hover:bg-secondary/50"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          gradient ? "bg-primary-foreground/20" : "bg-secondary"
        )}>
          {icon}
        </div>
        <ArrowRight className={cn(
          "w-5 h-5 transition-transform duration-300 group-hover:translate-x-1",
          gradient ? "text-primary-foreground/60" : "text-muted-foreground"
        )} />
      </div>
      
      <h3 className={cn(
        "font-bold text-lg mb-1",
        !gradient && "text-card-foreground"
      )}>
        {title}
      </h3>
      
      <p className={cn(
        "text-sm",
        gradient ? "text-primary-foreground/80" : "text-muted-foreground"
      )}>
        {description}
      </p>
    </Link>
  );
}
