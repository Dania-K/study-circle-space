import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Users, Target, TrendingUp, Sparkles, Clock, BookOpen } from "lucide-react";

const Home = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [liveRooms, setLiveRooms] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    if (user) {
      loadProfile();
      loadLiveRooms();
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
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

  const loadStats = async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user!.id)
      .eq('completed', true);
    
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user!.id);

    setStats({
      tasksCompleted: tasks?.length || 0,
      sessionsJoined: sessions?.length || 0,
    });
  };

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Welcome to StudiCircle
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your study habits with AI-powered focus rooms, gamified learning, and a supportive community
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary text-lg px-8 py-6 hover:shadow-hover transition-all hover:scale-105">
                Get Started <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 shadow-card hover:shadow-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Focus Rooms</h3>
              <p className="text-muted-foreground">Join synchronized Pomodoro sessions with AI-powered task breakdowns</p>
            </Card>
            
            <Card className="p-6 shadow-card hover:shadow-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Tasks</h3>
              <p className="text-muted-foreground">Let AI create personalized study plans tailored to your deadlines</p>
            </Card>
            
            <Card className="p-6 shadow-card hover:shadow-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Level Up</h3>
              <p className="text-muted-foreground">Earn XP, unlock badges, and watch your study avatar evolve</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const AVATAR_STAGES = ["🥚", "🐣", "🐥", "🐦", "🦅"];
  const avatarStage = Math.min(Math.floor((profile?.total_lifetime_xp || 0) / 100), 4);
  const name = profile?.name || profile?.username || "Student";

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8 shadow-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-6xl">{AVATAR_STAGES[avatarStage]}</div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, {name}! 👋</h1>
            <p className="text-muted-foreground">Ready to level up your learning?</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-medium">Level</span>
            </div>
            <p className="text-2xl font-bold">{profile?.level || 1}</p>
          </Card>
          
          <Card className="p-4 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-2 text-secondary mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium">XP</span>
            </div>
            <p className="text-2xl font-bold">{profile?.total_lifetime_xp || 0}</p>
          </Card>
          
          <Card className="p-4 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-2 text-accent mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-medium">Tasks Done</span>
            </div>
            <p className="text-2xl font-bold">{stats.tasksCompleted}</p>
          </Card>
          
          <Card className="p-4 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Sessions</span>
            </div>
            <p className="text-2xl font-bold">{stats.sessionsJoined}</p>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Live Focus Rooms
          </h2>
          {liveRooms.length > 0 ? (
            <div className="space-y-3">
              {liveRooms.map(room => (
                <Link key={room.id} to="/rooms">
                  <Card className="p-4 hover:bg-muted/50 transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{room.title}</h3>
                      <Badge variant="default" className="bg-green-500">Live</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {room.duration_minutes}m
                      </span>
                      <Badge variant="secondary">{room.subject}</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No active rooms right now</p>
          )}
          <Link to="/rooms">
            <Button className="w-full mt-4 bg-gradient-primary">Browse All Rooms</Button>
          </Link>
        </Card>

        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link to="/rooms">
              <Button variant="outline" className="w-full justify-start text-left">
                <Users className="w-4 h-4 mr-2" />
                Join a Focus Room
              </Button>
            </Link>
            <Link to="/tasks">
              <Button variant="outline" className="w-full justify-start text-left">
                <Target className="w-4 h-4 mr-2" />
                Create Study Plan
              </Button>
            </Link>
            <Link to="/homework">
              <Button variant="outline" className="w-full justify-start text-left">
                <Sparkles className="w-4 h-4 mr-2" />
                Ask AI for Help
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full justify-start text-left">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
