import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { chatWithTutor } from "@/lib/ai";
import { saveChatSession, updateChatSession, getUserChatSessions } from "@/lib/firestore";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Sparkles,
  BookOpen,
  Code2,
  FileText,
  HelpCircle,
  GraduationCap,
  RefreshCw,
  Copy,
  Check,
  Paperclip,
  History,
  Plus,
} from "lucide-react";

type TutorMode = "study" | "coding" | "notes" | "doubt" | "exam";

const modes: { value: TutorMode; label: string; icon: React.ElementType; description: string }[] = [
  { 
    value: "study", 
    label: "Study Tutor", 
    icon: GraduationCap,
    description: "Learn concepts with clear explanations"
  },
  { 
    value: "coding", 
    label: "Code Helper", 
    icon: Code2,
    description: "Get help with programming"
  },
  { 
    value: "notes", 
    label: "Notes Maker", 
    icon: FileText,
    description: "Create organized study materials"
  },
  { 
    value: "doubt", 
    label: "Doubt Solver", 
    icon: HelpCircle,
    description: "Clear your confusion"
  },
  { 
    value: "exam", 
    label: "Exam Prep", 
    icon: BookOpen,
    description: "Practice and prepare for tests"
  },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AITutor() {
  const { user } = useAuth();
  const [mode, setMode] = useState<TutorMode>("study");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user]);

  const loadChatSessions = async () => {
    if (!user) return;
    try {
      const sessions = await getUserChatSessions(user.uid);
      setSavedSessions(sessions);
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowHistory(false);
  };

  const loadSession = (session: any) => {
    setMessages(session.messages || []);
    setCurrentSessionId(session.id);
    setMode(session.mode || "study");
    setShowHistory(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      // Get AI response
      const response = await chatWithTutor(
        userMessage.content,
        mode,
        messages.map(m => ({ role: m.role, content: m.content }))
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Save to Firestore
      if (currentSessionId) {
        await updateChatSession(currentSessionId, updatedMessages);
      } else {
        const sessionId = await saveChatSession(user.uid, {
          mode,
          messages: updatedMessages,
          title: input.slice(0, 50) + (input.length > 50 ? "..." : ""),
        });
        setCurrentSessionId(sessionId);
      }

      await loadChatSessions();
    } catch (error: any) {
      console.error("Error getting AI response:", error);
      toast.error(error.message || "Failed to get response. Please try again.");
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = async (messageIndex: number) => {
    if (!user || isTyping) return;
    
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== "user") return;

    setIsTyping(true);
    try {
      const response = await chatWithTutor(
        userMessage.content,
        mode,
        messages.slice(0, messageIndex - 1).map(m => ({ role: m.role, content: m.content }))
      );

      const newMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages.slice(0, messageIndex), newMessage];
      setMessages(updatedMessages);

      if (currentSessionId) {
        await updateChatSession(currentSessionId, updatedMessages);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate response");
    } finally {
      setIsTyping(false);
    }
  };

  const getUserInitial = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-4">
        {/* Sidebar - Chat History */}
        <div className={cn(
          "w-64 bg-card rounded-2xl shadow-card p-4 flex flex-col transition-all duration-300",
          showHistory ? "block" : "hidden lg:block"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Chat History</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={startNewConversation}
              className="h-7 px-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {savedSessions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No saved chats yet
              </p>
            ) : (
              savedSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => loadSession(session)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors text-sm",
                    currentSessionId === session.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary"
                  )}
                >
                  <p className="font-medium truncate">{session.title}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {session.messages?.length || 0} messages
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">AI Tutor</h1>
                <p className="text-muted-foreground">
                  {modes.find(m => m.value === mode)?.description}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="lg:hidden"
              >
                <History className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {modes.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm",
                  mode === m.value
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary hover:bg-secondary/80"
                )}
              >
                <m.icon className="w-4 h-4" />
                {m.label}
              </button>
            ))}
          </div>

          {/* Chat Container */}
          <div className="flex-1 bg-card rounded-2xl shadow-card overflow-hidden flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-gradient-lime rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Start Learning!</h3>
                    <p className="text-muted-foreground mb-4">
                      Ask me anything about your studies. I'm here to help you understand concepts,
                      solve problems, and prepare for exams.
                    </p>
                    <div className="text-left space-y-2 text-sm">
                      <p className="text-muted-foreground">Try asking:</p>
                      <div className="space-y-1">
                        <p className="bg-secondary/50 rounded-lg p-2">
                          "Explain how binary search works"
                        </p>
                        <p className="bg-secondary/50 rounded-lg p-2">
                          "Help me debug this Python code"
                        </p>
                        <p className="bg-secondary/50 rounded-lg p-2">
                          "Create study notes for photosynthesis"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 animate-fade-in",
                        message.role === "user" && "flex-row-reverse"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          message.role === "user"
                            ? "bg-primary"
                            : "bg-gradient-lime shadow-glow"
                        )}
                      >
                        {message.role === "user" ? (
                          <span className="text-sm font-bold text-primary-foreground">
                            {getUserInitial()}
                          </span>
                        ) : (
                          <Sparkles className="w-4 h-4 text-primary-foreground" />
                        )}
                      </div>
                      
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl p-4 group",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/30"
                        )}
                      >
                        <div className={cn(
                          "prose prose-sm max-w-none",
                          message.role === "user" 
                            ? "prose-invert" 
                            : "dark:prose-invert"
                        )}>
                          <ReactMarkdown
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-base font-bold mt-2 mb-1" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc ml-4 my-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal ml-4 my-2" {...props} />,
                              li: ({node, ...props}) => <li className="my-1" {...props} />,
                              p: ({node, ...props}) => <p className="my-2" {...props} />,
                              code: ({node, className, children, ...props}: any) => {
                                const isInline = !className;
                                return isInline ? (
                                  <code className="bg-secondary/50 px-1.5 py-0.5 rounded text-sm" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className={`block bg-secondary/50 p-3 rounded-lg overflow-x-auto ${className}`} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        
                        {message.role === "assistant" && (
                          <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => handleCopy(message.id, message.content)}
                            >
                              {copiedId === message.id ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2"
                              onClick={() => handleRegenerate(index)}
                              disabled={isTyping}
                            >
                              <RefreshCw className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              {isTyping && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-gradient-lime flex items-center justify-center shadow-glow">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="bg-secondary/30 rounded-2xl p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              {!user && (
                <div className="mb-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-600 dark:text-yellow-400">
                  Please sign in to save your conversations
                </div>
              )}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-secondary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all"
                  disabled={isTyping}
                />
                
                <Button
                  variant="lime"
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
