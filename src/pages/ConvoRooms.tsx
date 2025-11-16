import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, MessageCircle, Sparkles } from "lucide-react";
import { ConvoRoomChat } from "@/components/ConvoRoomChat";

const INTEREST_OPTIONS = ["Math", "Science", "Literature", "History", "Art", "Music", "Sports", "Gaming", "Coding", "Languages"];

const TALKING_PROMPTS = [
  "What's one study habit that really works for you?",
  "What subject are you most excited about right now?",
  "Share your biggest academic goal this semester",
  "What motivates you to study?",
  "What's the hardest thing you're working on?",
  "How do you stay focused during long study sessions?",
  "What's your dream career or field?",
  "Share a recent achievement you're proud of!",
];

const ConvoRooms = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState("");
  const [goals, setGoals] = useState("");
  const [classes, setClasses] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [userInterests, setUserInterests] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadUserInterests();
      loadRooms();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRoom) {
      const randomPrompt = TALKING_PROMPTS[Math.floor(Math.random() * TALKING_PROMPTS.length)];
      setCurrentPrompt(randomPrompt);
    }
  }, [selectedRoom]);

  const loadUserInterests = async () => {
    const { data } = await supabase
      .from('user_interests')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();
    
    setUserInterests(data);
    if (!data) setShowQuiz(true);
  };

  const loadRooms = async () => {
    const { data } = await supabase
      .from('social_rooms')
      .select('*')
      .eq('is_active', true);
    setRooms(data || []);
  };

  const submitQuiz = async () => {
    const { error } = await supabase.from('user_interests').upsert({
      user_id: user!.id,
      interests: selectedInterests,
      hobbies: hobbies.split(',').map(h => h.trim()),
      goals: goals.split(',').map(g => g.trim()),
      classes: classes.split(',').map(c => c.trim()),
    });

    if (!error) {
      toast({ title: "Profile saved! Finding your rooms..." });
      setShowQuiz(false);
      loadUserInterests();
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const createRoom = async (category: string) => {
    const { error } = await supabase.from('social_rooms').insert({
      name: `${category} Study Circle`,
      category,
      host_id: user!.id,
      description: `Connect and chat with others interested in ${category}`,
    });

    if (!error) {
      toast({ title: "Convo room created!" });
      loadRooms();
    }
  };

  if (loading) return <div>Loading...</div>;

  if (showQuiz) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <Card className="max-w-2xl mx-auto p-8 shadow-card">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            Tell us about yourself! <Sparkles className="w-7 h-7 text-primary" />
          </h1>
          <p className="text-muted-foreground mb-6">Help us match you with the right study circles</p>
          
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-3">What are you interested in?</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(interest => (
                  <Badge
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">Your Hobbies (comma separated)</label>
              <Input value={hobbies} onChange={e => setHobbies(e.target.value)} placeholder="Reading, Gaming, Hiking..." />
            </div>

            <div>
              <label className="block font-medium mb-2">Your Goals (comma separated)</label>
              <Input value={goals} onChange={e => setGoals(e.target.value)} placeholder="Graduate, Learn Python, Pass exam..." />
            </div>

            <div>
              <label className="block font-medium mb-2">Your Classes (comma separated)</label>
              <Input value={classes} onChange={e => setClasses(e.target.value)} placeholder="Math 101, Biology, History..." />
            </div>

            <Button className="w-full bg-gradient-primary" onClick={submitQuiz} disabled={selectedInterests.length === 0}>
              Find My Study Circles
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (selectedRoom) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => setSelectedRoom(null)}>
            ← Back to Rooms
          </Button>

          <Card className="p-6 shadow-card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {selectedRoom.name}
                  <MessageCircle className="w-6 h-6 text-primary" />
                </h2>
                <Badge variant="secondary" className="mt-2">{selectedRoom.category}</Badge>
              </div>
            </div>

            <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <p className="font-semibold text-sm mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Today's talking prompt:
              </p>
              <p className="text-foreground">{currentPrompt}</p>
            </Card>

            <ConvoRoomChat roomId={selectedRoom.id} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Convo Rooms <MessageCircle className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-muted-foreground">Connect and chat with fellow students</p>
          </div>
          <Button variant="outline" onClick={() => setShowQuiz(true)}>Edit Profile</Button>
        </div>

        {userInterests && (
          <Card className="p-6 shadow-card">
            <h2 className="text-xl font-semibold mb-3">Your Interests</h2>
            <div className="flex flex-wrap gap-2">
              {userInterests.interests?.map((interest: string) => (
                <Badge key={interest} className="px-3 py-1">{interest}</Badge>
              ))}
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <Card 
              key={room.id} 
              className="p-6 cursor-pointer hover:shadow-hover transition-all hover:scale-[1.02]"
              onClick={() => setSelectedRoom(room)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{room.name}</h3>
                <Badge variant="secondary">{room.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{room.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Active conversations</span>
              </div>
            </Card>
          ))}
        </div>

        {userInterests?.interests?.length > 0 && (
          <Card className="p-6 shadow-card">
            <h2 className="text-xl font-semibold mb-4">Create a Convo Room</h2>
            <div className="flex flex-wrap gap-2">
              {userInterests.interests.map((interest: string) => (
                <Button key={interest} variant="outline" onClick={() => createRoom(interest)}>
                  Create {interest} Room
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConvoRooms;
