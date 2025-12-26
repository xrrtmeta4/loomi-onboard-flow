import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreathingExerciseProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseType?: "box" | "478" | "relaxing" | "energizing";
}

const exercises = {
  box: {
    name: "Box Breathing",
    description: "A calming technique used by Navy SEALs to reduce stress",
    phases: [
      { name: "Inhale", duration: 4 },
      { name: "Hold", duration: 4 },
      { name: "Exhale", duration: 4 },
      { name: "Hold", duration: 4 },
    ],
    cycles: 4,
  },
  "478": {
    name: "4-7-8 Breathing",
    description: "A natural tranquilizer for the nervous system",
    phases: [
      { name: "Inhale", duration: 4 },
      { name: "Hold", duration: 7 },
      { name: "Exhale", duration: 8 },
    ],
    cycles: 4,
  },
  relaxing: {
    name: "Deep Relaxation",
    description: "Slow, deep breaths to promote relaxation",
    phases: [
      { name: "Inhale", duration: 5 },
      { name: "Hold", duration: 2 },
      { name: "Exhale", duration: 6 },
    ],
    cycles: 5,
  },
  energizing: {
    name: "Energizing Breath",
    description: "Quick, rhythmic breaths to boost energy and alertness",
    phases: [
      { name: "Inhale", duration: 2 },
      { name: "Exhale", duration: 2 },
    ],
    cycles: 10,
  },
};

const BreathingExercise = ({
  isOpen,
  onClose,
  exerciseType = "box",
}: BreathingExerciseProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const exercise = exercises[exerciseType];

  const reset = useCallback(() => {
    setIsRunning(false);
    setCurrentPhase(0);
    setCurrentCycle(1);
    setTimeLeft(exercise.phases[0].duration);
    setIsComplete(false);
  }, [exercise]);

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, exerciseType, reset]);

  useEffect(() => {
    if (!isRunning || isComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          const nextPhase = currentPhase + 1;
          if (nextPhase >= exercise.phases.length) {
            // Move to next cycle
            const nextCycle = currentCycle + 1;
            if (nextCycle > exercise.cycles) {
              setIsComplete(true);
              setIsRunning(false);
              return 0;
            }
            setCurrentCycle(nextCycle);
            setCurrentPhase(0);
            return exercise.phases[0].duration;
          }
          setCurrentPhase(nextPhase);
          return exercise.phases[nextPhase].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, currentPhase, currentCycle, exercise, isComplete]);

  const toggleRunning = () => {
    if (isComplete) {
      reset();
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const currentPhaseName = exercise.phases[currentPhase]?.name || "";
  const totalDuration = exercise.phases[currentPhase]?.duration || 1;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  // Calculate circle scale based on phase
  const getCircleScale = () => {
    if (!isRunning) return 1;
    if (currentPhaseName === "Inhale") return 1 + (progress / 100) * 0.5;
    if (currentPhaseName === "Exhale") return 1.5 - (progress / 100) * 0.5;
    return currentPhaseName === "Hold" && currentPhase > 0 ? 1.5 : 1;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4"
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{exercise.name}</h2>
        <p className="text-muted-foreground">{exercise.description}</p>
      </div>

      {/* Breathing Circle */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <div
          className={cn(
            "absolute w-48 h-48 rounded-full bg-primary/20 transition-transform duration-1000 ease-in-out",
            isRunning && "animate-pulse"
          )}
          style={{
            transform: `scale(${getCircleScale()})`,
          }}
        />
        <div className="relative z-10 text-center">
          {isComplete ? (
            <>
              <p className="text-3xl font-bold text-primary mb-2">Complete!</p>
              <p className="text-muted-foreground">Great job!</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-primary mb-2">
                {isRunning ? currentPhaseName : "Ready"}
              </p>
              <p className="text-5xl font-bold">{isRunning ? timeLeft : "—"}</p>
              <p className="text-muted-foreground mt-2">
                Cycle {currentCycle} of {exercise.cycles}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button onClick={toggleRunning} size="lg" className="gap-2">
          {isComplete ? (
            <>
              <RotateCcw className="h-5 w-5" />
              Restart
            </>
          ) : isRunning ? (
            <>
              <Pause className="h-5 w-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Start
            </>
          )}
        </Button>
        {!isComplete && isRunning && (
          <Button onClick={reset} variant="outline" size="lg">
            <RotateCcw className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Phase Indicators */}
      <div className="flex gap-2 mt-8">
        {exercise.phases.map((phase, index) => (
          <div
            key={index}
            className={cn(
              "px-3 py-1 rounded-full text-sm transition-colors",
              index === currentPhase && isRunning
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {phase.name} ({phase.duration}s)
          </div>
        ))}
      </div>
    </div>
  );
};

export default BreathingExercise;
