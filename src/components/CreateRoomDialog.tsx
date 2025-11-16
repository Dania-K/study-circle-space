import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomCreated: () => void;
}

export const CreateRoomDialog = ({ open, onOpenChange, onRoomCreated }: CreateRoomDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("25");

  const createRoom = async () => {
    if (!title || !subject || !user) return;

    const { error } = await supabase.from('focus_rooms').insert({
      title,
      subject,
      description,
      duration_minutes: parseInt(duration),
      host_id: user.id,
      in_session: false,
    });

    if (!error) {
      toast({ title: "Room created successfully!" });
      setTitle("");
      setSubject("");
      setDescription("");
      setDuration("25");
      onOpenChange(false);
      onRoomCreated();
    } else {
      toast({ title: "Error creating room", variant: "destructive" });
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
            <label className="text-sm font-medium">Room Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Study session name..." />
          </div>
          
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Math, Science, etc..." />
          </div>
          
          <div>
            <label className="text-sm font-medium">Pomodoro Duration</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="25">25 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <Textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="What will you be working on?"
            />
          </div>

          <Button onClick={createRoom} className="w-full" disabled={!title || !subject}>
            Create Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
