import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const FloatingAIHelper = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Only show if user is logged in
  if (!user) return null;

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('homework-help', {
        body: { question: input }
      });

      if (error) throw error;

      const aiMessage: Message = { 
        role: 'assistant', 
        content: data.answer || "I'm here to help with your homework!" 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Helper error:', error);
      toast({ 
        title: "Oops!", 
        description: "Couldn't reach the AI. Try again?",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-primary shadow-xl hover:shadow-2xl hover:scale-110 transition-all z-50 animate-pulse-soft"
      >
        <Sparkles className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col animate-slide-up border-2 border-primary/20">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-primary text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">AI Study Helper</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Ask me anything about your homework!</p>
              <p className="text-xs mt-2">Math, Science, History, English...</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-8'
                  : 'bg-muted mr-8'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-2 items-center text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-xs">Thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask your homework question..."
          disabled={isProcessing}
        />
        <Button onClick={sendMessage} disabled={isProcessing} className="bg-gradient-primary">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
