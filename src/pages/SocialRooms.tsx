import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Clock } from "lucide-react";

const INTEREST_OPTIONS = ["Math", "Science", "Literature", "History", "Art", "Music", "Sports", "Gaming", "Coding", "Languages"];

const SocialRooms = () => {
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

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadUserInterests();
      loadRooms();
    }
  }, [user]);

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
      toast({ title: "Profile saved!" });
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
      name: `${category} Study Group`,
      category,
      host_id: user!.id,
      description: `Connect with others interested in ${category}`,
    });

    if (!error) {
      toast({ title: "Room created!" });
      loadRooms();
    }
  };

  if (loading) return <div>Loading...</div>;

  if (showQuiz) {
    return (
      <div className="min-h-screen p-6">
        <Card className="max-w-2xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-6">Tell us about yourself! 🎯</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-3">What are you interested in?</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(interest => (
                  <Badge
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer"
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

            <Button className="w-full" onClick={submitQuiz} disabled={selectedInterests.length === 0}>
              Find My Study Groups
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Social Rooms 💬</h1>
          <Button variant="outline" onClick={() => setShowQuiz(true)}>Edit Profile</Button>
        </div>

        {userInterests && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">Your Interests</h2>
            <div className="flex flex-wrap gap-2">
              {userInterests.interests?.map((interest: string) => (
                <Badge key={interest}>{interest}</Badge>
              ))}
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <Card key={room.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{room.name}</h3>
                <Badge variant="secondary">{room.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{room.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Active</span>
                </div>
                {room.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{room.duration_minutes} min</span>
                  </div>
                )}
              </div>
              <Button className="w-full">Join Room</Button>
            </Card>
          ))}
        </div>

        {userInterests?.interests?.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create a Room</h2>
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

export default SocialRooms;
