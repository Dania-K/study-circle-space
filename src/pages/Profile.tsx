import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Palette, Sparkles } from "lucide-react";

const THEMES = [
  { name: "Light", value: "light", colors: "from-blue-50 to-teal-50" },
  { name: "Soft", value: "soft", colors: "from-purple-50 to-pink-50" },
  { name: "Neutral", value: "neutral", colors: "from-gray-50 to-slate-50" },
  { name: "High-Contrast", value: "high-contrast", colors: "from-white to-gray-100" }
];

const PETS = [
  { emoji: "🐣", name: "Chick", id: "chick" },
  { emoji: "🐱", name: "Cat", id: "cat" },
  { emoji: "🌱", name: "Sprout", id: "sprout" },
  { emoji: "🤖", name: "Robot", id: "robot" },
  { emoji: "🦊", name: "Fox", id: "fox" },
  { emoji: "🦉", name: "Owl", id: "owl" },
  { emoji: "🐢", name: "Turtle", id: "turtle" },
  { emoji: "🦋", name: "Butterfly", id: "butterfly" }
];

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [selectedPet, setSelectedPet] = useState("chick");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();
    
    if (data) {
      setProfile(data);
      // Load saved theme and pet from localStorage
      const savedTheme = localStorage.getItem('user_theme') || "light";
      const savedPet = localStorage.getItem('user_pet') || "chick";
      setSelectedTheme(savedTheme);
      setSelectedPet(savedPet);
    }
  };

  const saveTheme = async (theme: string) => {
    setSelectedTheme(theme);
    localStorage.setItem('user_theme', theme);
    toast({ title: "Theme updated! 🎨" });
  };

  const savePet = async (pet: string) => {
    setSelectedPet(pet);
    localStorage.setItem('user_pet', pet);
    toast({ title: "Pet selected! 🎉" });
  };

  if (loading || !profile) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Customize your StudiCircle experience</p>
      </div>

      {/* User Info */}
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-4xl">
            {PETS.find(p => p.id === selectedPet)?.emoji || "🐣"}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile.name || profile.username}</h2>
            <div className="flex gap-2 mt-2">
              <Badge>Level {profile.level}</Badge>
              <Badge variant="secondary">{profile.total_lifetime_xp} XP</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Theme Selection */}
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Theme</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {THEMES.map((theme) => (
            <button
              key={theme.value}
              onClick={() => saveTheme(theme.value)}
              className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                selectedTheme === theme.value
                  ? "border-primary shadow-glow"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className={`w-full h-16 rounded-lg bg-gradient-to-br ${theme.colors} mb-2`} />
              <p className="font-medium text-sm">{theme.name}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Pet Selection */}
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="text-xl font-semibold">Study Pet</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Your pet grows with your XP! Choose your companion wisely.
        </p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {PETS.map((pet) => (
            <button
              key={pet.id}
              onClick={() => savePet(pet.id)}
              className={`p-4 rounded-xl border-2 transition-all hover:scale-110 ${
                selectedPet === pet.id
                  ? "border-accent shadow-glow bg-accent/5"
                  : "border-border hover:border-accent/50"
              }`}
              title={pet.name}
            >
              <div className="text-4xl">{pet.emoji}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Selected: <span className="font-medium">{PETS.find(p => p.id === selectedPet)?.name}</span>
          </p>
        </div>
      </Card>

      {/* Stats Summary */}
      <Card className="p-6 glass-card">
        <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{profile.level}</div>
            <div className="text-sm text-muted-foreground">Level</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">{profile.xp}</div>
            <div className="text-sm text-muted-foreground">Current XP</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{profile.total_lifetime_xp}</div>
            <div className="text-sm text-muted-foreground">Total XP</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">{profile.streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
