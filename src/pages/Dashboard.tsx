import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy, Flame, Clock, Target, TrendingUp } from "lucide-react";
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
    const { data } = await supabase.from('profiles').select('username, total_lifetime_xp, level').order('total_lifetime_xp', { ascending: false }).limit(10);
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

  const avatarStage = Math.min(Math.floor(profile.total_lifetime_xp / 100), 4);
  const xpToNextLevel = (profile.level * 100) - profile.total_lifetime_xp;
  const earnedBadges = userBadges.filter(b => b.badges);
  const unclaimedBadges = earnedBadges.filter(b => !b.claimed);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Your Dashboard 🎮</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-8xl mb-4">{AVATAR_STAGES[avatarStage]}</div>
            <h2 className="text-2xl font-bold mb-2">{profile.username || profile.name}</h2>
            <Badge className="mb-4">Level {profile.level}</Badge>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>XP: {profile.total_lifetime_xp}</span>
                <span>{xpToNextLevel} to next level</span>
              </div>
              <Progress value={(profile.total_lifetime_xp % 100)} />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" /> Your Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tasks Completed</span>
                <span className="font-bold">{stats.tasksCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Focus Minutes</span>
                <span className="font-bold">{stats.focusMinutes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rooms Joined</span>
                <span className="font-bold">{stats.roomsJoined}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" /> Streak
                </span>
                <span className="font-bold">{profile.streak} days</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Badges
            </h3>
            {unclaimedBadges.length > 0 && (
              <Badge variant="default" className="mb-3">🎉 {unclaimedBadges.length} New!</Badge>
            )}
            <div className="grid grid-cols-3 gap-2">
              {badges.slice(0, 6).map(badge => {
                const earned = earnedBadges.find(b => b.badges?.id === badge.id);
                return (
                  <div key={badge.id} className={`text-center ${!earned && 'opacity-30'}`}>
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="text-xs mt-1">{badge.name}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Leaderboard
            </h3>
            <div className="space-y-2">
              {leaderboard.map((player, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-2 rounded ${player.username === profile.username ? 'bg-primary/10' : ''}`}>
                  <span className="font-bold w-6">#{idx + 1}</span>
                  <span className="flex-1">{player.username || 'User'}</span>
                  <Badge variant="secondary">{player.total_lifetime_xp} XP</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" /> Weekly Summary
            </h3>
            {weeklySummary ? (
              <div className="space-y-3">
                <p className="text-sm">{weeklySummary.summary_text}</p>
                <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t">
                  <div>
                    <div className="font-bold text-primary">{weeklySummary.focus_minutes}</div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                  </div>
                  <div>
                    <div className="font-bold text-primary">{weeklySummary.xp_gained}</div>
                    <div className="text-xs text-muted-foreground">XP Gained</div>
                  </div>
                  <div>
                    <div className="font-bold text-primary">{weeklySummary.tasks_completed}</div>
                    <div className="text-xs text-muted-foreground">Tasks</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No summary yet this week</p>
                <Button onClick={generateWeeklySummary}>Generate Summary</Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
