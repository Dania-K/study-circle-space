import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Search, Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CreateRoomDialog } from "@/components/CreateRoomDialog";

const MOODS = ["😊", "😤", "🎯", "💪", "🧘", "🔥"];

const Rooms = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) loadRooms();
  }, [user]);

  useEffect(() => {
    const filtered = rooms.filter(room =>
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRooms(filtered);
  }, [searchQuery, rooms]);

  const loadRooms = async () => {
    const { data, error } = await supabase
      .from('focus_rooms')
      .select('*, sessions(count)')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      const roomsWithCount = data.map(room => ({
        ...room,
        participantCount: room.sessions?.[0]?.count || 0
      }));
      setRooms(roomsWithCount);
      setFilteredRooms(roomsWithCount);
    }
  };

  const joinRoom = async () => {
    if (!selectedMood || !currentTask || !user || !selectedRoom) return;

    // Generate AI subtasks
    const { data: aiData } = await supabase.functions.invoke('generate-subtasks', {
      body: { taskText: currentTask, mood: selectedMood, duration: selectedRoom.duration_minutes }
    });

    const generatedSubtasks = aiData?.subtasks || [];
    setSubtasks(generatedSubtasks);

    // Create session
    await supabase.from('sessions').insert({
      room_id: selectedRoom.id,
      user_id: user.id,
      task_text: currentTask,
      mood: selectedMood,
      subtasks: generatedSubtasks,
    });

    // Start timer
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + selectedRoom.duration_minutes);
    
    await supabase.from('focus_rooms').update({
      in_session: true,
      timer_end_timestamp: endTime.toISOString()
    }).eq('id', selectedRoom.id);

    setTimeLeft(selectedRoom.duration_minutes * 60);
    setInRoom(true);
    toast({ title: "Joined room! Focus time starts now 🎯" });
  };

  const completeSubtask = async (index: number) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = { ...newSubtasks[index], completed: true };
    setSubtasks(newSubtasks);

    // Award XP
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, total_lifetime_xp, level')
      .eq('id', user!.id)
      .single();

    if (profile) {
      const newXP = profile.xp + 5;
      const newTotalXP = profile.total_lifetime_xp + 5;
      const newLevel = Math.floor(newTotalXP / 100) + 1;

      await supabase.from('profiles').update({
        xp: newXP,
        total_lifetime_xp: newTotalXP,
        level: newLevel
      }).eq('id', user!.id);

      toast({ title: "+5 XP! 🎉" });
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && inRoom) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, inRoom]);

  if (loading) return <div>Loading...</div>;

  if (inRoom && selectedRoom) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
      <div className="min-h-screen p-6">
        <Card className="max-w-3xl mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{selectedRoom.title}</h1>
            <Badge variant="secondary">{selectedRoom.subject}</Badge>
          </div>

          <div className="text-center mb-8">
            <div className="text-6xl font-bold mb-4">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <Progress value={(1 - timeLeft / (selectedRoom.duration_minutes * 60)) * 100} className="mb-4" />
            <p className="text-muted-foreground">Working on: {currentTask}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg mb-3">Your Tasks:</h3>
            {subtasks.map((subtask, index) => (
              <Card key={index} className={`p-4 flex items-center gap-3 ${subtask.completed ? 'opacity-50' : ''}`}>
                <button
                  onClick={() => !subtask.completed && completeSubtask(index)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    subtask.completed ? 'bg-primary border-primary' : 'border-muted-foreground'
                  }`}
                >
                  {subtask.completed && <Check className="w-4 h-4 text-primary-foreground" />}
                </button>
                <span className={subtask.completed ? 'line-through' : ''}>{subtask}</span>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full mt-6"
            onClick={() => {
              setInRoom(false);
              setSelectedRoom(null);
              loadRooms();
            }}
          >
            Leave Room
          </Button>
        </Card>
      </div>
    );
  }

  if (selectedRoom) {
    return (
      <div className="min-h-screen p-6">
        <Card className="max-w-2xl mx-auto p-8">
          <h2 className="text-2xl font-bold mb-6">Join {selectedRoom.title}</h2>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">How are you feeling today?</label>
              <div className="flex gap-2 flex-wrap">
                {MOODS.map(mood => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`text-4xl p-3 rounded-xl transition-all ${
                      selectedMood === mood ? 'bg-primary/20 scale-110' : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">What will you work on?</label>
              <Input
                placeholder="e.g., Complete math homework chapter 5..."
                value={currentTask}
                onChange={e => setCurrentTask(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-gradient-primary"
                onClick={joinRoom}
                disabled={!selectedMood || !currentTask}
              >
                Start Focusing
              </Button>
              <Button variant="outline" onClick={() => setSelectedRoom(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Focus Rooms 🎯</h1>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by subject or title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map(room => (
            <Card
              key={room.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setSelectedRoom(room)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{room.title}</h3>
                <Badge variant="secondary">{room.subject}</Badge>
              </div>
              
              {room.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{room.description}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{room.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{room.participantCount} studying</span>
                </div>
                {room.in_session && (
                  <Badge variant="default" className="w-full justify-center">Active Now</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No rooms found. Create one to get started!</p>
          </Card>
        )}
      </div>

      <CreateRoomDialog 
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onRoomCreated={loadRooms}
      />
    </div>
  );
};

export default Rooms;
