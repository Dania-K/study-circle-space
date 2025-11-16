import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Sparkles } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const HomeworkAgent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!loading && !user) {
    navigate("/auth");
    return null;
  }

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('homework-help', {
        body: { question: userMessage }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              AI Homework Helper <Sparkles className="w-6 h-6 text-primary" />
            </h1>
            <p className="text-muted-foreground">Ask me anything about your homework!</p>
          </div>
        </div>

        <Card className="p-6 min-h-[500px] flex flex-col shadow-card">
          <div className="flex-1 space-y-4 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Bot className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to help!</h3>
                <p className="text-muted-foreground max-w-md">
                  Ask me about math, science, history, English, or any school subject.
                  I'll explain concepts, help solve problems, and guide you through your homework.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <Card
                    className={`p-4 max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </Card>
                </div>
              ))
            )}
            {isProcessing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <Card className="p-4 bg-muted">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </Card>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask your homework question..."
              className="min-h-[60px] resize-none"
              disabled={isProcessing}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isProcessing}
              className="bg-gradient-primary h-[60px] px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomeworkAgent;
