import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Timer, Users, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const MOODS = ["😊", "😤", "🎯", "💪", "🧘", "🔥"];

const Rooms = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      supabase.from('focus_rooms').select('*').order('created_at', { ascending: false }).then(({ data }) => setRooms(data || []));
    }
  }, [user]);

  const joinRoom = async () => {
    if (!selectedMood || !currentTask || !user) return;
    const { data: subtasksData } = await supabase.functions.invoke('generate-subtasks', { body: { taskText: currentTask } });
    await supabase.from('sessions').insert({ room_id: selectedRoom.id, user_id: user.id, task_text: currentTask, mood: selectedMood, subtasks: subtasksData?.subtasks || [] });
    setInRoom(true);
    toast({ title: "Joined!" });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Focus Rooms</h1>
      {selectedRoom ? (
        <Card className="p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Join Room</h2>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">How are you feeling?</label>
              <div className="flex gap-2">
                {MOODS.map(mood => (
                  <button key={mood} onClick={() => setSelectedMood(mood)} className={`text-4xl p-3 rounded-xl ${selectedMood === mood ? "bg-primary/20" : "bg-muted/50"}`}>{mood}</button>
                ))}
              </div>
            </div>
            <Input placeholder="Task..." value={currentTask} onChange={e => setCurrentTask(e.target.value)} />
            <div className="flex gap-2">
              <Button className="flex-1 bg-gradient-primary" onClick={joinRoom} disabled={!selectedMood || !currentTask}>Join</Button>
              <Button variant="outline" onClick={() => setSelectedRoom(null)}>Cancel</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rooms.map(room => (
            <Card key={room.id} className="p-6 cursor-pointer" onClick={() => setSelectedRoom(room)}>
              <h3 className="font-semibold text-lg">{room.title}</h3>
              <Badge variant="secondary">{room.subject}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;