import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer, Users, Send, Smile } from "lucide-react";

const MOODS = ["😊", "😤", "🎯", "💪", "🧘", "🔥"];

const SAMPLE_ROOMS = [
  { id: 1, name: "Math Study Group", subject: "Mathematics", users: 8, inSession: true },
  { id: 2, name: "Late Night Coders", subject: "Computer Science", users: 12, inSession: true },
  { id: 3, name: "History Finals Prep", subject: "History", users: 5, inSession: false },
  { id: 4, name: "Chemistry Lab", subject: "Chemistry", users: 6, inSession: true },
];

const Rooms = () => {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [chatMessage, setChatMessage] = useState("");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const joinRoom = () => {
    if (selectedMood && currentTask) {
      setInRoom(true);
    }
  };

  if (inRoom && selectedRoom) {
    const room = SAMPLE_ROOMS.find(r => r.id === selectedRoom);
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{room?.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{room?.subject}</Badge>
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="w-4 h-4" />
                {room?.users} studying
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={() => setInRoom(false)}>
            Leave Room
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Pomodoro Timer */}
            <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-0">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Timer className="w-4 h-4" />
                  Focus Session
                </div>
                <div className="text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {formatTime(timeLeft)}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button className="bg-gradient-primary">Start</Button>
                  <Button variant="outline">Pause</Button>
                  <Button variant="outline">Reset</Button>
                </div>
              </div>
            </Card>

            {/* Your Task */}
            <Card className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">{selectedMood}</span>
                Your Current Task
              </h3>
              <p className="text-lg font-medium mb-4">{currentTask}</p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">AI-generated subtasks:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Review chapter concepts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Practice 5 problems</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Take notes on key formulas</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Others' Goals */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">What Others Are Working On</h3>
              <div className="space-y-3">
                {[
                  { user: "Alex", mood: "🎯", task: "Calculus homework - derivatives", anonymous: false },
                  { user: "Anonymous", mood: "💪", task: "Preparing for quiz", anonymous: true },
                  { user: "Sam", mood: "😊", task: "Reading textbook chapter 5", anonymous: false },
                ].map((goal, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-2xl">{goal.mood}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{goal.user}</p>
                      <p className="text-sm text-muted-foreground">{goal.task}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 h-[600px] flex flex-col">
              <h3 className="font-semibold mb-4">Room Chat</h3>
              <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                <div className="text-sm">
                  <span className="font-medium">Alex:</span>
                  <span className="text-muted-foreground ml-2">Good luck everyone! 🎯</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Sam:</span>
                  <span className="text-muted-foreground ml-2">Let's focus! 💪</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Type a message..." 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <Button size="icon" className="bg-gradient-primary">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold mb-2">Focus Rooms</h1>
        <p className="text-muted-foreground">
          Join a virtual study room and focus together with other students
        </p>
      </div>

      {selectedRoom ? (
        <Card className="p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Join Room</h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">How are you feeling?</label>
              <div className="flex gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`text-4xl p-3 rounded-xl transition-all hover:scale-110 ${
                      selectedMood === mood ? "bg-primary/20 scale-110" : "bg-muted/50"
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">What task will you work on?</label>
              <Input
                placeholder="E.g., Study calculus chapter 3"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-gradient-primary"
                onClick={joinRoom}
                disabled={!selectedMood || !currentTask}
              >
                Join Room
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedRoom(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Rooms</TabsTrigger>
            <TabsTrigger value="math">Math</TabsTrigger>
            <TabsTrigger value="science">Science</TabsTrigger>
            <TabsTrigger value="cs">Computer Science</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {SAMPLE_ROOMS.map((room) => (
                <Card key={room.id} className="p-6 hover:shadow-hover transition-all cursor-pointer" onClick={() => setSelectedRoom(room.id)}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{room.name}</h3>
                      <Badge variant="secondary">{room.subject}</Badge>
                    </div>
                    {room.inSession && (
                      <Badge className="bg-gradient-primary">
                        <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse-soft mr-1" />
                        Live
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {room.users} studying
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Rooms;
