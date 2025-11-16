import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Tasks = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      supabase.from('tasks').select('*').order('created_at', { ascending: false }).then(({ data }) => setTasks(data || []));
    }
  }, [user]);

  const addTask = async () => {
    if (!newTask || !user) return;
    await supabase.from('tasks').insert({ user_id: user.id, title: newTask });
    setNewTask("");
    supabase.from('tasks').select('*').then(({ data }) => setTasks(data || []));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tasks</h1>
      <Card className="p-6">
        <div className="flex gap-2">
          <Input placeholder="New task..." value={newTask} onChange={e => setNewTask(e.target.value)} />
          <Button className="bg-gradient-primary" onClick={addTask}>Add</Button>
        </div>
      </Card>
      <div className="space-y-3">
        {tasks.map(task => (
          <Card key={task.id} className="p-4">
            <p className="font-medium">{task.title}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tasks;