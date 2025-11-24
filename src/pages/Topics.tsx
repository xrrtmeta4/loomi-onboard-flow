import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const topics = [
  { id: "comedy", name: "Comedy", icon: "sentiment_very_satisfied" },
  { id: "fitness", name: "Fitness", icon: "fitness_center" },
  { id: "gaming", name: "Gaming", icon: "stadia_controller" },
  { id: "travel", name: "Travel", icon: "flight_takeoff" },
  { id: "art", name: "Art", icon: "brush" },
  { id: "cooking", name: "Cooking", icon: "restaurant" },
  { id: "business", name: "Business", icon: "work" },
  { id: "music", name: "Music", icon: "music_note" },
  { id: "tech", name: "Tech", icon: "desktop_windows" },
  { id: "fashion", name: "Fashion", icon: "styler" },
  { id: "science", name: "Science", icon: "science" },
  { id: "diy", name: "DIY", icon: "construction" },
];

const Topics = () => {
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["comedy", "gaming", "cooking"]);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleContinue = () => {
    if (selectedTopics.length >= 3) {
      navigate("/preferences");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background z-10">
        <button
          onClick={() => navigate("/")}
          className="flex size-12 shrink-0 items-center justify-center"
        >
          <ArrowLeft className="text-foreground h-6 w-6" />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center text-foreground">
          Personalize Your Feed
        </h2>
        <button
          onClick={handleContinue}
          className="text-muted-foreground text-base font-bold leading-normal hover:text-foreground transition-smooth"
        >
          Skip
        </button>
      </header>

      <main className="flex-grow px-4 pb-32">
        {/* Headline */}
        <h1 className="text-foreground text-[32px] font-bold leading-tight tracking-tight pt-6 pb-2">
          What are you into?
        </h1>

        {/* Body Text */}
        <p className="text-muted-foreground text-base font-normal leading-normal pb-6">
          Select at least 3 topics to personalize your feed.
        </p>

        {/* Topics Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          {topics.map((topic) => {
            const isSelected = selectedTopics.includes(topic.id);
            return (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`flex flex-1 cursor-pointer gap-3 rounded-xl p-4 items-center transition-smooth ${
                  isSelected
                    ? "border-2 border-primary bg-primary/20"
                    : "border border-border glass-card hover:border-primary/50"
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    isSelected ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {topic.icon}
                </span>
                <h2 className="text-foreground text-base font-bold leading-tight">
                  {topic.name}
                </h2>
              </button>
            );
          })}
        </div>
      </main>

      {/* Floating Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <Button
          onClick={handleContinue}
          disabled={selectedTopics.length < 3}
          variant="default"
          className="w-full h-14 shadow-lg shadow-primary/30"
        >
          <span className="truncate">Continue ({selectedTopics.length})</span>
        </Button>
      </footer>
    </div>
  );
};

export default Topics;
