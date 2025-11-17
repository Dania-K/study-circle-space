import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Users, Target, TrendingUp, Sparkles, Clock, BookOpen, Rocket } from "lucide-react";

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [liveRooms, setLiveRooms] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [dailyQuestion, setDailyQuestion] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadLiveRooms();
      loadRecentPosts();
      loadDailyQuestion();
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
      .limit(4);
    setLiveRooms(data || []);
  };

  const loadRecentPosts = async () => {
    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    setRecentPosts(data || []);
  };

  const loadDailyQuestion = async () => {
    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .eq('is_spotlight', true)
      .single();
    setDailyQuestion(data);
  };

  if (loading || !profile) return <div>Loading...</div>;

  const AVATAR_STAGES = ["🥚", "🐣", "🐥", "🐦", "🦅"];
  const avatarStage = Math.min(Math.floor((profile.total_lifetime_xp || 0) / 100), 4);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Welcome back, {profile.name || profile.username}! 👋</h1>
        <p className="text-lg text-muted-foreground">Here's what's happening today</p>
      </div>

      {/* Top Row: Pet/XP + Stats */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Pet & XP */}
        <Card className="lg:col-span-4 p-6 glass-card">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-primary p-1 animate-glow">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <span className="text-5xl">{AVATAR_STAGES[avatarStage]}</span>
                </div>
              </div>
              <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-accent">
                Level {profile.level}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                {profile.xp} / {profile.level * 100} XP
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {profile.total_lifetime_xp} Total XP
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/tasks">
            <Card className="p-4 glass-card hover-lift cursor-pointer h-full">
              <div className="flex flex-col items-center gap-2 text-center">
                <Target className="w-8 h-8 text-primary" />
                <div className="text-2xl font-bold">{profile.xp}</div>
                <div className="text-xs text-muted-foreground">Current XP</div>
              </div>
            </Card>
          </Link>
          <Link to="/dashboard">
            <Card className="p-4 glass-card hover-lift cursor-pointer h-full">
              <div className="flex flex-col items-center gap-2 text-center">
                <TrendingUp className="w-8 h-8 text-accent" />
                <div className="text-2xl font-bold">{profile.streak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </Card>
          </Link>
          <Link to="/rooms">
            <Card className="p-4 glass-card hover-lift cursor-pointer h-full">
              <div className="flex flex-col items-center gap-2 text-center">
                <Users className="w-8 h-8 text-primary" />
                <div className="text-2xl font-bold">{liveRooms.length}</div>
                <div className="text-xs text-muted-foreground">Live Rooms</div>
              </div>
            </Card>
          </Link>
          <Link to="/community">
            <Card className="p-4 glass-card hover-lift cursor-pointer h-full">
              <div className="flex flex-col items-center gap-2 text-center">
                <Sparkles className="w-8 h-8 text-accent" />
                <div className="text-2xl font-bold">{recentPosts.length}</div>
                <div className="text-xs text-muted-foreground">New Posts</div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Daily AI Question */}
      {dailyQuestion && (
        <Card className="p-6 glass-card border-2 border-accent/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-gradient-accent">Daily Question</Badge>
                <Badge variant="secondary">+10 XP</Badge>
              </div>
              <h3 className="font-semibold text-lg mb-2">{dailyQuestion.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{dailyQuestion.content}</p>
              <Link to="/community">
                <Button size="sm" className="bg-gradient-accent">
                  Answer & Earn XP
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Live Focus Rooms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Live Focus Rooms
          </h2>
          <Link to="/rooms">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {liveRooms.map((room) => (
            <Link key={room.id} to="/rooms">
              <Card className="p-4 glass-card hover-lift cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="text-xs">{room.subject}</Badge>
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {room.duration_minutes}m
                  </Badge>
                </div>
                <h3 className="font-semibold mb-2">{room.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Active</span>
                </div>
              </Card>
            </Link>
          ))}
          {liveRooms.length === 0 && (
            <Card className="p-6 glass-card col-span-full text-center">
              <p className="text-muted-foreground">No active rooms right now. Be the first to start one!</p>
              <Link to="/rooms">
                <Button className="mt-4 bg-gradient-primary">Create Room</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Community Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent" />
            Recent Community Posts
          </h2>
          <Link to="/community">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {recentPosts.map((post) => (
            <Link key={post.id} to="/community">
              <Card className="p-4 glass-card hover-lift cursor-pointer">
                <Badge className="mb-2 text-xs">{post.category}</Badge>
                <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    👤 {post.username}
                  </span>
                  <span>❤️ {post.likes}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 glass-card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/rooms">
            <Button className="w-full h-16 text-base bg-gradient-primary">
              <Rocket className="w-5 h-5 mr-2" />
              Join Focus Room
            </Button>
          </Link>
          <Link to="/tasks">
            <Button variant="outline" className="w-full h-16 text-base">
              <Target className="w-5 h-5 mr-2" />
              Manage Tasks
            </Button>
          </Link>
          <Link to="/community">
            <Button variant="outline" className="w-full h-16 text-base">
              <BookOpen className="w-5 h-5 mr-2" />
              Browse Community
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Home;
