import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { extractTextFromPDF } from "@/lib/pdfUtils";
import { generateSummary, generateQuiz, generateFlashcards } from "@/lib/ai";
import { savePDFDocument, saveSummary, saveQuiz, saveFlashcardSet } from "@/lib/firestore";
import { Upload, FileText, Sparkles, Loader2, Download, Copy, Check, Layers, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";

export default function PDFSummarizer() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [summaryShort, setSummaryShort] = useState("");
  const [summaryLong, setSummaryLong] = useState("");
  const [summaryBullets, setSummaryBullets] = useState("");
  const [quiz, setQuiz] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("short");
  const [copied, setCopied] = useState(false);

  const toggleFlipCard = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        console.log("New file dropped:", acceptedFiles[0].name);
        setFile(acceptedFiles[0]);
        // Clear all previous results
        setExtractedText("");
        setSummaryShort("");
        setSummaryLong("");
        setSummaryBullets("");
        setQuiz([]);
        setFlashcards([]);
        setActiveTab("short");
        toast.success(`File selected: ${acceptedFiles[0].name}`);
      }
    }
  });

  const handleExtractAndSummarize = async () => {
    if (!file || !user) {
      toast.error("Please select a PDF file first");
      return;
    }

    setIsProcessing(true);
    
    // Clear old summaries first
    setSummaryShort("");
    setSummaryLong("");
    setSummaryBullets("");
    
    try {
      // 1. Extract text from PDF
      toast.info("📄 Extracting text from PDF...");
      console.log("=== PDF EXTRACTION STARTED ===");
      console.log("File name:", file.name);
      console.log("File size:", (file.size / 1024).toFixed(2), "KB");
      
      const text = await extractTextFromPDF(file);
      
      console.log("=== EXTRACTION COMPLETE ===");
      console.log("Extracted text length:", text.length, "characters");
      console.log("First 1000 characters of extracted text:");
      console.log(text.slice(0, 1000));
      console.log("========================");
      
      if (!text || text.length < 10) {
        throw new Error("No text could be extracted from this PDF. It might be an image-based PDF.");
      }
      
      setExtractedText(text);
      toast.success(`✅ Extracted ${text.length} characters`);

      // 2. Save PDF document metadata (with extracted text)
      toast.info("💾 Saving document...");
      const pdfId = await savePDFDocument(user.uid, {
        title: file.name,
        fileName: file.name,
        textContent: text.slice(0, 50000), // Store first 50k chars
        pages: 0,
      });
      console.log("Saved PDF document with ID:", pdfId);

      // 3. Generate summaries
      toast.info("🤖 Generating AI summaries (this may take 30-60 seconds)...");
      const textToSummarize = text.slice(0, 30000);
      console.log("=== SENDING TO AI ===");
      console.log("Text being sent to AI (length):", textToSummarize.length);
      console.log("First 500 chars being sent to AI:");
      console.log(textToSummarize.slice(0, 500));
      
      const [short, long, bullets] = await Promise.all([
        generateSummary(textToSummarize, 'short'),
        generateSummary(textToSummarize, 'long'),
        generateSummary(textToSummarize, 'bullets'),
      ]);

      console.log("=== AI RESPONSES ===");
      console.log("Short summary (first 200 chars):", short?.slice(0, 200));
      console.log("Long summary (first 200 chars):", long?.slice(0, 200));
      console.log("Bullets summary (first 200 chars):", bullets?.slice(0, 200));
      console.log("========================");

      if (!short && !long && !bullets) {
        throw new Error("AI failed to generate any summaries. Please check your API key.");
      }

      setSummaryShort(short || 'No summary generated');
      setSummaryLong(long || 'No summary generated');
      setSummaryBullets(bullets || 'No summary generated');

      // Save summaries to Firestore
      await Promise.all([
        saveSummary(pdfId, user.uid, { type: 'short', content: short }),
        saveSummary(pdfId, user.uid, { type: 'long', content: long }),
        saveSummary(pdfId, user.uid, { type: 'bullets', content: bullets }),
      ]);

      toast.success("✨ Summaries generated successfully!");
      setActiveTab("short");
    } catch (error: any) {
      console.error("=== ERROR ===", error);
      toast.error(error.message || "Failed to process PDF. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!extractedText || !user) {
      toast.error("Please extract text from a PDF first");
      return;
    }

    setIsProcessing(true);
    try {
      toast.info("Generating quiz questions...");
      console.log("Generating quiz from text length:", extractedText.length);
      
      const quizQuestions = await generateQuiz(extractedText.slice(0, 20000), 'medium', 10);
      console.log("Generated quiz questions:", quizQuestions);
      
      if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
        throw new Error("No quiz questions were generated");
      }
      
      setQuiz(quizQuestions);

      // Save quiz to Firestore
      const quizId = await saveQuiz(user.uid, {
        title: file?.name || 'Quiz',
        questions: quizQuestions,
        difficulty: 'medium',
      });
      console.log("Saved quiz with ID:", quizId);

      setActiveTab("quiz");
      toast.success("Quiz generated successfully!");
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      toast.error(error.message || "Failed to generate quiz. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!extractedText || !user) {
      toast.error("Please extract text from a PDF first");
      return;
    }

    setIsProcessing(true);
    try {
      toast.info("Generating flashcards...");
      console.log("Generating flashcards from text length:", extractedText.length);
      
      const cards = await generateFlashcards(extractedText.slice(0, 15000), 15);
      console.log("Generated flashcards:", cards);
      
      if (!Array.isArray(cards) || cards.length === 0) {
        throw new Error("No flashcards were generated");
      }
      
      setFlashcards(cards);

      // Save flashcards to Firestore
      const setId = await saveFlashcardSet(user.uid, {
        title: file?.name || 'Flashcard Set',
        cards: cards,
      });
      console.log("Saved flashcard set with ID:", setId);

      setActiveTab("flashcards");
      toast.success("Flashcards generated successfully!");
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      toast.error(error.message || "Failed to generate flashcards. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">PDF Summarizer</h1>
          <p className="text-muted-foreground">
            Upload your study materials and get AI-powered summaries, quizzes, and flashcards
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload PDF</CardTitle>
            <CardDescription>Drop your PDF file here or click to browse</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              {file ? (
                <div>
                  <p className="text-lg font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-1">Drop your PDF here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={handleExtractAndSummarize}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Summaries
                    </>
                  )}
                </Button>
                {extractedText && (
                  <>
                    <Button onClick={handleGenerateQuiz} disabled={isProcessing} variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Quiz
                    </Button>
                    <Button onClick={handleGenerateFlashcards} disabled={isProcessing} variant="outline">
                      <Layers className="w-4 h-4 mr-2" />
                      Generate Flashcards
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {(summaryShort || summaryLong || summaryBullets || quiz.length > 0 || flashcards.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="short">Short</TabsTrigger>
                  <TabsTrigger value="long">Long</TabsTrigger>
                  <TabsTrigger value="bullets">Bullets</TabsTrigger>
                  <TabsTrigger value="quiz" disabled={quiz.length === 0}>
                    Quiz {quiz.length > 0 && <Badge className="ml-2">{quiz.length}</Badge>}
                  </TabsTrigger>
                  <TabsTrigger value="flashcards" disabled={flashcards.length === 0}>
                    Flashcards {flashcards.length > 0 && <Badge className="ml-2">{flashcards.length}</Badge>}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="short" className="space-y-4">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleCopy(summaryShort)}>
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy
                    </Button>
                  </div>
                  <div className="prose prose-slate max-w-none dark:prose-invert p-6 bg-secondary/30 rounded-lg">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-primary" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3 mt-4 text-primary" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 mt-3" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="mb-3 ml-6 space-y-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="mb-3 ml-6 space-y-2" {...props} />,
                        li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                      }}
                    >
                      {summaryShort}
                    </ReactMarkdown>
                  </div>
                </TabsContent>

                <TabsContent value="long" className="space-y-4">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleCopy(summaryLong)}>
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy
                    </Button>
                  </div>
                  <div className="prose prose-slate max-w-none dark:prose-invert p-6 bg-secondary/30 rounded-lg">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-primary" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3 mt-4 text-primary" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 mt-3" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="mb-3 ml-6 space-y-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="mb-3 ml-6 space-y-2" {...props} />,
                        li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                      }}
                    >
                      {summaryLong}
                    </ReactMarkdown>
                  </div>
                </TabsContent>

                <TabsContent value="bullets" className="space-y-4">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleCopy(summaryBullets)}>
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy
                    </Button>
                  </div>
                  <div className="prose prose-slate max-w-none dark:prose-invert p-6 bg-secondary/30 rounded-lg">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-primary" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3 mt-4 text-primary" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 mt-3" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="mb-3 ml-6 space-y-2 list-disc" {...props} />,
                        ol: ({node, ...props}) => <ol className="mb-3 ml-6 space-y-2 list-decimal" {...props} />,
                        li: ({node, ...props}) => <li className="leading-relaxed pl-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                      }}
                    >
                      {summaryBullets}
                    </ReactMarkdown>
                  </div>
                </TabsContent>

                <TabsContent value="quiz" className="space-y-4">
                  {quiz.map((q, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle className="text-lg">Question {i + 1}</CardTitle>
                        <CardDescription>{q.question}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {q.options?.map((opt: string, j: number) => (
                          <div
                            key={j}
                            className={`p-3 rounded-lg border ${
                              opt === q.correctAnswer
                                ? 'bg-green-50 border-green-200'
                                : 'bg-background border-border'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="flashcards" className="space-y-4">
                  {flashcards.length > 0 && (
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-muted-foreground">
                        Click on any card to flip and reveal the answer
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFlippedCards(new Set())}
                        disabled={flippedCards.size === 0}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset All Cards
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flashcards.map((card, i) => {
                      const isFlipped = flippedCards.has(i);
                      return (
                        <div
                          key={i}
                          className="relative h-64 cursor-pointer group"
                          onClick={() => toggleFlipCard(i)}
                          style={{ perspective: '1000px' }}
                        >
                          <div
                            className={`absolute w-full h-full transition-all duration-700 transform-gpu ${
                              isFlipped ? '[transform:rotateY(180deg)]' : ''
                            }`}
                            style={{
                              transformStyle: 'preserve-3d',
                            }}
                          >
                            {/* Front of card - Question */}
                            <div
                              className="absolute w-full h-full rounded-2xl shadow-lg overflow-hidden"
                              style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 animate-gradient-slow" />
                              <div className="relative h-full p-6 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm border border-border">
                                <div className="absolute top-4 right-4">
                                  <Badge variant="secondary" className="text-xs">
                                    {i + 1}/{flashcards.length}
                                  </Badge>
                                </div>
                                <div className="text-center flex-1 flex items-center justify-center">
                                  <p className="text-lg font-semibold text-foreground px-4">
                                    {card.front}
                                  </p>
                                </div>
                                <div className="absolute bottom-4 flex items-center gap-2 text-muted-foreground text-sm">
                                  <RotateCcw className="w-4 h-4" />
                                  <span>Click to reveal</span>
                                </div>
                              </div>
                            </div>

                            {/* Back of card - Answer */}
                            <div
                              className="absolute w-full h-full rounded-2xl shadow-lg overflow-hidden"
                              style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-lime-400 via-green-400 to-emerald-400 animate-gradient-slow" />
                              <div className="relative h-full p-6 flex flex-col items-center justify-center bg-gradient-lime/90 backdrop-blur-sm border-2 border-lime-300/50 shadow-glow">
                                <div className="absolute top-4 right-4">
                                  <Badge variant="secondary" className="text-xs bg-white/90">
                                    {i + 1}/{flashcards.length}
                                  </Badge>
                                </div>
                                <div className="text-center flex-1 flex items-center justify-center overflow-y-auto">
                                  <p className="text-base text-gray-900 font-medium px-4">
                                    {card.back}
                                  </p>
                                </div>
                                <div className="absolute bottom-4 flex items-center gap-2 text-gray-700 text-sm">
                                  <RotateCcw className="w-4 h-4" />
                                  <span>Click to flip back</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {flashcards.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No flashcards generated yet
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
