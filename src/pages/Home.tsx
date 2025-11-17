import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Sparkles, Clock, Users, CheckCircle, BookOpen, Plus, Trash2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";

const PET_TYPES = {
  chick: ["🥚", "🐣", "🐥", "🐤", "🐔"],
  cat: ["🥚", "😺", "😸", "😻", "😼"],
  sprout: ["🌱", "🌿", "🍃", "🌳", "🌲"],
  robot: ["🔩", "🤖", "🦾", "🦿", "🚀"],
  slime: ["💧", "💦", "💧", "🌊", "🌀"],
  fox: ["🥚", "🦊", "🦊", "🦊", "🦊"],
  owl: ["🥚", "🦉", "🦉", "🦉", "🦉"],
  turtle: ["🥚", "🐢", "🐢", "🐢", "🐢"]
};

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, changeTheme } = useTheme();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [pet, setPet] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [dailyQuestion, setDailyQuestion] = useState<any>(null);
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [userClasses, setUserClasses] = useState<any[]>([]);
  const [newClass, setNewClass] = useState({ name: "", teacher: "", subject: "" });
  const [isAddingClass, setIsAddingClass] = useState(false);

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
    setPet(data || {});
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
    if (data) loadWeeklySummary();
  };

  const loadDailyQuestion = async () => {
    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .eq('is_spotlight', true)
      .maybeSingle();
    setDailyQuestion(data);
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
      teacher_name: newClass.teacher,
      subject: newClass.subject
    });
    setNewClass({ name: "", teacher: "", subject: "" });
    setIsAddingClass(false);
    loadUserClasses();
    toast({ title: "Class added!" });
  };

  const deleteClass = async (id: string) => {
    await supabase.from('user_classes').delete().eq('id', id);
    loadUserClasses();
    toast({ title: "Class removed" });
  };

  const answerDailyQuestion = async () => {
    if (!questionAnswer.trim() || !dailyQuestion) return;
    
    await supabase.from('community_comments').insert({
      post_id: dailyQuestion.id,
      user_id: user!.id,
      username: profile?.name || profile?.username || 'Anonymous',
      content: questionAnswer
    });

    // Award XP
    const newXP = (profile?.xp || 0) + 10;
    const newTotalXP = (profile?.total_lifetime_xp || 0) + 10;
    const newLevel = Math.floor(newTotalXP / 100) + 1;

    await supabase.from('profiles').update({
      xp: newXP,
      total_lifetime_xp: newTotalXP,
      level: newLevel
    }).eq('id', user!.id);

    setQuestionAnswer("");
    toast({ title: "+10 XP for answering! 🎉" });
    loadProfile();
  };

  const updatePetType = async (type: string) => {
    if (!pet?.id) return;
    await supabase.from('pets').update({ pet_type: type }).eq('id', pet.id);
    loadPet();
    toast({ title: "Pet changed!" });
  };

  if (loading || !profile) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const petType = (pet?.pet_type || 'chick') as keyof typeof PET_TYPES;
  const petStage = Math.min(Math.floor((profile.total_lifetime_xp || 0) / 25), 4);
  const petEmoji = PET_TYPES[petType][petStage];
  const name = profile.name || profile.username || "Student";
  const userRank = leaderboard.findIndex(u => (u.name === profile.name || u.username === profile.username)) + 1;
  const xpProgress = ((profile.xp % 100) / 100) * 100;

  return (
    <div className="container mx-auto p-8 space-y-10">
      {/* Header with Profile & Pet */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <Card className="p-8 space-y-6 hover-lift">
          <div className="flex items-center gap-6">
            <div className="text-8xl">{petEmoji}</div>
            <div className="flex-1 space-y-3">
              <h1 className="text-4xl font-bold">Welcome, {name}!</h1>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-lg px-4 py-1">Level {profile.level}</Badge>
                <Badge variant="outline" className="text-lg px-4 py-1">🔥 {profile.streak} day streak</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>XP Progress</span>
                  <span>{profile.xp % 100}/100</span>
                </div>
                <Progress value={xpProgress} className="h-3" />
              </div>
            </div>
          </div>

          {/* Theme & Pet Selectors */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <Select value={theme} onValueChange={changeTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="ocean">Ocean</SelectItem>
                  <SelectItem value="forest">Forest</SelectItem>
                  <SelectItem value="sunset">Sunset</SelectItem>
                  <SelectItem value="lavender">Lavender</SelectItem>
                  <SelectItem value="midnight">Midnight</SelectItem>
                  <SelectItem value="charcoal">Charcoal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Pet</label>
              <Select value={petType} onValueChange={updatePetType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chick">🐣 Chick</SelectItem>
                  <SelectItem value="cat">🐱 Cat</SelectItem>
                  <SelectItem value="sprout">🌱 Sprout</SelectItem>
                  <SelectItem value="robot">🤖 Robot</SelectItem>
                  <SelectItem value="slime">💧 Slime</SelectItem>
                  <SelectItem value="fox">🦊 Fox</SelectItem>
                  <SelectItem value="owl">🦉 Owl</SelectItem>
                  <SelectItem value="turtle">🐢 Turtle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Daily Question Card */}
        <Card className="p-8 space-y-4 hover-lift">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold">Question of the Day</h2>
          </div>
          {dailyQuestion ? (
            <>
              <p className="text-lg font-medium">{dailyQuestion.title}</p>
              <p className="text-muted-foreground">{dailyQuestion.content}</p>
              <div className="flex gap-2 pt-2">
                <Input 
                  placeholder="Your answer..." 
                  value={questionAnswer}
                  onChange={(e) => setQuestionAnswer(e.target.value)}
                />
                <Button onClick={answerDailyQuestion} className="bg-gradient-primary">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">+10 XP for answering</p>
            </>
          ) : (
            <p className="text-muted-foreground">Check back tomorrow for a new question!</p>
          )}
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 hover-lift">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-10 h-10 text-primary" />
            <div>
              <p className="text-3xl font-bold">{stats.tasksCompleted}</p>
              <p className="text-sm text-muted-foreground">Tasks Done</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 hover-lift">
          <div className="flex items-center gap-4">
            <Clock className="w-10 h-10 text-accent" />
            <div>
              <p className="text-3xl font-bold">{stats.focusMinutes}</p>
              <p className="text-sm text-muted-foreground">Focus Minutes</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 hover-lift">
          <div className="flex items-center gap-4">
            <Users className="w-10 h-10 text-primary" />
            <div>
              <p className="text-3xl font-bold">{stats.roomsJoined}</p>
              <p className="text-sm text-muted-foreground">Rooms Joined</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 hover-lift">
          <div className="flex items-center gap-4">
            <Trophy className="w-10 h-10 text-accent" />
            <div>
              <p className="text-3xl font-bold">#{userRank || '-'}</p>
              <p className="text-sm text-muted-foreground">Global Rank</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Button 
          onClick={() => navigate('/rooms')} 
          className="h-20 text-lg bg-gradient-primary hover:scale-105 transition-transform"
        >
          <Users className="w-6 h-6 mr-2" /> Focus Rooms
        </Button>
        <Button 
          onClick={() => navigate('/tasks')} 
          className="h-20 text-lg bg-gradient-accent hover:scale-105 transition-transform"
        >
          <CheckCircle className="w-6 h-6 mr-2" /> Tasks
        </Button>
        <Button 
          onClick={() => navigate('/community')} 
          className="h-20 text-lg bg-gradient-warm hover:scale-105 transition-transform"
        >
          <Sparkles className="w-6 h-6 mr-2" /> Community
        </Button>
      </div>

      {/* My Classes & Leaderboard */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* My Classes */}
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6" /> My Classes
            </h2>
            <Dialog open={isAddingClass} onOpenChange={setIsAddingClass}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a Class</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input 
                    placeholder="Class name (e.g., AP Biology)" 
                    value={newClass.name}
                    onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                  />
                  <Input 
                    placeholder="Teacher (optional)" 
                    value={newClass.teacher}
                    onChange={(e) => setNewClass({...newClass, teacher: e.target.value})}
                  />
                  <Input 
                    placeholder="Subject (e.g., Science)" 
                    value={newClass.subject}
                    onChange={(e) => setNewClass({...newClass, subject: e.target.value})}
                  />
                  <Button onClick={addClass} className="w-full">Add Class</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {userClasses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No classes yet. Add one to get started!</p>
            ) : (
              userClasses.map((cls) => (
                <Card key={cls.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{cls.class_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cls.teacher_name && `${cls.teacher_name} • `}{cls.subject}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteClass(cls.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))
            )}
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-accent" /> Top 5 Leaderboard
          </h2>
          <div className="space-y-2">
            {leaderboard.map((user, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  user.name === profile.name || user.username === profile.username ? 'bg-primary/10' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                  <span className="font-medium">{user.name || user.username}</span>
                </div>
                <Badge variant="secondary">{user.total_lifetime_xp} XP</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Weekly Summary */}
      <Card className="p-8 space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" /> AI Weekly Summary
        </h2>
        {weeklySummary ? (
          <div className="space-y-3">
            <p className="text-lg leading-relaxed">{weeklySummary.summary_text}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>📊 {weeklySummary.tasks_completed} tasks</span>
              <span>⏱️ {weeklySummary.focus_minutes} minutes</span>
              <span>⭐ +{weeklySummary.xp_gained} XP</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">No summary yet for this week</p>
            <Button onClick={generateWeeklySummary} variant="outline">
              <Sparkles className="w-4 h-4 mr-2" /> Generate Summary
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Home;
