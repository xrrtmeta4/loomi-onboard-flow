import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Psychologist {
  id: string;
  name: string;
  specialty: string;
  avatar_url: string | null;
  bio: string | null;
}

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  chat_background: string | null;
  selected_psychologist_id: string | null;
}

const BACKGROUND_OPTIONS = [
  { id: "default", name: "Default", preview: "bg-background" },
  { id: "forest", name: "Forest", preview: "bg-gradient-to-br from-green-900/20 to-emerald-800/20" },
  { id: "ocean", name: "Ocean", preview: "bg-gradient-to-br from-blue-900/20 to-cyan-800/20" },
  { id: "sunset", name: "Sunset", preview: "bg-gradient-to-br from-orange-900/20 to-pink-800/20" },
  { id: "mountains", name: "Mountains", preview: "bg-gradient-to-br from-slate-900/20 to-stone-800/20" },
  { id: "meadow", name: "Meadow", preview: "bg-gradient-to-br from-lime-900/20 to-green-800/20" },
];

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("default");
  const [selectedPsychologist, setSelectedPsychologist] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    setUser(session.user);

    // Load profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
      setDisplayName(profileData.display_name || "");
      setBio(profileData.bio || "");
      setSelectedBackground(profileData.chat_background || "default");
      setSelectedPsychologist(profileData.selected_psychologist_id);
    }

    // Load psychologists
    const { data: psychologistsData } = await supabase
      .from("psychologists")
      .select("*")
      .order("name");

    if (psychologistsData) {
      setPsychologists(psychologistsData);
    }

    setIsLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast({ title: "Avatar updated successfully" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Failed to upload avatar", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          bio,
          chat_background: selectedBackground,
          selected_psychologist_id: selectedPsychologist,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({ title: "Profile saved successfully" });
      navigate("/chat");
    } catch (error) {
      console.error("Save error:", error);
      toast({ title: "Failed to save profile", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Profile Settings</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a photo to personalize your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="text-2xl">
                  {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        <Card>
          <CardHeader>
            <CardTitle>About You</CardTitle>
            <CardDescription>Tell us a bit about yourself</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share a bit about yourself..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Psychologist Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Therapist</CardTitle>
            <CardDescription>Select a psychologist that matches your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {psychologists.map((psych) => (
                <div
                  key={psych.id}
                  onClick={() => setSelectedPsychologist(psych.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                    selectedPsychologist === psych.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={psych.avatar_url || ""} />
                    <AvatarFallback>{psych.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{psych.name}</h4>
                    <p className="text-sm text-primary">{psych.specialty}</p>
                    <p className="text-sm text-muted-foreground mt-1">{psych.bio}</p>
                  </div>
                  {selectedPsychologist === psych.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Background Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Chat Background</CardTitle>
            <CardDescription>Choose a calming background for your chat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {BACKGROUND_OPTIONS.map((bg) => (
                <div
                  key={bg.id}
                  onClick={() => setSelectedBackground(bg.id)}
                  className={cn(
                    "aspect-video rounded-lg cursor-pointer transition-all border-2 flex items-center justify-center",
                    bg.preview,
                    selectedBackground === bg.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-primary/50"
                  )}
                >
                  <span className="text-sm font-medium">{bg.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full" size="lg" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
