import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomCreated: () => void;
}

export const CreateRoomDialog = ({ open, onOpenChange, onRoomCreated }: CreateRoomDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("25");
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; subject?: string; duration?: string }>({});

  const validateForm = () => {
    const newErrors: { title?: string; subject?: string; duration?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = "Room title is required";
    }
    
    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    const durationNum = parseInt(duration);
    if (!durationNum || durationNum <= 0) {
      newErrors.duration = "Duration must be greater than 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createRoom = async () => {
    // Check if user is logged in
    if (!user) {
      toast({ 
        title: "Please sign in", 
        description: "You need to be logged in to create a room",
        variant: "destructive" 
      });
      navigate("/auth");
      return;
    }

    // Client-side validation
    if (!validateForm()) {
      toast({ 
        title: "Missing required fields", 
        description: "Please fill in all required fields",
        variant: "destructive" 
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create the room
      const { data: roomData, error: roomError } = await supabase
        .from('focus_rooms')
        .insert({
          title: title.trim(),
          subject: subject.trim(),
          description: description.trim() || null,
          duration_minutes: parseInt(duration),
          host_id: user.id,
          in_session: false,
        })
        .select()
        .single();

      if (roomError) {
        console.error('Room creation error:', roomError);
        
        // Handle specific error types
        if (roomError.message.toLowerCase().includes('privacy') || 
            roomError.message.toLowerCase().includes('violate') ||
            roomError.message.toLowerCase().includes('policy')) {
          throw new Error("Unable to create room: app privacy rules blocking creation. Please report this issue.");
        } else if (roomError.message.toLowerCase().includes('required')) {
          throw new Error("Missing required field. Please check all fields are filled correctly.");
        } else {
          throw new Error(roomError.message || "Failed to create room");
        }
      }

      if (!roomData) {
        throw new Error("Room created but no data returned");
      }

      // Create initial session for the host
      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          room_id: roomData.id,
          user_id: user.id,
          task_text: "",
          mood: null,
          start_time: new Date().toISOString(),
        });

      if (sessionError) {
        console.warn('Session creation warning:', sessionError);
        // Don't fail the whole operation if session creation fails
      }

      toast({ title: "Room created successfully! 🎉" });
      
      // Reset form
      setTitle("");
      setSubject("");
      setDescription("");
      setDuration("25");
      setErrors({});
      
      onOpenChange(false);
      onRoomCreated();
    } catch (error: any) {
      console.error('Create room error:', error);
      toast({ 
        title: "Error creating room", 
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Focus Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Room Title *</label>
            <Input 
              value={title} 
              onChange={e => {
                setTitle(e.target.value);
                setErrors(prev => ({ ...prev, title: undefined }));
              }} 
              placeholder="Study session name..." 
              className={errors.title ? "border-destructive" : ""}
              disabled={isCreating}
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>
          
          <div>
            <label className="text-sm font-medium">Subject *</label>
            <Input 
              value={subject} 
              onChange={e => {
                setSubject(e.target.value);
                setErrors(prev => ({ ...prev, subject: undefined }));
              }} 
              placeholder="Math, Science, etc..." 
              className={errors.subject ? "border-destructive" : ""}
              disabled={isCreating}
            />
            {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
          </div>
          
          <div>
            <label className="text-sm font-medium">Pomodoro Duration *</label>
            <Select value={duration} onValueChange={setDuration} disabled={isCreating}>
              <SelectTrigger className={errors.duration ? "border-destructive" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="25">25 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
            {errors.duration && <p className="text-xs text-destructive mt-1">{errors.duration}</p>}
          </div>
          
          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <Textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="What will you be working on?"
              disabled={isCreating}
            />
          </div>

          <Button onClick={createRoom} className="w-full" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Room"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
