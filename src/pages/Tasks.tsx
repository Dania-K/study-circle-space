import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, Check, Sparkles, Trash2 } from "lucide-react";
import { format } from "date-fns";

const Tasks = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) loadTasks();
  }, [user]);

  const loadTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setTasks(data || []);
  };

  const generateStudyPlan = async () => {
    if (!newTask || !selectedDate) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setGeneratingPlan(true);
    const { data } = await supabase.functions.invoke('generate-study-plan', {
      body: { 
        taskTitle: newTask,
        deadline: selectedDate.toISOString(),
        subject: selectedSubject
      }
    });

    if (data?.plan) {
      // Create multiple tasks based on AI plan
      const tasksToInsert = data.plan.map((item: any) => ({
        user_id: user!.id,
        title: `Day ${item.day}: ${item.task}`,
        subject: selectedSubject,
        due_date: new Date(Date.now() + item.day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium'
      }));

      await supabase.from('tasks').insert(tasksToInsert);
      toast({ title: "Study plan created! 📚" });
      setNewTask("");
      setSelectedSubject("");
      setSelectedDate(undefined);
      loadTasks();
    }
    setGeneratingPlan(false);
  };

  const addQuickTask = async () => {
    if (!newTask || !user) return;
    await supabase.from('tasks').insert({
      user_id: user.id,
      title: newTask,
      subject: selectedSubject || null,
    });
    setNewTask("");
    setSelectedSubject("");
    loadTasks();
    toast({ title: "Task added!" });
  };

  const completeTask = async (taskId: string) => {
    await supabase.from('tasks').update({ completed: true }).eq('id', taskId);
    
    // Award XP
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, total_lifetime_xp, level')
      .eq('id', user!.id)
      .single();

    if (profile) {
      const newXP = profile.xp + 10;
      const newTotalXP = profile.total_lifetime_xp + 10;
      const newLevel = Math.floor(newTotalXP / 100) + 1;

      await supabase.from('profiles').update({
        xp: newXP,
        total_lifetime_xp: newTotalXP,
        level: newLevel
      }).eq('id', user!.id);

      toast({ title: "+10 XP! 🎉" });
    }

    loadTasks();
  };

  const deleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId);
    loadTasks();
  };

  if (loading) return <div>Loading...</div>;

  const upcomingTasks = tasks.filter(t => !t.completed && t.due_date);
  const todayTasks = tasks.filter(t => !t.completed && (!t.due_date || t.due_date === new Date().toISOString().split('T')[0]));
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Your Tasks 📝</h1>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Create AI Study Plan
          </h2>
          <div className="grid gap-4">
            <Input
              placeholder="What do you need to study?"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Subject (optional)"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick deadline"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={generateStudyPlan}
                disabled={generatingPlan || !newTask || !selectedDate}
                className="flex-1 bg-gradient-primary"
              >
                {generatingPlan ? "Generating..." : "Generate AI Study Plan"}
              </Button>
              <Button variant="outline" onClick={addQuickTask} disabled={!newTask}>
                Quick Add
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Today</h2>
            <div className="space-y-3">
              {todayTasks.length > 0 ? (
                todayTasks.map(task => (
                  <Card key={task.id} className="p-4 flex items-center gap-3">
                    <button
                      onClick={() => completeTask(task.id)}
                      className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary/20"
                    >
                    </button>
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      {task.subject && <Badge variant="secondary" className="mt-1">{task.subject}</Badge>}
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No tasks for today</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
            <div className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map(task => (
                  <Card key={task.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => completeTask(task.id)}
                        className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary/20 mt-0.5"
                      >
                      </button>
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {task.subject && <Badge variant="secondary">{task.subject}</Badge>}
                          {task.due_date && (
                            <span className="text-sm text-muted-foreground">
                              Due: {format(new Date(task.due_date), "MMM d")}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No upcoming tasks</p>
              )}
            </div>
          </Card>
        </div>

        {completedTasks.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Completed ✓</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {completedTasks.map(task => (
                <Card key={task.id} className="p-4 opacity-60">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="line-through">{task.title}</span>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Tasks;
