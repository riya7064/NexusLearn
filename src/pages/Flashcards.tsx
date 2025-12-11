import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Check,
  RotateCcw,
  Plus,
  Layers,
} from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  known: boolean;
}

const mockCards: Flashcard[] = [
  {
    id: "1",
    front: "What is the time complexity of Binary Search?",
    back: "O(log n) - The search space is halved with each comparison, resulting in logarithmic time complexity.",
    known: false,
  },
  {
    id: "2",
    front: "Define Recursion",
    back: "A programming technique where a function calls itself to solve smaller instances of the same problem. Requires a base case to prevent infinite loops.",
    known: false,
  },
  {
    id: "3",
    front: "What is a Hash Table?",
    back: "A data structure that maps keys to values using a hash function. Provides O(1) average time complexity for insertions, deletions, and lookups.",
    known: false,
  },
  {
    id: "4",
    front: "Explain Big O Notation",
    back: "A mathematical notation describing the upper bound of an algorithm's time or space complexity. It describes the worst-case scenario as input size grows.",
    known: false,
  },
  {
    id: "5",
    front: "What is Dynamic Programming?",
    back: "An optimization technique that solves complex problems by breaking them into simpler subproblems. It stores results to avoid redundant calculations (memoization).",
    known: false,
  },
];

export default function Flashcards() {
  const [cards, setCards] = useState<Flashcard[]>(mockCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const currentCard = cards[currentIndex];
  const knownCount = cards.filter((c) => c.known).length;
  const progress = (knownCount / cards.length) * 100;

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 200);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 200);
  };

  const shuffleCards = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const markAsKnown = (known: boolean) => {
    setCards(
      cards.map((c, i) => (i === currentIndex ? { ...c, known } : c))
    );
    nextCard();
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
          <p className="text-muted-foreground">Review and memorize key concepts</p>
        </div>

        {/* Progress */}
        <div className="bg-card rounded-2xl p-4 shadow-card mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {knownCount} / {cards.length} mastered
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-lime rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="perspective-1000 mb-6">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={cn(
              "relative w-full h-80 cursor-pointer transition-transform duration-500 transform-style-3d",
              isFlipped && "rotate-y-180"
            )}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 bg-card rounded-2xl shadow-card p-8 flex flex-col items-center justify-center backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <span className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                Question
              </span>
              <p className="text-xl font-semibold text-center">{currentCard.front}</p>
              <span className="text-sm text-muted-foreground mt-6">
                Click to reveal answer
              </span>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 bg-gradient-lime rounded-2xl shadow-glow p-8 flex flex-col items-center justify-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <span className="text-xs font-medium text-primary-foreground/80 mb-4 uppercase tracking-wider">
                Answer
              </span>
              <p className="text-lg text-primary-foreground text-center leading-relaxed">
                {currentCard.back}
              </p>
            </div>
          </div>
        </div>

        {/* Card Counter */}
        <div className="text-center mb-6">
          <span className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button variant="outline" size="lg" onClick={prevCard}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => markAsKnown(false)}
            className="border-red-300 hover:bg-red-50 hover:border-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            <RotateCcw className="w-5 h-5 mr-2 text-red-500" />
            Review Later
          </Button>
          
          <Button
            variant="lime"
            size="lg"
            onClick={() => markAsKnown(true)}
          >
            <Check className="w-5 h-5 mr-2" />
            I Know This
          </Button>
          
          <Button variant="outline" size="lg" onClick={nextCard}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={shuffleCards}>
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle
          </Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
          <Button variant="outline" onClick={() => setShowAll(!showAll)}>
            <Layers className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>

        {/* All Cards View */}
        {showAll && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setShowAll(false);
                }}
                className={cn(
                  "p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-hover",
                  card.known
                    ? "bg-primary/20 border-2 border-primary"
                    : "bg-card shadow-card"
                )}
              >
                <p className="font-medium text-sm line-clamp-2">{card.front}</p>
                {card.known && (
                  <span className="text-xs text-primary font-medium mt-2 inline-block">
                    ✓ Mastered
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
