import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Wind, Brain, Heart, Moon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import BreathingExercise from "./BreathingExercise";

interface WellnessToolsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMeditation?: (meditation: string) => void;
}

const breathingExercises = [
  {
    id: "box",
    name: "Box Breathing",
    description: "4-4-4-4 pattern for calm focus",
    icon: Wind,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "478",
    name: "4-7-8 Breathing",
    description: "Natural tranquilizer technique",
    icon: Moon,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    id: "relaxing",
    name: "Deep Relaxation",
    description: "Slow breaths for deep calm",
    icon: Heart,
    color: "bg-pink-500/10 text-pink-500",
  },
];

const guidedMeditations = [
  {
    id: "body-scan",
    name: "Body Scan",
    duration: "5-10 min",
    description: "Progressive relaxation from head to toe",
    icon: Sparkles,
    prompt: "Guide me through a body scan meditation. Start from the top of my head and slowly move down through each body part, helping me release tension and relax deeply.",
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    duration: "5 min",
    description: "Present moment awareness",
    icon: Brain,
    prompt: "Lead me through a mindfulness meditation. Help me focus on the present moment, observing my thoughts without judgment, and finding peace in the now.",
  },
  {
    id: "anxiety-relief",
    name: "Anxiety Relief",
    duration: "5-7 min",
    description: "Calm racing thoughts",
    icon: Heart,
    prompt: "Guide me through a meditation specifically for anxiety relief. Help me calm my racing thoughts, ground myself in the present, and find a sense of safety and peace.",
  },
  {
    id: "sleep",
    name: "Sleep Preparation",
    duration: "10 min",
    description: "Wind down for restful sleep",
    icon: Moon,
    prompt: "Lead me through a sleep meditation. Help me release the day, relax my body completely, and prepare my mind for deep, restful sleep.",
  },
  {
    id: "gratitude",
    name: "Gratitude",
    duration: "5 min",
    description: "Cultivate appreciation",
    icon: Sparkles,
    prompt: "Guide me through a gratitude meditation. Help me reflect on and appreciate the positive aspects of my life, no matter how small.",
  },
  {
    id: "self-compassion",
    name: "Self-Compassion",
    duration: "7 min",
    description: "Kindness towards yourself",
    icon: Heart,
    prompt: "Lead me through a self-compassion meditation. Help me practice being kind and understanding towards myself, releasing self-criticism and embracing self-love.",
  },
];

const WellnessTools = ({ isOpen, onClose, onSelectMeditation }: WellnessToolsProps) => {
  const [selectedBreathing, setSelectedBreathing] = useState<"box" | "478" | "relaxing" | null>(null);

  const handleMeditationSelect = (meditation: typeof guidedMeditations[0]) => {
    if (onSelectMeditation) {
      onSelectMeditation(meditation.prompt);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold">Wellness Tools</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Breathing Exercises */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Wind className="h-5 w-5 text-primary" />
                  Breathing Exercises
                </h3>
                <div className="grid gap-3">
                  {breathingExercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => setSelectedBreathing(exercise.id as any)}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors text-left"
                    >
                      <div className={cn("p-3 rounded-full", exercise.color)}>
                        <exercise.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{exercise.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {exercise.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Guided Meditations */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Guided Meditations
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a meditation and Loomi will guide you through it
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {guidedMeditations.map((meditation) => (
                    <button
                      key={meditation.id}
                      onClick={() => handleMeditationSelect(meditation)}
                      className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors text-left"
                    >
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <meditation.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{meditation.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {meditation.duration}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {meditation.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Quick Tips */}
              <section className="pb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Quick Wellness Tips
                </h3>
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">🌊</span>
                    <p className="text-sm">
                      <strong>Grounding:</strong> Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">💧</span>
                    <p className="text-sm">
                      <strong>Hydration:</strong> Drinking water can help reduce anxiety and improve focus.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">🚶</span>
                    <p className="text-sm">
                      <strong>Movement:</strong> A short walk can boost mood and reduce stress hormones.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </ScrollArea>
        </div>
      </div>

      <BreathingExercise
        isOpen={selectedBreathing !== null}
        onClose={() => setSelectedBreathing(null)}
        exerciseType={selectedBreathing || "box"}
      />
    </>
  );
};

export default WellnessTools;
