import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Wind, Brain, Heart, Moon, Sparkles, Lock, Leaf, Sun, CloudRain, Music, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import BreathingExercise from "./BreathingExercise";

interface WellnessToolsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMeditation?: (meditation: string) => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const breathingExercises = [
  {
    id: "box",
    name: "Box Breathing",
    description: "4-4-4-4 pattern for calm focus",
    icon: Wind,
    color: "bg-blue-500/10 text-blue-500",
    premium: false,
  },
  {
    id: "478",
    name: "4-7-8 Breathing",
    description: "Natural tranquilizer technique",
    icon: Moon,
    color: "bg-purple-500/10 text-purple-500",
    premium: false,
  },
  {
    id: "relaxing",
    name: "Deep Relaxation",
    description: "Slow breaths for deep calm",
    icon: Heart,
    color: "bg-pink-500/10 text-pink-500",
    premium: true,
  },
  {
    id: "energizing",
    name: "Energizing Breath",
    description: "Quick breaths to boost energy",
    icon: Sun,
    color: "bg-orange-500/10 text-orange-500",
    premium: true,
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
    premium: false,
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    duration: "5 min",
    description: "Present moment awareness",
    icon: Brain,
    prompt: "Lead me through a mindfulness meditation. Help me focus on the present moment, observing my thoughts without judgment, and finding peace in the now.",
    premium: false,
  },
  {
    id: "anxiety-relief",
    name: "Anxiety Relief",
    duration: "5-7 min",
    description: "Calm racing thoughts",
    icon: Heart,
    prompt: "Guide me through a meditation specifically for anxiety relief. Help me calm my racing thoughts, ground myself in the present, and find a sense of safety and peace.",
    premium: false,
  },
  {
    id: "sleep",
    name: "Sleep Preparation",
    duration: "10 min",
    description: "Wind down for restful sleep",
    icon: Moon,
    prompt: "Lead me through a sleep meditation. Help me release the day, relax my body completely, and prepare my mind for deep, restful sleep.",
    premium: true,
  },
  {
    id: "gratitude",
    name: "Gratitude",
    duration: "5 min",
    description: "Cultivate appreciation",
    icon: Sparkles,
    prompt: "Guide me through a gratitude meditation. Help me reflect on and appreciate the positive aspects of my life, no matter how small.",
    premium: true,
  },
  {
    id: "self-compassion",
    name: "Self-Compassion",
    duration: "7 min",
    description: "Kindness towards yourself",
    icon: Heart,
    prompt: "Lead me through a self-compassion meditation. Help me practice being kind and understanding towards myself, releasing self-criticism and embracing self-love.",
    premium: true,
  },
  {
    id: "stress-release",
    name: "Stress Release",
    duration: "8 min",
    description: "Let go of daily tensions",
    icon: CloudRain,
    prompt: "Guide me through a stress release meditation. Help me identify where I'm holding stress in my body and mind, and guide me to release it completely.",
    premium: true,
  },
  {
    id: "focus",
    name: "Focus & Clarity",
    duration: "5 min",
    description: "Sharpen mental clarity",
    icon: Eye,
    prompt: "Lead me through a meditation for focus and mental clarity. Help me clear mental fog, sharpen my concentration, and prepare my mind for productive work.",
    premium: true,
  },
  {
    id: "nature-visualization",
    name: "Nature Visualization",
    duration: "10 min",
    description: "Peaceful nature journey",
    icon: Leaf,
    prompt: "Guide me through a nature visualization meditation. Take me on a peaceful journey through a beautiful natural setting, engaging all my senses for deep relaxation.",
    premium: true,
  },
  {
    id: "healing",
    name: "Emotional Healing",
    duration: "12 min",
    description: "Process difficult emotions",
    icon: Heart,
    prompt: "Lead me through an emotional healing meditation. Help me safely process and release difficult emotions, offering myself compassion and understanding.",
    premium: true,
  },
];

const soundscapes = [
  { id: "rain", name: "Gentle Rain", icon: CloudRain, premium: true },
  { id: "forest", name: "Forest Sounds", icon: Leaf, premium: true },
  { id: "ocean", name: "Ocean Waves", icon: Wind, premium: true },
  { id: "music", name: "Calm Music", icon: Music, premium: true },
];

const WellnessTools = ({ isOpen, onClose, onSelectMeditation, isPremium = false, onUpgrade }: WellnessToolsProps) => {
  const [selectedBreathing, setSelectedBreathing] = useState<"box" | "478" | "relaxing" | "energizing" | null>(null);

  const handleMeditationSelect = (meditation: typeof guidedMeditations[0]) => {
    if (meditation.premium && !isPremium) {
      onUpgrade?.();
      return;
    }
    if (onSelectMeditation) {
      onSelectMeditation(meditation.prompt);
      onClose();
    }
  };

  const handleBreathingSelect = (exercise: typeof breathingExercises[0]) => {
    if (exercise.premium && !isPremium) {
      onUpgrade?.();
      return;
    }
    setSelectedBreathing(exercise.id as any);
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
              {/* Premium Banner for Free Users */}
              {!isPremium && (
                <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl p-4 border border-primary/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Unlock All Wellness Tools</h4>
                      <p className="text-sm text-muted-foreground">
                        Upgrade to Premium for access to all meditations, breathing exercises, and soundscapes.
                      </p>
                    </div>
                    <Button onClick={onUpgrade} size="sm">
                      Upgrade
                    </Button>
                  </div>
                </div>
              )}

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
                      onClick={() => handleBreathingSelect(exercise)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors text-left relative",
                        exercise.premium && !isPremium && "opacity-75"
                      )}
                    >
                      <div className={cn("p-3 rounded-full", exercise.color)}>
                        <exercise.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium flex items-center gap-2">
                          {exercise.name}
                          {exercise.premium && !isPremium && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {exercise.description}
                        </p>
                      </div>
                      {exercise.premium && !isPremium && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          Premium
                        </span>
                      )}
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
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors text-left relative",
                        meditation.premium && !isPremium && "opacity-75"
                      )}
                    >
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <meditation.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            {meditation.name}
                            {meditation.premium && !isPremium && (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {meditation.duration}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {meditation.description}
                        </p>
                      </div>
                      {meditation.premium && !isPremium && (
                        <span className="absolute top-2 right-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Premium
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Soundscapes - Premium Only */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Music className="h-5 w-5 text-primary" />
                  Ambient Soundscapes
                  {!isPremium && <Lock className="h-4 w-4 text-muted-foreground" />}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {soundscapes.map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => !isPremium && onUpgrade?.()}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl bg-card border border-border transition-colors text-left",
                        isPremium ? "hover:border-primary/50" : "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <sound.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{sound.name}</span>
                      {!isPremium && <Lock className="h-3 w-3 text-muted-foreground ml-auto" />}
                    </button>
                  ))}
                </div>
                {!isPremium && (
                  <p className="text-sm text-muted-foreground mt-3 text-center">
                    Upgrade to Premium to unlock ambient soundscapes
                  </p>
                )}
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
                  <div className="flex items-start gap-3">
                    <span className="text-lg">🌿</span>
                    <p className="text-sm">
                      <strong>Nature:</strong> Spending time outdoors can significantly reduce cortisol levels.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">😴</span>
                    <p className="text-sm">
                      <strong>Sleep:</strong> Aim for 7-9 hours of sleep for optimal mental health.
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
