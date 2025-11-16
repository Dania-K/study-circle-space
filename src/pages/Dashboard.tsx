import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy, Flame, Target, TrendingUp, Sparkles, Clock, Users } from "lucide-react";
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
  const xpToNextLevel = (profile.level * 100) - (profile.total_lifetime_xp || 0);
  const earnedBadges = userBadges.filter(b => b.badges);
  const unclaimedBadges = earnedBadges.filter(b => !b.claimed);
  const name = profile.name || profile.username || "Student";

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Welcome back, {name}!
        </h1>
        <p className="text-muted-foreground">Here's your learning journey</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-8 shadow-card border-border/50">
          <div className="text-center">
            <div className="text-7xl mb-4">{AVATAR_STAGES[avatarStage]}</div>
            <h2 className="text-2xl font-bold mb-1 text-foreground">Level {profile.level}</h2>
            <p className="text-sm text-muted-foreground mb-4">{profile.total_lifetime_xp} Total XP</p>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeDasharray={`${(profile.xp / (profile.level * 100)) * 100}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{profile.xp}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{xpToNextLevel} XP to next level</p>
          </div>
        </Card>

        <Card className="p-8 shadow-card border-border/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-accent" />
            Weekly Summary
          </h3>
          {weeklySummary ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">{weeklySummary.summary_text}</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>+{weeklySummary.xp_gained} XP</span>
                <span>{weeklySummary.focus_minutes} min</span>
                <span>{weeklySummary.tasks_completed} tasks</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">No summary yet this week</p>
              <Button onClick={generateWeeklySummary} variant="outline" size="sm">
                Generate Summary
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Target, label: "Tasks Done", value: stats.tasksCompleted, color: "text-primary" },
          { icon: Clock, label: "Focus Minutes", value: stats.focusMinutes, color: "text-accent" },
          { icon: Users, label: "Rooms Joined", value: stats.roomsJoined, color: "text-primary" },
          { icon: Flame, label: "Day Streak", value: profile.streak, color: "text-accent" },
        ].map((stat, idx) => (
          <Card key={idx} className="p-6 shadow-card border-border/50 hover-lift">
            <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 shadow-card mb-8 border-border/50">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
          <Trophy className="w-5 h-5 text-accent" /> Badges
        </h3>
        {unclaimedBadges.length > 0 && (
          <Badge variant="default" className="mb-3">
            🎉 {unclaimedBadges.length} New!
          </Badge>
        )}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {badges.slice(0, 6).map(badge => {
            const earned = earnedBadges.find(b => b.badges?.id === badge.id);
            return (
              <div
                key={badge.id}
                className={`text-center p-3 rounded-xl transition-all ${
                  earned ? 'bg-primary/10 scale-105 border-2 border-primary/20' : 'opacity-30'
                }`}
              >
                <div className="text-4xl mb-1">{badge.icon}</div>
                <div className="text-xs font-medium">{badge.name}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-card">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Leaderboard
          </h3>
          <div className="space-y-2">
            {leaderboard.map((player, idx) => {
              const playerName = player.name || player.username || 'Student';
              const currentUserName = profile.name || profile.username;
              const isCurrentUser = playerName === currentUserName;
              
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isCurrentUser ? 'bg-primary/10 border-2 border-primary' : 'hover:bg-muted/50'
                  }`}
                >
                  <span className={`font-bold w-8 ${idx < 3 ? 'text-primary text-lg' : ''}`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <span className="flex-1 font-medium">{playerName}</span>
                  <Badge variant="secondary" className="font-bold">{player.total_lifetime_xp} XP</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-secondary" /> Weekly Summary
          </h3>
          {weeklySummary ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed">{weeklySummary.summary_text}</p>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                <div className="text-center p-3 rounded-xl bg-primary/10">
                  <div className="font-bold text-2xl text-primary">{weeklySummary.focus_minutes}</div>
                  <div className="text-xs text-muted-foreground mt-1">Minutes</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-secondary/10">
                  <div className="font-bold text-2xl text-secondary">{weeklySummary.xp_gained}</div>
                  <div className="text-xs text-muted-foreground mt-1">XP Gained</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-accent/10">
                  <div className="font-bold text-2xl text-accent">{weeklySummary.tasks_completed}</div>
                  <div className="text-xs text-muted-foreground mt-1">Tasks</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No summary yet this week</p>
              <Button onClick={generateWeeklySummary} className="bg-gradient-primary">
                Generate Summary
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
