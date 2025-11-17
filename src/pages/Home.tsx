import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { Trophy, Sparkles, Clock, Users, CheckCircle, Palette, Trash2, Send } from "lucide-react";

const PET_TYPES = {
  chick: ["🥚", "🐣", "🐥", "🐦", "🦅"],
  cat: ["🐱", "😺", "😸", "😻", "🦁"],
  sprout: ["🌱", "🌿", "🪴", "🌳", "🌲"],
  robot: ["🤖", "🦾", "🦿", "🛸", "👾"],
  fox: ["🦊", "🦝", "🐺", "🐕", "🐩"],
  owl: ["🦉", "🦅", "🦜", "🦚", "🦤"],
  turtle: ["🐢", "🐊", "🦎", "🐍", "🐉"],
  butterfly: ["🐛", "🦋", "🐝", "🦗", "🪲"],
};

const THEMES = [
  { name: "Light", value: "light", desc: "Cozy journal" },
  { name: "Warm", value: "warm", desc: "Warm tones" },
  { name: "Forest", value: "forest", desc: "Nature vibes" },
  { name: "Midnight", value: "midnight", desc: "Dark mode" },
];

const PETS = [
  { emoji: "🐣", name: "Chick", id: "chick" },
  { emoji: "🐱", name: "Cat", id: "cat" },
  { emoji: "🌱", name: "Sprout", id: "sprout" },
  { emoji: "🤖", name: "Robot", id: "robot" },
  { emoji: "🦊", name: "Fox", id: "fox" },
  { emoji: "🦉", name: "Owl", id: "owl" },
  { emoji: "🐢", name: "Turtle", id: "turtle" },
  { emoji: "🦋", name: "Butterfly", id: "butterfly" },
];

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, changeTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [pet, setPet] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [dailyQuestion, setDailyQuestion] = useState<string>("");
  const [dailyAnswer, setDailyAnswer] = useState("");
  const [userClasses, setUserClasses] = useState<any[]>([]);
  const [newClass, setNewClass] = useState({ name: "", subject: "", teacher: "" });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadPet();
      loadLeaderboard();
      loadStats();
      loadWeeklySummary();
      loadDailyQuestion();
      loadUserClasses();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
    setProfile(data);
  };

  const loadPet = async () => {
    const { data } = await supabase.from('pets').select('*').eq('owner_id', user!.id).single();
    setPet(data);
  };

  const loadLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('name, username, total_lifetime_xp, level')
      .order('total_lifetime_xp', { ascending: false })
      .limit(5);
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
    if (data) {
      toast({ title: "Weekly summary generated! 📊" });
      loadWeeklySummary();
    }
  };

  const loadDailyQuestion = async () => {
    const questions = [
      "What study technique helped you most today?",
      "What's one thing you learned that surprised you?",
      "How can you improve your focus tomorrow?",
      "What was the most challenging concept today?",
    ];
    const dayIndex = new Date().getDate() % questions.length;
    setDailyQuestion(questions[dayIndex]);
  };

  const answerDailyQuestion = async () => {
    if (!dailyAnswer.trim()) return;
    
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('xp, total_lifetime_xp, level')
      .eq('id', user!.id)
      .single();

    if (currentProfile) {
      const newXP = currentProfile.xp + 10;
      const newTotalXP = (currentProfile.total_lifetime_xp || 0) + 10;
      const newLevel = Math.floor(newTotalXP / 100) + 1;

      await supabase
        .from('profiles')
        .update({ xp: newXP, total_lifetime_xp: newTotalXP, level: newLevel })
        .eq('id', user!.id);

      if (pet) {
        const petNewXP = pet.xp + 10;
        const petNewLevel = Math.floor(petNewXP / 20) + 1;
        await supabase
          .from('pets')
          .update({ xp: petNewXP, level: petNewLevel })
          .eq('owner_id', user!.id);
      }

      toast({ title: "Great answer! +10 XP 🌟" });
      setDailyAnswer("");
      loadProfile();
      loadPet();
    }
  };

  const loadUserClasses = async () => {
    const { data } = await supabase
      .from('user_classes')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setUserClasses(data || []);
  };

  const addClass = async () => {
    if (!newClass.name || !newClass.subject) return;
    
    await supabase.from('user_classes').insert({
      user_id: user!.id,
      class_name: newClass.name,
      subject: newClass.subject,
      teacher_name: newClass.teacher || null,
    });

    setNewClass({ name: "", subject: "", teacher: "" });
    loadUserClasses();
    toast({ title: "Class added! 📚" });
  };

  const deleteClass = async (classId: string) => {
    await supabase.from('user_classes').delete().eq('id', classId);
    loadUserClasses();
    toast({ title: "Class removed" });
  };

  const updatePetType = async (petType: string) => {
    if (!pet) return;
    
    await supabase
      .from('pets')
      .update({ pet_type: petType })
      .eq('owner_id', user!.id);

    setPet({ ...pet, pet_type: petType });
    toast({ title: "Pet updated! 🎉" });
  };

  if (loading || !profile || !pet) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const petType = pet.pet_type || "chick";
  const petStage = Math.min(Math.floor(pet.xp / 20), 4);
  const petEmoji = PET_TYPES[petType as keyof typeof PET_TYPES]?.[petStage] || "🐣";
  const name = profile.name || profile.username || "Student";
  const xpForNextLevel = (profile.level * 100);
  const xpProgress = ((profile.xp) / xpForNextLevel) * 100;
  const userRank = leaderboard.findIndex(u => (u.name === profile.name || u.username === profile.username)) + 1;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold">Welcome back, {name}! 👋</h1>
        <p className="text-muted-foreground">Level {profile.level} • {profile.total_lifetime_xp || 0} Total XP</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card p-6 space-y-6 lg:col-span-1">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="text-8xl animate-float">{petEmoji}</div>
              <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                Level {pet.level}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>XP Progress</span>
                <span>{profile.xp}/{xpForNextLevel}</span>
              </div>
              <Progress value={xpProgress} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold">{profile.streak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold">{userRank > 0 ? `#${userRank}` : "-"}</div>
                <div className="text-xs text-muted-foreground">Rank</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme
            </label>
            <Select value={theme} onValueChange={changeTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.name} - {t.desc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Study Pet
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => updatePetType(p.id)}
                  className={`p-3 rounded-lg text-2xl hover:scale-110 transition-transform ${
                    petType === p.id ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary/30"
                  }`}
                  title={p.name}
                >
                  {p.emoji}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6 space-y-6 lg:col-span-1">
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Question of the Day
            </h3>
            <p className="text-sm text-muted-foreground italic">"{dailyQuestion}"</p>
            <div className="flex gap-2">
              <Input
                value={dailyAnswer}
                onChange={(e) => setDailyAnswer(e.target.value)}
                placeholder="Your answer..."
                onKeyPress={(e) => e.key === 'Enter' && answerDailyQuestion()}
              />
              <Button size="icon" onClick={answerDailyQuestion}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <CheckCircle className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-xl font-bold">{stats.tasksCompleted}</div>
              <div className="text-xs text-muted-foreground">Tasks Done</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <Clock className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-xl font-bold">{stats.focusMinutes}</div>
              <div className="text-xs text-muted-foreground">Focus Mins</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <Users className="w-6 h-6 mx-auto mb-1 text-primary" />
              <div className="text-xl font-bold">{stats.roomsJoined}</div>
              <div className="text-xs text-muted-foreground">Rooms</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => navigate('/rooms')} className="w-full">
                Focus Rooms
              </Button>
              <Button onClick={() => navigate('/tasks')} variant="secondary" className="w-full">
                My Tasks
              </Button>
              <Button onClick={() => navigate('/community')} variant="outline" className="w-full col-span-2">
                Community
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">My Classes</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {userClasses.slice(0, 3).map(cls => (
                <div key={cls.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{cls.class_name}</div>
                    <div className="text-xs text-muted-foreground">{cls.subject}</div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteClass(cls.id)}
                    className="h-6 w-6"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Class name..."
                value={newClass.name}
                onChange={e => setNewClass({ ...newClass, name: e.target.value })}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Subject..."
                  value={newClass.subject}
                  onChange={e => setNewClass({ ...newClass, subject: e.target.value })}
                />
                <Button onClick={addClass} size="sm">Add</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6 space-y-6 lg:col-span-1">
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Top 5 Leaderboard
            </h3>
            <div className="space-y-2">
              {leaderboard.map((user, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{user.name || user.username}</div>
                    <div className="text-xs text-muted-foreground">{user.total_lifetime_xp} XP</div>
                  </div>
                  <Badge variant="secondary">L{user.level}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">AI Weekly Summary</h3>
            {weeklySummary ? (
              <div className="p-4 rounded-lg bg-secondary/30 text-sm">
                <p className="text-muted-foreground">{weeklySummary.summary_text}</p>
                <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="font-bold">{weeklySummary.tasks_completed}</div>
                    <div className="text-xs text-muted-foreground">Tasks</div>
                  </div>
                  <div>
                    <div className="font-bold">{weeklySummary.focus_minutes}</div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                  </div>
                  <div>
                    <div className="font-bold">{weeklySummary.xp_gained}</div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">No summary yet for this week</p>
                <Button onClick={generateWeeklySummary} size="sm">
                  Generate Summary
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
