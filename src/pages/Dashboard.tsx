import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Sparkles, Clock, Users, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AVATAR_STAGES = ["🥚", "🐣", "🐥", "🐦", "🦅"];

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [weeklySummary, setWeeklySummary] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadBadges();
      loadLeaderboard();
      loadStats();
      loadWeeklySummary();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
    setProfile(data);
  };

  const loadBadges = async () => {
    const { data: allBadges } = await supabase.from('badges').select('*');
    const { data: earned } = await supabase.from('user_badges').select('*, badges(*)').eq('user_id', user!.id);
    setBadges(allBadges || []);
    setUserBadges(earned || []);
  };

  const loadLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('name, username, total_lifetime_xp, level')
      .order('total_lifetime_xp', { ascending: false })
      .limit(10);
    setLeaderboard(data || []);
  };

  const loadStats = async () => {
    const { data: sessions } = await supabase.from('sessions').select('*').eq('user_id', user!.id);
    const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', user!.id).eq('completed', true);
    
    const focusMinutes = sessions?.reduce((sum, s) => {
      if (s.end_time) {
        return sum + Math.floor((new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 60000);
      }
      return sum;
    }, 0) || 0;

    setStats({
      tasksCompleted: tasks?.length || 0,
      focusMinutes,
      roomsJoined: sessions?.length || 0,
    });
  };

  const loadWeeklySummary = async () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const { data } = await supabase
      .from('weekly_summaries')
      .select('*')
      .eq('user_id', user!.id)
      .eq('week_start', weekStart.toISOString().split('T')[0])
      .maybeSingle();
    
    setWeeklySummary(data);
  };

  const generateWeeklySummary = async () => {
    const { data } = await supabase.functions.invoke('generate-weekly-summary', { body: { userId: user!.id } });
    if (data) loadWeeklySummary();
  };

  if (loading || !profile) return <div>Loading...</div>;

  const avatarStage = Math.min(Math.floor((profile.total_lifetime_xp || 0) / 100), 4);
  const earnedBadges = userBadges.filter(b => b.badges);
  const unclaimedBadges = earnedBadges.filter(b => !b.claimed);
  const name = profile.name || profile.username || "Student";
  const userRank = leaderboard.findIndex(u => (u.name === profile.name || u.username === profile.username)) + 1;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Welcome back, {name}!
        </h1>
      </div>

      {/* Top Section - Avatar, Stats, Actions */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Avatar & XP Ring */}
        <Card className="lg:col-span-3 p-6 glass-card">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-primary p-1 animate-glow">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <span className="text-4xl">{AVATAR_STAGES[avatarStage]}</span>
                </div>
              </div>
              <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-accent">
                Level {profile?.level || 1}
              </Badge>
            </div>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs">
                <span>XP</span>
                <span className="font-medium">{profile?.xp || 0}/{((profile?.level || 1) * 100)}</span>
              </div>
              <Progress value={((profile?.xp || 0) / ((profile?.level || 1) * 100)) * 100} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Stats Row */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          <Card className="p-4 glass-card hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.tasksCompleted}</div>
                <div className="text-xs text-muted-foreground">Tasks Done</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 glass-card hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-accent/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.floor(stats.focusMinutes / 60)}h</div>
                <div className="text-xs text-muted-foreground">Focus Time</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 glass-card hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-warm/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[hsl(var(--accent))]" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.roomsJoined}</div>
                <div className="text-xs text-muted-foreground">Rooms Joined</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 glass-card hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">#{userRank || "-"}</div>
                <div className="text-xs text-muted-foreground">Leaderboard</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="lg:col-span-3 p-4 glass-card">
          <h3 className="font-semibold mb-3 text-sm">Quick Actions</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="sm"
              onClick={() => navigate("/rooms")}
            >
              <Users className="w-4 h-4 mr-2" />
              Join Room
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="sm"
              onClick={() => navigate("/tasks")}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              View Tasks
            </Button>
          </div>
        </Card>
      </div>

      {/* Progress to Next Level */}
      <Card className="p-6 glass-card">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Progress to Level {(profile?.level || 1) + 1}</h3>
            <span className="text-sm text-muted-foreground">{profile?.xp || 0} / {((profile?.level || 1) * 100)} XP</span>
          </div>
          <Progress value={((profile?.xp || 0) / ((profile?.level || 1) * 100)) * 100} className="h-3" />
        </div>
      </Card>

      {/* Badges Section */}
      {unclaimedBadges.length > 0 && (
        <Card className="p-6 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">New Badges!</h3>
            </div>
            <Badge variant="secondary">{unclaimedBadges.length} unclaimed</Badge>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {unclaimedBadges.slice(0, 4).map((ub) => (
              <Card key={ub.id} className="p-4 text-center hover-lift bg-gradient-accent/5">
                <div className="text-3xl mb-2">{ub.badges.icon}</div>
                <div className="font-semibold text-sm">{ub.badges.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{ub.badges.description}</div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Weekly AI Summary */}
      <Card className="p-8 glass-card hover-lift">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-3 flex-1">
            <h3 className="font-semibold text-lg">This Week's AI Summary</h3>
            {weeklySummary ? (
              <p className="text-sm text-muted-foreground">{weeklySummary.summary_text}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                You've completed {stats.tasksCompleted} tasks and focused for {Math.floor(stats.focusMinutes / 60)} hours. Keep up the great work!
              </p>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={generateWeeklySummary}
              disabled={!!weeklySummary}
            >
              {weeklySummary ? "Summary Generated" : "Generate Summary"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Leaderboard */}
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Global Leaderboard</h3>
        </div>
        <div className="space-y-3">
          {leaderboard.slice(0, 5).map((entry, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-xl ${
                entry.name === profile.name || entry.username === profile.username
                  ? 'bg-gradient-primary/10 border border-primary/20'
                  : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-medium">{entry.name || entry.username}</div>
                  <div className="text-xs text-muted-foreground">Level {entry.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{entry.total_lifetime_xp?.toLocaleString()} XP</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
