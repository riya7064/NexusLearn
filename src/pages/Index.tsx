import { MainLayout } from "@/components/layout/MainLayout";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { QuickLinkCard } from "@/components/dashboard/QuickLinkCard";
import { ScheduleCard } from "@/components/dashboard/ScheduleCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { FileText, Brain, Code2, MessageSquare, Layers, Calendar } from "lucide-react";

const Index = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <WelcomeCard />
        
        {/* Stats Grid */}
        <StatsGrid />
        
        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickLinkCard
              title="PDF Summarizer"
              description="Upload and summarize your study materials"
              icon={<FileText className="w-6 h-6" />}
              path="/pdf-summarizer"
              gradient
            />
            <QuickLinkCard
              title="Quiz Generator"
              description="Test your knowledge with AI quizzes"
              icon={<Brain className="w-6 h-6" />}
              path="/quiz"
            />
            <QuickLinkCard
              title="Code Assistant"
              description="Debug, explain, and optimize code"
              icon={<Code2 className="w-6 h-6" />}
              path="/coding"
            />
            <QuickLinkCard
              title="AI Tutor"
              description="Get help with any subject"
              icon={<MessageSquare className="w-6 h-6" />}
              path="/tutor"
            />
            <QuickLinkCard
              title="Flashcards"
              description="Review and memorize key concepts"
              icon={<Layers className="w-6 h-6" />}
              path="/flashcards"
            />
            <QuickLinkCard
              title="Study Planner"
              description="Organize your study schedule"
              icon={<Calendar className="w-6 h-6" />}
              path="/planner"
            />
          </div>
        </div>
        
        {/* Schedule and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScheduleCard />
          <RecentActivity />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
