import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Clock, Sparkles, CheckCircle2 } from "lucide-react";

const SAMPLE_TASKS = [
  { id: 1, title: "Complete calculus homework", priority: "high", dueDate: "2025-11-20", category: "Math", completed: false },
  { id: 2, title: "Read history chapter 5", priority: "medium", dueDate: "2025-11-22", category: "History", completed: false },
  { id: 3, title: "Chemistry lab report", priority: "high", dueDate: "2025-11-18", category: "Science", completed: false },
  { id: 4, title: "Practice coding exercises", priority: "low", dueDate: "2025-11-25", category: "CS", completed: true },
];

const Tasks = () => {
  const [showAiPlanner, setShowAiPlanner] = useState(false);
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState(false);

  const generatePlan = () => {
    if (subject && deadline) {
      setGeneratedPlan(true);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive";
      case "medium": return "bg-secondary/20 text-secondary-foreground";
      case "low": return "bg-accent/20 text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks and create AI-powered study plans
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAiPlanner(!showAiPlanner)}
            className="bg-gradient-secondary"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Study Plan
          </Button>
          <Button className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {showAiPlanner && (
        <Card className="p-6 bg-gradient-to-br from-secondary/5 to-accent/5 border-2 border-secondary/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-secondary" />
            <h2 className="text-xl font-semibold">AI Study Plan Generator</h2>
          </div>
          
          {!generatedPlan ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input 
                  placeholder="E.g., Calculus Midterm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Deadline</label>
                <Input 
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <Button 
                onClick={generatePlan}
                disabled={!subject || !deadline}
                className="bg-gradient-secondary"
              >
                Generate Study Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Weekly Study Plan for {subject}</h3>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, i) => (
                  <div key={day} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="w-4 h-4 text-primary mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{day}</p>
                      <p className="text-sm text-muted-foreground">
                        {i === 0 && "Review chapters 1-2, practice problems 1-10"}
                        {i === 1 && "Work through example problems, create summary notes"}
                        {i === 2 && "Practice quiz questions, review formulas"}
                        {i === 3 && "Complete practice exam, identify weak areas"}
                        {i === 4 && "Final review and rest"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button className="bg-gradient-primary">Add to Tasks</Button>
                <Button variant="outline" onClick={() => setGeneratedPlan(false)}>
                  Generate New Plan
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-3">
            {SAMPLE_TASKS.map((task) => (
              <Card key={task.id} className="p-4 hover:shadow-hover transition-all">
                <div className="flex items-start gap-4">
                  <button className="mt-1">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </h3>
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">{task.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-3">
            {SAMPLE_TASKS.filter(t => !t.completed).map((task) => (
              <Card key={task.id} className="p-4 hover:shadow-hover transition-all">
                <div className="flex items-start gap-4">
                  <button className="mt-1">
                    <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-3">
            {SAMPLE_TASKS.filter(t => t.completed).map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium line-through text-muted-foreground mb-2">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
