import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProfileModal = ({ open, onOpenChange }: EditProfileModalProps) => {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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

          <div className="flex gap-2 justify-end">
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
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
