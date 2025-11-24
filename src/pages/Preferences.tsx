import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";

const Preferences = () => {
  const navigate = useNavigate();
  const [sliders, setSliders] = useState({
    funnyEducational: 45,
    irlEdited: 60,
    repostsOriginals: 75,
  });

  const handleSliderChange = (key: keyof typeof sliders, value: number) => {
    setSliders((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center bg-background p-4 pb-2 justify-between sticky top-0 z-10">
        <button
          onClick={() => navigate("/topics")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-muted transition-smooth"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-foreground text-base font-bold leading-tight tracking-tight flex-1 text-center">
          Step 2 of 3
        </h2>
        <div className="size-10 shrink-0" />
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 pt-6 pb-40">
        {/* Headline */}
        <h1 className="text-foreground tracking-tight text-[32px] font-bold leading-tight text-left pb-2">
          Tune Your Feed
        </h1>
        <p className="text-muted-foreground text-base font-normal leading-normal pb-8">
          Help us find the videos you'll love. You can always change this later.
        </p>

        {/* Sliders */}
        <div className="flex flex-col gap-8">
          {/* Slider 1 */}
          <div className="w-full">
            <div className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground mb-2">
              <span>Funny</span>
              <span>Educational</span>
            </div>
            <div className="relative flex h-2 w-full items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={sliders.funnyEducational}
                onChange={(e) => handleSliderChange("funnyEducational", Number(e.target.value))}
                className="slider-custom w-full h-1"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${sliders.funnyEducational}%, hsl(var(--muted)) ${sliders.funnyEducational}%, hsl(var(--muted)) 100%)`,
                }}
              />
            </div>
          </div>

          {/* Slider 2 */}
          <div className="w-full">
            <div className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground mb-2">
              <span>IRL</span>
              <span>Edited</span>
            </div>
            <div className="relative flex h-2 w-full items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={sliders.irlEdited}
                onChange={(e) => handleSliderChange("irlEdited", Number(e.target.value))}
                className="slider-custom w-full h-1"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${sliders.irlEdited}%, hsl(var(--muted)) ${sliders.irlEdited}%, hsl(var(--muted)) 100%)`,
                }}
              />
            </div>
          </div>

          {/* Slider 3 */}
          <div className="w-full">
            <div className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground mb-2">
              <span>Less Reposts</span>
              <span>Originals</span>
            </div>
            <div className="relative flex h-2 w-full items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={sliders.repostsOriginals}
                onChange={(e) => handleSliderChange("repostsOriginals", Number(e.target.value))}
                className="slider-custom w-full h-1"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${sliders.repostsOriginals}%, hsl(var(--muted)) ${sliders.repostsOriginals}%, hsl(var(--muted)) 100%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* TikTok Import Card */}
        <div 
          onClick={() => navigate("/feed")}
          className="mt-12 rounded-xl border border-border glass-card p-4 hover:border-primary/50 transition-smooth cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-foreground shrink-0">
              <svg className="w-7 h-7 text-background" fill="currentColor" viewBox="0 0 448 512">
                <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm sm:text-base">Bring your content with you</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Import your TikTok drafts to Loomi.</p>
            </div>
            <button className="flex items-center justify-center size-10 rounded-full text-muted-foreground hover:bg-muted transition-smooth shrink-0">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <footer className="fixed bottom-0 left-0 right-0 glass backdrop-blur-sm p-4 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 max-w-md mx-auto">
          <Button 
            onClick={() => navigate("/feed")}
            variant="default" 
            className="w-full h-12 text-sm sm:text-base"
          >
            Continue
          </Button>
          <Button 
            onClick={() => navigate("/feed")}
            variant="ghost" 
            className="w-full h-12 text-sm sm:text-base"
          >
            Skip for now
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Preferences;
