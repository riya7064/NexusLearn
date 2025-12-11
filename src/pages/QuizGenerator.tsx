import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Brain,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  Lightbulb,
} from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const mockQuestions: Question[] = [
  {
    id: 1,
    question: "What is the primary purpose of supervised learning?",
    options: [
      "To find patterns in unlabeled data",
      "To make predictions based on labeled training data",
      "To cluster similar data points together",
      "To reduce dimensionality of data",
    ],
    correct: 1,
    explanation: "Supervised learning uses labeled data to train models that can make predictions on new, unseen data.",
  },
  {
    id: 2,
    question: "Which of the following is NOT a type of neural network?",
    options: [
      "Convolutional Neural Network (CNN)",
      "Recurrent Neural Network (RNN)",
      "Linear Regression Network (LRN)",
      "Generative Adversarial Network (GAN)",
    ],
    correct: 2,
    explanation: "Linear Regression is a statistical method, not a type of neural network architecture.",
  },
  {
    id: 3,
    question: "What is gradient descent used for in machine learning?",
    options: [
      "Data preprocessing",
      "Feature selection",
      "Optimizing model parameters",
      "Data visualization",
    ],
    correct: 2,
    explanation: "Gradient descent is an optimization algorithm used to minimize the loss function by iteratively updating model parameters.",
  },
];

export default function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const startQuiz = () => {
    setIsQuizActive(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    
    setTimeout(() => {
      setAnswers([...answers, index]);
      if (currentQuestion < mockQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const score = answers.filter((a, i) => a === mockQuestions[i]?.correct).length;
  const percentage = Math.round((score / mockQuestions.length) * 100);

  if (showResult) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl p-8 shadow-card text-center animate-scale-in">
            <div className="w-24 h-24 mx-auto bg-gradient-lime rounded-full flex items-center justify-center mb-6 shadow-glow">
              <Trophy className="w-12 h-12 text-primary-foreground" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
            <p className="text-muted-foreground mb-6">Here's how you performed</p>
            
            <div className="text-6xl font-bold mb-2">{percentage}%</div>
            <p className="text-lg text-muted-foreground mb-8">
              {score} out of {mockQuestions.length} correct
            </p>
            
            <div className="bg-secondary rounded-xl p-4 mb-6">
              <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                AI Study Advice
              </h3>
              <p className="text-sm text-muted-foreground">
                Focus on neural network architectures. Consider reviewing CNNs, RNNs, and GANs to strengthen your understanding of deep learning fundamentals.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {
                setIsQuizActive(false);
                setShowResult(false);
              }}>
                <RotateCcw className="w-4 h-4 mr-2" />
                New Quiz
              </Button>
              <Button variant="lime" className="flex-1" onClick={startQuiz}>
                <Play className="w-4 h-4 mr-2" />
                Retry Quiz
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isQuizActive) {
    const question = mockQuestions[currentQuestion];
    
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Question {currentQuestion + 1} of {mockQuestions.length}
              </span>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>0:{timeLeft.toString().padStart(2, "0")}</span>
              </div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-lime transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-card rounded-2xl p-8 shadow-card animate-slide-in-up">
            <h2 className="text-xl font-bold mb-6">{question.question}</h2>
            
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correct;
                const showFeedback = selectedAnswer !== null;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      "w-full p-4 rounded-xl text-left transition-all duration-300 border-2",
                      !showFeedback && "border-border hover:border-primary hover:bg-secondary",
                      showFeedback && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                      showFeedback && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
                      showFeedback && !isSelected && !isCorrect && "opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
                        showFeedback && isCorrect ? "bg-green-500 text-white" :
                        showFeedback && isSelected && !isCorrect ? "bg-red-500 text-white" :
                        "bg-secondary"
                      )}>
                        {showFeedback ? (
                          isCorrect ? <CheckCircle2 className="w-5 h-5" /> :
                          isSelected ? <XCircle className="w-5 h-5" /> :
                          String.fromCharCode(65 + index)
                        ) : String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <div className="mt-6 p-4 bg-secondary rounded-xl animate-fade-in">
                <p className="text-sm">
                  <span className="font-semibold">Explanation: </span>
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quiz Generator</h1>
          <p className="text-muted-foreground">
            Test your knowledge with AI-generated quizzes
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Machine Learning, Data Structures..."
              className="w-full px-4 py-3 rounded-xl bg-secondary border-0 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Questions: {numQuestions}
            </label>
            <input
              type="range"
              min="3"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>3</span>
              <span>20</span>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "py-3 rounded-xl font-medium capitalize transition-all duration-200",
                    difficulty === d
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-secondary hover:bg-secondary/80"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <Button variant="lime" size="xl" className="w-full" onClick={startQuiz}>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate & Start Quiz
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
