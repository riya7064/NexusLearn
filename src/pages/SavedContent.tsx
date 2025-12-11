import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserPDFs,
  getUserQuizzes,
  getUserFlashcardSets,
  getUserCodeSessions,
  getUserChatSessions,
  deletePDF,
} from "@/lib/firestore";
import {
  FileText,
  Brain,
  Layers,
  Code2,
  MessageSquare,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SavedContent() {
  const { user } = useAuth();
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<any[]>([]);
  const [codeSessions, setCodeSessions] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAllContent();
    }
  }, [user]);

  // Auto-refresh every 5 seconds to show new saves
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      loadAllContent();
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadAllContent = async () => {
    if (!user) return;
    setLoading(true);
    try {
      console.log("Loading saved content for user:", user.uid);
      const [pdfsData, quizzesData, flashcardsData, codeData, chatData] = await Promise.all([
        getUserPDFs(user.uid),
        getUserQuizzes(user.uid),
        getUserFlashcardSets(user.uid),
        getUserCodeSessions(user.uid),
        getUserChatSessions(user.uid),
      ]);
      console.log("📊 Loaded content counts:", {
        pdfs: pdfsData.length,
        quizzes: quizzesData.length,
        flashcards: flashcardsData.length,
        code: codeData.length,
        chat: chatData.length,
      });
      console.log("Code sessions data:", codeData);
      setPdfs(pdfsData);
      setQuizzes(quizzesData);
      setFlashcardSets(flashcardsData);
      setCodeSessions(codeData);
      setChatSessions(chatData);
    } catch (error) {
      console.error("❌ Error loading content:", error);
      toast.error("Failed to load saved content");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePDF = async (id: string) => {
    if (!confirm("Are you sure you want to delete this PDF?")) return;
    try {
      await deletePDF(id);
      toast.success("PDF deleted successfully");
      loadAllContent();
    } catch (error) {
      console.error("Error deleting PDF:", error);
      toast.error("Failed to delete PDF");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "MMM dd, yyyy");
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Saved Content</h1>
            <p className="text-muted-foreground">
              Access all your saved PDFs, quizzes, flashcards, and sessions
            </p>
          </div>
          <Button onClick={loadAllContent} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        <Tabs defaultValue="pdfs" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pdfs">
              <FileText className="w-4 h-4 mr-2" />
              PDFs ({pdfs.length})
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              <Brain className="w-4 h-4 mr-2" />
              Quizzes ({quizzes.length})
            </TabsTrigger>
            <TabsTrigger value="flashcards">
              <Layers className="w-4 h-4 mr-2" />
              Flashcards ({flashcardSets.length})
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code2 className="w-4 h-4 mr-2" />
              Code ({codeSessions.length})
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chats ({chatSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdfs" className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : pdfs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No PDFs saved yet</p>
                </CardContent>
              </Card>
            ) : (
              pdfs.map((pdf) => (
                <Card key={pdf.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{pdf.title || pdf.fileName}</CardTitle>
                        <CardDescription>
                          Uploaded on {formatDate(pdf.createdAt || pdf.uploadedAt)}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePDF(pdf.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {pdf.textContent?.slice(0, 200)}...
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : quizzes.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No quizzes saved yet</p>
                </CardContent>
              </Card>
            ) : (
              quizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{quiz.title}</CardTitle>
                        <CardDescription>
                          {quiz.questions?.length || 0} questions · {formatDate(quiz.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge>{quiz.difficulty || "medium"}</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="flashcards" className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : flashcardSets.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No flashcard sets saved yet</p>
                </CardContent>
              </Card>
            ) : (
              flashcardSets.map((set) => (
                <Card key={set.id}>
                  <CardHeader>
                    <CardTitle>{set.title}</CardTitle>
                    <CardDescription>
                      {set.cards?.length || 0} cards · {formatDate(set.createdAt)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : codeSessions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Code2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No code sessions saved yet</p>
                </CardContent>
              </Card>
            ) : (
              codeSessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle>{session.title || "Code Session"}</CardTitle>
                    <CardDescription>
                      {session.language} · {formatDate(session.createdAt)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : chatSessions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No chat sessions saved yet</p>
                </CardContent>
              </Card>
            ) : (
              chatSessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle>{session.title || "Chat Session"}</CardTitle>
                    <CardDescription>
                      {session.messages?.length || 0} messages · {formatDate(session.createdAt)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
