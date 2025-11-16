import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIHelpPanel = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      {isOpen ? (
        <Card className="glass-card shadow-xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-gradient-primary p-4 rounded-t-3xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center animate-glow">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold flex items-center gap-1">
                  AI Homework Helper <Sparkles className="w-4 h-4" />
                </h3>
                <p className="text-white/80 text-xs">Ask me anything!</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-4 h-96 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot className="w-12 h-12 text-muted-foreground/50 mb-3 animate-float" />
                  <p className="text-sm text-muted-foreground">
                    Ask me about homework, concepts, or study tips!
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-[80%] animate-in slide-in-from-bottom-2 ${
                        msg.role === 'user'
                          ? 'bg-gradient-primary text-white shadow-glow'
                          : 'glass-card'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isProcessing && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="glass-card px-4 py-2 rounded-2xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask a question..."
                className="rounded-2xl border-2 focus:shadow-glow"
                disabled={isProcessing}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isProcessing}
                className="bg-gradient-primary rounded-2xl shadow-glow hover:scale-105 transition-transform"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-primary shadow-xl rounded-full w-16 h-16 p-0 hover:scale-110 transition-transform animate-glow"
        >
          <div className="relative">
            <Bot className="w-7 h-7" />
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </Button>
      )}
    </div>
  );
};
