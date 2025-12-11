import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { explainCode, debugCode, convertCode, analyzeComplexity } from "@/lib/ai";
import { saveCodeSession } from "@/lib/firestore";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Play,
  Code2,
  Bug,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Lightbulb,
  ArrowRight,
  FileCode,
  Loader2,
  Save,
} from "lucide-react";

type Mode = "explain" | "debug" | "convert" | "optimize";

const modes: { value: Mode; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "explain", label: "Explain", icon: Lightbulb, desc: "Understand code" },
  { value: "debug", label: "Debug", icon: Bug, desc: "Find issues" },
  { value: "convert", label: "Convert", icon: RefreshCw, desc: "Change language" },
  { value: "optimize", label: "Optimize", icon: Zap, desc: "Analyze complexity" },
];

const languages = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin"
];

export default function CodingAssistant() {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<Mode>("explain");
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState("Python");
  const [targetLanguage, setTargetLanguage] = useState("JavaScript");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code first");
      return;
    }

    setIsProcessing(true);
    setOutput("");
    setErrorMessage("");

    try {
      let result = "";
      
      switch (mode) {
        case "explain":
          console.log("🔍 Explaining code...");
          result = await explainCode(code, language);
          break;
          
        case "debug":
          console.log("🐛 Debugging code...");
          result = await debugCode(code, language, errorMessage);
          break;
          
        case "convert":
          console.log(`🔄 Converting from ${language} to ${targetLanguage}...`);
          result = await convertCode(code, language, targetLanguage);
          break;
          
        case "optimize":
          console.log("⚡ Analyzing complexity...");
          result = await analyzeComplexity(code, language);
          break;
      }

      setOutput(result);
      toast.success("✅ Analysis complete!");
    } catch (error: any) {
      console.error("❌ Error:", error);
      toast.error(error.message || "Failed to process code");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save code sessions");
      return;
    }

    if (!code.trim() || !output.trim()) {
      toast.error("No code or output to save");
      return;
    }

    try {
      const sessionData = {
        title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} - ${language}`,
        language,
        mode,
        code,
        output,
        targetLanguage: mode === "convert" ? targetLanguage : undefined,
      };
      console.log("Saving code session for user:", user.uid);
      console.log("Session data:", sessionData);
      const sessionId = await saveCodeSession(user.uid, sessionData);
      console.log("✅ Code session saved with ID:", sessionId);
      toast.success("Code session saved! Check Saved Content page.");
    } catch (error) {
      console.error("❌ Error saving code session:", error);
      toast.error("Failed to save code session");
    }
  };  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Code Assistant</h1>
          <p className="text-muted-foreground">
            Debug, explain, convert, and optimize your code with AI
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
                mode === m.value
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-card hover:bg-secondary"
              )}
            >
              <m.icon className="w-4 h-4" />
              <span className="font-medium text-sm">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Input */}
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Input Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Language:</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {mode === "convert" && (
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.filter(l => l !== language).map((lang) => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Paste your ${language} code here...`}
              className="w-full h-[350px] p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm resize-none outline-none"
              spellCheck={false}
            />
            {mode === "debug" && (
              <div className="px-4 py-2 border-t border-border">
                <Label className="text-xs text-muted-foreground mb-1 block">Error Message (optional):</Label>
                <input
                  type="text"
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  placeholder="e.g., TypeError: undefined is not a function"
                  className="w-full px-3 py-1.5 text-xs bg-secondary border border-border rounded"
                />
              </div>
            )}
            <div className="p-4 border-t border-border">
              <Button
                variant="lime"
                className="w-full"
                onClick={handleRun}
                disabled={isProcessing || !code.trim()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === "explain" && <Lightbulb className="w-4 h-4 mr-2" />}
                    {mode === "debug" && <Bug className="w-4 h-4 mr-2" />}
                    {mode === "convert" && <RefreshCw className="w-4 h-4 mr-2" />}
                    {mode === "optimize" && <Zap className="w-4 h-4 mr-2" />}
                    {modes.find((m) => m.value === mode)?.label} Code
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Output */}
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Output</span>
              </div>
              {output && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>
            <div className="h-[450px] p-6 overflow-y-auto bg-secondary/30">
              {output ? (
                <div className="prose prose-slate max-w-none dark:prose-invert">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 text-primary" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-2 mt-4 text-primary" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-2 mt-3" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2 leading-relaxed text-sm" {...props} />,
                      code: ({node, inline, ...props}: any) => 
                        inline ? (
                          <code className="px-1.5 py-0.5 bg-primary/10 rounded text-xs font-mono" {...props} />
                        ) : (
                          <code className="block p-3 bg-[#1e1e1e] text-[#d4d4d4] rounded-lg text-xs overflow-x-auto" {...props} />
                        ),
                      pre: ({node, ...props}) => <pre className="mb-3 overflow-x-auto" {...props} />,
                      ul: ({node, ...props}) => <ul className="mb-2 ml-6 space-y-1 text-sm" {...props} />,
                      ol: ({node, ...props}) => <ol className="mb-2 ml-6 space-y-1 text-sm" {...props} />,
                      li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                      table: ({node, ...props}) => <table className="min-w-full border border-border text-xs" {...props} />,
                      th: ({node, ...props}) => <th className="border border-border px-2 py-1 bg-secondary" {...props} />,
                      td: ({node, ...props}) => <td className="border border-border px-2 py-1" {...props} />,
                    }}
                  >
                    {output}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Code2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Paste your code and click a button</p>
                    <p className="text-sm">AI will analyze your code in real-time</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
