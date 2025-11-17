import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Palette } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTheme: string;
  currentPetType: string;
  onThemeChange: (theme: string) => void;
  onPetTypeChange: (petType: string) => void;
  onProfileUpdate?: () => void;
}

const THEMES = [
  { name: "Light", value: "light" },
  { name: "Warm", value: "warm" },
  { name: "Forest", value: "forest" },
  { name: "Midnight", value: "midnight" },
];

const PETS = [
  { emoji: "🐣", name: "Chick", id: "chick" },
  { emoji: "🐱", name: "Cat", id: "cat" },
  { emoji: "🌱", name: "Sprout", id: "sprout" },
  { emoji: "🤖", name: "Robot", id: "robot" },
  { emoji: "🦊", name: "Fox", id: "fox" },
  { emoji: "🦉", name: "Owl", id: "owl" },
  { emoji: "🐢", name: "Turtle", id: "turtle" },
  { emoji: "🦋", name: "Butterfly", id: "butterfly" },
];

export const EditProfileModal = ({ 
  open, 
  onOpenChange, 
  currentTheme, 
  currentPetType, 
  onThemeChange, 
  onPetTypeChange,
  onProfileUpdate 
}: EditProfileModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadProfile();
    }
  }, [open, user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('name, school, grade')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setName(data.name || "");
      setSchool(data.school || "");
      setGrade(data.grade || "");
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim() || null,
          school: school.trim() || null,
          grade: grade.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({ title: "Profile updated successfully! ✓" });
      if (onProfileUpdate) onProfileUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({ 
        title: "Error updating profile", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Basic Information</h3>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name"
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Your name" 
                disabled={isSaving}
              />
            </div>
            
            <div>
              <Label htmlFor="school">School</Label>
              <Input 
                id="school"
                value={school} 
                onChange={e => setSchool(e.target.value)} 
                placeholder="Your school name" 
                disabled={isSaving}
              />
            </div>
            
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Input 
                id="grade"
                value={grade} 
                onChange={e => setGrade(e.target.value)} 
                placeholder="Your grade (e.g., 10th, Senior)" 
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme
            </Label>
            <Select value={currentTheme} onValueChange={onThemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pet Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Study Pet
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {PETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => onPetTypeChange(p.id)}
                  className={`p-3 rounded-lg text-3xl hover:scale-110 transition-transform ${
                    currentPetType === p.id ? "bg-[#B7D8B5]/30 ring-2 ring-[#B7D8B5]" : "bg-secondary/30"
                  }`}
                  title={p.name}
                >
                  {p.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={saveProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
