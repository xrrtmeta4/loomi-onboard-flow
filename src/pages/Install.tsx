import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Smartphone, Monitor, Share } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img src="/logo.jpg" alt="Loomi" className="h-24 w-24 rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Install Loomi</h1>
          <p className="text-muted-foreground text-lg">
            Get the full app experience with offline access and push notifications
          </p>
        </div>

        {isInstalled && (
          <Card className="p-6 bg-primary/10 border-primary">
            <div className="text-center space-y-2">
              <Download className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Already Installed!</h2>
              <p className="text-muted-foreground">Loomi is installed on your device</p>
              <Button onClick={() => navigate('/feed')} className="mt-4">
                Open App
              </Button>
            </div>
          </Card>
        )}

        {!isInstalled && isInstallable && !isIOS && (
          <Card className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <Monitor className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Install on Desktop/Android</h2>
              <p className="text-muted-foreground">
                Click the button below to install Loomi as an app
              </p>
            </div>
            <Button 
              onClick={handleInstall} 
              size="lg" 
              className="w-full text-lg h-14"
            >
              <Download className="mr-2 h-5 w-5" />
              Install Now
            </Button>
          </Card>
        )}

        {!isInstalled && isIOS && (
          <Card className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <Smartphone className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Install on iPhone/iPad</h2>
            </div>
            <div className="space-y-4 text-foreground">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Tap the Share button</p>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <Share className="h-5 w-5" />
                    <span className="text-sm">in Safari's menu bar</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Select "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scroll down and find this option
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Tap "Add"</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Loomi will appear on your home screen
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {!isInstalled && !isInstallable && !isIOS && (
          <Card className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <Monitor className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-semibold text-foreground">Browser Not Supported</h2>
              <p className="text-muted-foreground">
                To install Loomi, please use Chrome, Edge, or another supported browser
              </p>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Offline Access</h3>
            <p className="text-sm text-muted-foreground">Watch videos even without internet</p>
          </Card>
          <Card className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Native Experience</h3>
            <p className="text-sm text-muted-foreground">Feels like a real app</p>
          </Card>
          <Card className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Monitor className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Quick Launch</h3>
            <p className="text-sm text-muted-foreground">Access from home screen</p>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/feed')}>
            Continue in Browser
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Install;
