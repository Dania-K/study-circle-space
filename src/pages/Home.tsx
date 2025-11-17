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
import { Trophy, Sparkles, Clock, Users, CheckCircle, Palette, Trash2, Edit } from "lucide-react";
import { EditProfileModal } from "@/components/EditProfileModal";

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
  const [userClasses, setUserClasses] = useState<any[]>([]);
  const [newClass, setNewClass] = useState({ name: "", subject: "", teacher: "" });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

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
      .limit(20);
    
    // Dummy users with realistic names
    const dummyUsers = [
      { name: "Maya Carter", username: "maya_c", total_lifetime_xp: 890, level: 8, isDummy: true },
      { name: "Ibrahim Khan", username: "ibrahim_k", total_lifetime_xp: 820, level: 7, isDummy: true },
      { name: "Sofia Martinez", username: "sofia_m", total_lifetime_xp: 780, level: 7, isDummy: true },
      { name: "Lily Chen", username: "lily_c", total_lifetime_xp: 750, level: 7, isDummy: true },
      { name: "Jacob Thompson", username: "jacob_t", total_lifetime_xp: 690, level: 6, isDummy: true },
      { name: "Aisha Patel", username: "aisha_p", total_lifetime_xp: 650, level: 6, isDummy: true },
      { name: "Ethan Rodriguez", username: "ethan_r", total_lifetime_xp: 620, level: 6, isDummy: true },
      { name: "Zara Williams", username: "zara_w", total_lifetime_xp: 580, level: 5, isDummy: true },
      { name: "Noah Kim", username: "noah_k", total_lifetime_xp: 540, level: 5, isDummy: true },
      { name: "Emma Johnson", username: "emma_j", total_lifetime_xp: 500, level: 5, isDummy: true },
      { name: "Liam O'Brien", username: "liam_o", total_lifetime_xp: 460, level: 4, isDummy: true },
      { name: "Olivia Brown", username: "olivia_b", total_lifetime_xp: 420, level: 4, isDummy: true },
    ];
    
    // Combine real users first, then dummy users
    const realUsers = (data || []).map(u => ({ ...u, isDummy: false }));
    const combined = [...realUsers, ...dummyUsers]
      .sort((a, b) => (b.total_lifetime_xp || 0) - (a.total_lifetime_xp || 0))
      .slice(0, 15);
    
    setLeaderboard(combined);
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
    
    // If no real summary exists, show an intriguing dummy summary
    if (!data) {
      setWeeklySummary({
        summary_text: "You're off to an incredible start this week! Your focus during study sessions has been exceptional, and your pet is thriving alongside you. Keep up the momentum—your consistency is building the foundation for long-term success. Remember, every completed task and focus session brings you closer to your goals. The community is noticing your dedication! 🌟",
        tasks_completed: 12,
        focus_minutes: 287,
        xp_gained: 450,
        isDummy: true
      });
    } else {
      setWeeklySummary(data);
    }
  };

  const generateWeeklySummary = async () => {
    const { data } = await supabase.functions.invoke('generate-weekly-summary', { body: { userId: user!.id } });
    if (data) {
      toast({ title: "Weekly summary generated! 📊" });
      loadWeeklySummary();
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
  const nextLevelXP = (profile.level * 100);
  const xpProgress = ((profile.xp) / nextLevelXP);
  const userRank = leaderboard.findIndex(u => (u.name === profile.name || u.username === profile.username)) + 1;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* HERO SECTION: XP, Level, Streak, Pet */}
      <Card className="glass-card p-8 sm:p-12 shadow-elegant relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#B7D8B5]/10 via-transparent to-[#D6CFC4]/10 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Pet + XP Ring */}
            <div className="relative">
              <svg className="w-40 h-40 sm:w-48 sm:h-48 -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#hero-gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - xpProgress)}`}
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#B7D8B5" />
                    <stop offset="50%" stopColor="#D6CFC4" />
                    <stop offset="100%" stopColor="#B7D8B5" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-7xl sm:text-8xl animate-float">
                {petEmoji}
              </div>
            </div>

            {/* Name + School Info */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-bold gradient-text">{name}</h1>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-muted-foreground text-sm sm:text-base">
                {profile?.school && <span>{profile.school}</span>}
                {profile?.grade && profile?.school && <span>•</span>}
                {profile?.grade && <span>Grade {profile.grade}</span>}
              </div>
            </div>

            {/* Level + XP Bar */}
            <div className="space-y-3 w-full max-w-md px-4">
              <div className="flex items-center justify-between text-xl sm:text-2xl font-bold">
                <span>Level {profile?.level || 1}</span>
                <span className="text-[#B7D8B5]">{profile?.xp || 0} / {nextLevelXP} XP</span>
              </div>
              <Progress value={xpProgress * 100} className="h-4 shadow-lg" />
            </div>

            {/* Streak + Rank Badges */}
            <div className="flex gap-4 sm:gap-6 flex-wrap justify-center">
              <Badge variant="secondary" className="text-lg sm:text-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg hover-lift">
                🔥 {profile?.streak || 0} Day Streak
              </Badge>
              <Badge variant="secondary" className="text-lg sm:text-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg hover-lift">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Rank #{userRank > 0 ? userRank : '-'}
              </Badge>
            </div>

            {/* Edit Profile + Theme/Pet Selectors */}
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-2xl pt-4">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setIsEditProfileOpen(true)}
                className="shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
              >
                <Edit className="w-5 h-5 mr-2" />
                Edit Profile
              </Button>
              
              <div className="flex gap-4 w-full sm:w-auto">
                <Select value={theme} onValueChange={changeTheme}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pet Selection */}
            <div className="w-full max-w-md space-y-3">
              <label className="text-sm font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Choose Your Study Pet
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => updatePetType(p.id)}
                    className={`p-3 rounded-lg text-3xl hover:scale-110 transition-transform ${
                      petType === p.id ? "bg-[#B7D8B5]/30 ring-2 ring-[#B7D8B5]" : "bg-secondary/30"
                    }`}
                    title={p.name}
                  >
                    {p.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="glass-card p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-[#B7D8B5]" />
              <div className="text-2xl font-bold">{stats.tasksCompleted}</div>
              <div className="text-xs text-muted-foreground">Tasks Done</div>
            </Card>
            <Card className="glass-card p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-[#B7D8B5]" />
              <div className="text-2xl font-bold">{stats.focusMinutes}</div>
              <div className="text-xs text-muted-foreground">Focus Mins</div>
            </Card>
            <Card className="glass-card p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-[#B7D8B5]" />
              <div className="text-2xl font-bold">{stats.roomsJoined}</div>
              <div className="text-xs text-muted-foreground">Rooms</div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-lg">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button onClick={() => navigate('/rooms')} className="w-full h-20 text-base">
                <Users className="w-5 h-5 mb-1" />
                <span className="block text-sm">Focus Rooms</span>
              </Button>
              <Button onClick={() => navigate('/tasks')} variant="secondary" className="w-full h-20 text-base">
                <CheckCircle className="w-5 h-5 mb-1" />
                <span className="block text-sm">My Tasks</span>
              </Button>
              <Button onClick={() => navigate('/community')} variant="outline" className="w-full h-20 text-base">
                <Sparkles className="w-5 h-5 mb-1" />
                <span className="block text-sm">Community</span>
              </Button>
            </div>
          </Card>

          {/* AI Weekly Summary - Large and Prominent */}
          <Card className="glass-card p-8 shadow-elegant">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-2xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#B7D8B5]" />
                  AI Weekly Summary
                </h3>
                {weeklySummary?.isDummy && (
                  <Badge variant="outline" className="text-sm">Preview</Badge>
                )}
              </div>
              
              {weeklySummary ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-lg bg-gradient-to-br from-[#B7D8B5]/10 to-[#D6CFC4]/10 border-2 border-[#B7D8B5]/20">
                    <p className="text-base leading-relaxed text-foreground">{weeklySummary.summary_text}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-[#B7D8B5]/20 to-transparent text-center">
                      <div className="font-bold text-3xl text-[#B7D8B5] mb-1">{weeklySummary.tasks_completed}</div>
                      <div className="text-sm text-muted-foreground">Tasks Completed</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-[#D6CFC4]/20 to-transparent text-center">
                      <div className="font-bold text-3xl text-[#B7D8B5] mb-1">{weeklySummary.focus_minutes}</div>
                      <div className="text-sm text-muted-foreground">Focus Minutes</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-[#B7D8B5]/20 to-transparent text-center">
                      <div className="font-bold text-3xl text-[#B7D8B5] mb-1">{weeklySummary.xp_gained}</div>
                      <div className="text-sm text-muted-foreground">XP Gained</div>
                    </div>
                  </div>
                  
                  {!weeklySummary.isDummy && (
                    <Button 
                      onClick={generateWeeklySummary} 
                      size="lg" 
                      variant="outline"
                      className="w-full"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Regenerate Summary
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No summary yet for this week</p>
                  <Button onClick={generateWeeklySummary} size="lg">
                    Generate AI Summary
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* My Classes */}
          <Card className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-lg">My Classes</h3>
            <div className="space-y-3">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userClasses.map(cls => (
                  <div key={cls.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{cls.class_name}</div>
                      <div className="text-xs text-muted-foreground">{cls.subject}</div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteClass(cls.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-2 border-t">
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
                  <Button onClick={addClass}>Add</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Leaderboard */}
        <div className="lg:col-span-1">
          <Card className="glass-card p-6 sticky top-6 shadow-elegant">
            <div className="space-y-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#B7D8B5]" />
                Leaderboard
              </h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((user, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      idx < 3 
                        ? 'bg-gradient-to-r from-[#B7D8B5]/20 to-transparent border border-[#B7D8B5]/30' 
                        : 'bg-secondary/30 hover:bg-secondary/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                      idx === 1 ? 'bg-gray-400/20 text-gray-600' :
                      idx === 2 ? 'bg-orange-500/20 text-orange-600' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{user.name || user.username}</div>
                      <div className="text-xs text-muted-foreground">{user.total_lifetime_xp} XP</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">L{user.level}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <EditProfileModal 
        open={isEditProfileOpen} 
        onOpenChange={setIsEditProfileOpen}
      />
    </div>
  );
};

export default Home;
