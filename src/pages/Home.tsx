import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Users, Target, TrendingUp, Sparkles, Clock, BookOpen, Rocket } from "lucide-react";

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
      <div className="min-h-screen overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-hero" />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border mb-6 shadow-soft">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">The Future of Student Productivity</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
              StudiCircle
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto font-light leading-relaxed">
              Transform your study habits with AI-powered focus rooms, 
              <span className="text-primary font-semibold"> gamified learning</span>, 
              and a supportive community
            </p>
            <Link to="/auth">
              <Button 
                size="lg" 
                className="text-base px-10 py-6 rounded-full shadow-elegant hover:shadow-hover hover:scale-105 transition-all duration-300"
              >
                Get Started Free
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {[
              { icon: Users, title: "Smart Focus Rooms", desc: "Join synchronized Pomodoro sessions with AI-powered task breakdowns", color: "text-primary" },
              { icon: Target, title: "AI Study Plans", desc: "Let AI create personalized study plans tailored to your deadlines", color: "text-accent" },
              { icon: TrendingUp, title: "Level Up & Earn", desc: "Gain XP, unlock badges, and watch your study avatar evolve", color: "text-primary" }
            ].map((feature, idx) => (
              <Card 
                key={idx}
                className="p-8 hover-lift shadow-card border-border/50 bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-10 duration-700"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <feature.icon className={`w-10 h-10 mb-4 ${feature.color}`} />
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const AVATAR_STAGES = ["🥚", "🐣", "🐥", "🐦", "🦅"];
  const avatarStage = Math.min(Math.floor((profile?.total_lifetime_xp || 0) / 100), 4);
  const name = profile?.name || profile?.username || "Student";

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[2.5rem] glass-card p-10 shadow-xl animate-in fade-in slide-in-from-top-5 duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
        <div className="relative flex items-center gap-6 mb-8">
          <div className="text-8xl animate-float">{AVATAR_STAGES[avatarStage]}</div>
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text">
              Welcome back, {name}! 👋
            </h1>
            <p className="text-xl text-muted-foreground">Ready to level up your learning?</p>
          </div>
        </div>
        
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Zap, label: "Level", value: profile?.level || 1, gradient: "from-purple-500 to-pink-500" },
            { icon: Target, label: "Total XP", value: profile?.total_lifetime_xp || 0, gradient: "from-pink-500 to-orange-500" },
            { icon: BookOpen, label: "Tasks Done", value: stats.tasksCompleted, gradient: "from-cyan-500 to-blue-500" },
            { icon: Users, label: "Sessions", value: stats.sessionsJoined, gradient: "from-green-500 to-teal-500" }
          ].map((stat, idx) => (
            <Card key={idx} className="glass-card p-6 hover-lift group">
              <div className={`flex items-center gap-3 mb-3`}>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="glass-card p-8 shadow-xl hover-lift">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              Live Focus Rooms
            </h2>
            <Badge className="bg-green-500/20 text-green-600 border-green-500/50 animate-pulse">
              {liveRooms.length} Active
            </Badge>
          </div>
          {liveRooms.length > 0 ? (
            <div className="space-y-4 mb-6">
              {liveRooms.map((room) => (
                <Link key={room.id} to="/rooms">
                  <Card className="glass-card p-5 hover-lift group">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg group-hover:gradient-text transition-all">{room.title}</h3>
                      <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {room.duration_minutes}m
                      </span>
                      <Badge variant="secondary" className="rounded-full">{room.subject}</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No active rooms right now</p>
          )}
          <Link to="/rooms">
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              Browse All Rooms
            </Button>
          </Link>
        </Card>

        <Card className="glass-card p-8 shadow-xl hover-lift">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center animate-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            {[
              { to: "/rooms", icon: Users, label: "Join a Focus Room", gradient: "from-purple-500 to-pink-500" },
              { to: "/tasks", icon: Target, label: "Create Study Plan", gradient: "from-pink-500 to-orange-500" },
              { to: "/social", icon: Sparkles, label: "Join Convo Rooms", gradient: "from-cyan-500 to-blue-500" },
              { to: "/dashboard", icon: TrendingUp, label: "View Dashboard", gradient: "from-green-500 to-teal-500" }
            ].map((action, idx) => (
              <Link key={idx} to={action.to}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left glass-card border-2 hover:border-primary/50 hover:shadow-lg transition-all group rounded-2xl p-6"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
