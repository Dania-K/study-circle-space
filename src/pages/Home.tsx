import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Users, CheckSquare, MessageCircle, Sparkles, TrendingUp, Calendar, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PETS = [
  { emoji: "🐣", name: "Chick", id: "chick" },
  { emoji: "🐱", name: "Cat", id: "cat" },
  { emoji: "🌱", name: "Sprout", id: "sprout" },
  { emoji: "🤖", name: "Robot", id: "robot" },
  { emoji: "🦊", name: "Fox", id: "fox" },
];

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ rooms: 0, posts: 0, streak: 0 });
  const [dailyQuestion, setDailyQuestion] = useState<any>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
      loadDailyQuestion();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) setProfile(data);
  };

  const loadStats = async () => {
    if (!user) return;
    
    const { data: rooms } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', user.id);

    const { data: posts } = await supabase
      .from('community_posts')
      .select('id')
      .eq('user_id', user.id);

    setStats({
      rooms: rooms?.length || 0,
      posts: posts?.length || 0,
      streak: profile?.streak || 0
    });
  };

  const loadDailyQuestion = async () => {
    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .eq('is_spotlight', true)
      .single();
    
    if (data) {
      setDailyQuestion(data);
      
      // Check if user has answered
      const { data: answers } = await supabase
        .from('community_comments')
        .select('id')
        .eq('post_id', data.id)
        .eq('user_id', user!.id);
      
      setHasAnswered((answers?.length || 0) > 0);
    }
  };

  const answerDailyQuestion = async () => {
    if (!dailyQuestion || hasAnswered) return;
    
    toast({ title: "Opening daily question..." });
    navigate('/community');
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const selectedPet = PETS.find(p => p.id === (localStorage.getItem('selected_pet') || 'chick')) || PETS[0];
  const xpProgress = (profile.xp % 100);
  const currentLevel = Math.floor(profile.xp / 100) + 1;

  return (
    <div className="min-h-screen bg-gradient-hero p-6 space-y-6">
      {/* Hero Profile Section */}
      <Card className="glass-card p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: User Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {profile.name || 'Student'}! 👋
              </h1>
              <p className="text-muted-foreground">Ready to crush your goals today?</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="text-6xl">{selectedPet.emoji}</div>
                <Badge className="absolute -bottom-1 -right-1 bg-gradient-primary">
                  Lv {currentLevel}
                </Badge>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{selectedPet.name}</span>
                  <span className="text-muted-foreground">{profile.xp} XP</span>
                </div>
                <Progress value={xpProgress} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {100 - xpProgress} XP to level {currentLevel + 1}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Card className="flex-1 p-3 bg-primary/10 border-primary/20">
                <div className="text-2xl font-bold text-primary">{stats.streak}</div>
                <div className="text-xs text-muted-foreground">Day Streak 🔥</div>
              </Card>
              <Card className="flex-1 p-3 bg-accent/10 border-accent/20">
                <div className="text-2xl font-bold text-accent">{stats.rooms}</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </Card>
              <Card className="flex-1 p-3 bg-secondary/50 border-secondary">
                <div className="text-2xl font-bold">{stats.posts}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </Card>
            </div>
          </div>

          {/* Right: Daily Question */}
          <Card className="p-6 bg-gradient-accent hover-lift border-2 border-accent/30">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-accent-foreground" />
              <div>
                <h3 className="font-bold text-accent-foreground">Question of the Day</h3>
                <p className="text-sm text-accent-foreground/80">Answer to earn +10 XP!</p>
              </div>
            </div>
            {dailyQuestion ? (
              <>
                <p className="text-accent-foreground mb-4 font-medium">{dailyQuestion.title}</p>
                <Button
                  onClick={answerDailyQuestion}
                  disabled={hasAnswered}
                  className="w-full bg-white text-accent hover:bg-white/90"
                >
                  {hasAnswered ? "Already Answered ✓" : "Answer Now +10 XP"}
                </Button>
              </>
            ) : (
              <p className="text-accent-foreground/60 text-sm">Check back tomorrow!</p>
            )}
          </Card>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6" />
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card 
            className="p-6 hover-lift cursor-pointer group bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
            onClick={() => navigate('/rooms')}
          >
            <Users className="w-10 h-10 mb-3 text-primary group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-1">Join Focus Room</h3>
            <p className="text-sm text-muted-foreground">Study with others in real-time</p>
          </Card>

          <Card 
            className="p-6 hover-lift cursor-pointer group bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20"
            onClick={() => navigate('/tasks')}
          >
            <CheckSquare className="w-10 h-10 mb-3 text-accent group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-1">Manage Tasks</h3>
            <p className="text-sm text-muted-foreground">Organize your assignments</p>
          </Card>

          <Card 
            className="p-6 hover-lift cursor-pointer group bg-gradient-to-br from-secondary/30 to-secondary/50 border-secondary"
            onClick={() => navigate('/community')}
          >
            <MessageCircle className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-1">Community</h3>
            <p className="text-sm text-muted-foreground">Share tips and get support</p>
          </Card>
        </div>
      </div>

      {/* Daily Stats Overview */}
      <Card className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Today's Progress
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{profile.xp}</div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <Users className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">{stats.rooms}</div>
            <div className="text-xs text-muted-foreground">Focus Sessions</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">Lv {currentLevel}</div>
            <div className="text-xs text-muted-foreground">Current Level</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">{stats.posts}</div>
            <div className="text-xs text-muted-foreground">Community Posts</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Home;
