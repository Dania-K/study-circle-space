import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Brain, Trophy, Sparkles, Clock, Zap, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [liveRooms, setLiveRooms] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadLiveRooms();
    }
  }, [user]);

  const loadUserData = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();
    setProfile(data);
  };

  const loadLiveRooms = async () => {
    const { data } = await supabase
      .from('focus_rooms')
      .select('*')
      .eq('in_session', true)
      .limit(3);
    setLiveRooms(data || []);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  // Logged in user view
  if (user && profile) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-4xl font-bold">Hey {profile.name || 'Student'}! 👋</h1>
          </div>

          {/* Live Rooms Preview */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6" /> Live Focus Rooms – Open Now
            </h2>
            {liveRooms.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {liveRooms.map(room => (
                  <Card key={room.id} className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/rooms')}>
                    <h3 className="font-semibold">{room.title}</h3>
                    <p className="text-sm text-muted-foreground">{room.subject}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{room.duration_minutes || 25} min</span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground mb-4">No active rooms right now. Be the first to start one!</p>
            )}
            <Button onClick={() => navigate('/rooms')} className="w-full">Browse All Rooms</Button>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/rooms')}>
              <Users className="w-10 h-10 mb-3 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Start Focus Room</h3>
              <p className="text-sm text-muted-foreground">Join or create a study session</p>
            </Card>
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/tasks')}>
              <BookOpen className="w-10 h-10 mb-3 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Your Tasks</h3>
              <p className="text-sm text-muted-foreground">Manage your study plans</p>
            </Card>
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/social')}>
              <Trophy className="w-10 h-10 mb-3 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Social Rooms</h3>
              <p className="text-sm text-muted-foreground">Connect with study groups</p>
            </Card>
          </div>

          {/* Stats Preview */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Your Progress 🎯</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">{profile.xp}</div>
                <div className="text-sm text-muted-foreground">XP</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{profile.level}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{profile.streak}</div>
                <div className="text-sm text-muted-foreground">Day Streak 🔥</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Landing page for non-logged in users
  return (
    <div className="space-y-12 animate-slide-up">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          Student Productivity Reimagined
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground">
          Welcome to{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            StudiCircle
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Focus better, achieve more, and level up your study game with AI-powered
          productivity tools designed for students.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:shadow-hover transition-all"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 hover:shadow-hover transition-all border-2 hover:border-primary/20">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Focus Rooms</h3>
          <p className="text-muted-foreground">
            Join virtual study spaces with shared Pomodoro timers and connect with
            students working on similar subjects.
          </p>
        </Card>

        <Card className="p-6 space-y-4 hover:shadow-hover transition-all border-2 hover:border-secondary/20">
          <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-secondary-foreground" />
          </div>
          <h3 className="text-xl font-semibold">AI Study Plans</h3>
          <p className="text-muted-foreground">
            Get personalized study schedules and smart task breakdowns powered by
            AI to help you stay organized.
          </p>
        </Card>

        <Card className="p-6 space-y-4 hover:shadow-hover transition-all border-2 hover:border-accent/20">
          <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-accent-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Gamification</h3>
          <p className="text-muted-foreground">
            Earn XP, maintain streaks, collect badges, and raise your virtual pet
            as you complete tasks and focus sessions.
          </p>
        </Card>
      </div>

      {/* Stats Preview */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-0">
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">1,234</div>
            <div className="text-muted-foreground">Active Students</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-secondary mb-2">5,678</div>
            <div className="text-muted-foreground">Study Sessions</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">9,012</div>
            <div className="text-muted-foreground">Tasks Completed</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Home;
