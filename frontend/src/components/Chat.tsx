import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ArrowUp, Smile, Loader2, Sparkles, CircuitBoard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateInitialPrompt } from '@/lib/prompts';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite-preview-02-05' });

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const [chat] = useState(() => {
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });
    
    // Initialize the chat with the persona
    chat.sendMessage(generateInitialPrompt());
    return chat;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }

    try {
      const result = await chat.sendMessage(input);
      const response = await result.response;
      
      const botMessage: Message = { role: 'bot', content: response.text() };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = { role: 'bot', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = '40px';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    setInput(textarea.value);
  };

  const handleExampleClick = (text: string) => {
    setInput(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = '40px';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  return (
    <div className="relative flex flex-col h-full rounded-2xl bg-background/80 backdrop-blur-sm shadow-2xl">
      <div className="flex-none flex items-center gap-2 border-b bg-muted/50 p-4 rounded-t-2xl">
        <div className="flex items-center gap-4 px-2">
          <div className="relative flex items-center justify-center w-9 h-9">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/40 via-blue-600/40 to-violet-600/40 rounded-xl blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-blue-500 to-violet-500 rounded-xl opacity-20" />
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.1),transparent)] animate-pulse" />
            <CircuitBoard className="relative z-10 h-5 w-5 text-primary opacity-90" />
          </div>
          <div>
            <h2 className="font-semibold">Milan</h2>
            <p className="text-xs text-muted-foreground">Powered by Google</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4 max-w-sm mx-auto">
              <div className="relative mx-auto w-14 h-14">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/40 via-blue-600/40 to-violet-600/40 rounded-xl blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-blue-500 to-violet-500 rounded-xl opacity-20" />
                <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.1),transparent)] animate-pulse" />
                <div className="relative flex items-center justify-center w-full h-full">
                  <Sparkles className="h-7 w-7 text-primary opacity-90" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                  Let's start a conversation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ask me about my background, interests, or what I'm working on!
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 px-4">
                <button 
                  onClick={() => handleExampleClick("What are you studying at university?")}
                  className="text-left text-xs text-muted-foreground/80 bg-muted/30 p-2 rounded-lg backdrop-blur-[2px] hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  "What are you studying at university?"
                </button>
                <button 
                  onClick={() => handleExampleClick("What are your plans this summer?")}
                  className="text-left text-xs text-muted-foreground/80 bg-muted/30 p-2 rounded-lg backdrop-blur-[2px] hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  "What are your plans this summer?"
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3 text-sm",
                  message.role === 'user' && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "relative group rounded-2xl px-4 py-3 max-w-[85%] transition-all duration-300",
                    message.role === 'user' 
                      ? "bg-primary/90 text-primary-foreground shadow-lg after:absolute after:inset-0 after:rounded-2xl after:shadow-[inset_0_0_8px_rgba(255,255,255,0.1)] after:z-[-1]" 
                      : "bg-muted/90 shadow-md after:absolute after:inset-0 after:rounded-2xl after:shadow-[inset_0_0_8px_rgba(0,0,0,0.05)] after:z-[-1]",
                    "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/5 before:to-transparent before:backdrop-blur-sm"
                  )}
                >
                  <div className="relative z-10">
                    <pre className="whitespace-pre-wrap font-sans">
                      {message.content}
                    </pre>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 text-sm">
                <div className="relative rounded-2xl px-4 py-3 bg-muted/90 shadow-md before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/5 before:to-transparent">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="flex-none px-4 pb-4">
        <div className={cn(
          "relative transition-all duration-300",
          isFocused ? "scale-[1.01]" : "scale-100"
        )}>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-violet-500/10 rounded-2xl blur-[2px]" />
          <div className="relative bg-muted/30 rounded-2xl p-0.5 backdrop-blur-[2px]">
            <div className="relative flex items-end bg-background rounded-xl">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={adjustTextareaHeight}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Message Milan..."
                className="min-h-[40px] h-[40px] max-h-[120px] resize-none py-2 px-4 pr-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 no-scrollbar placeholder:text-muted-foreground/50"
                rows={1}
              />
              <div 
                className={cn(
                  "absolute transition-all duration-200",
                  input.split('\n').length > 1 
                    ? "right-2 bottom-2" 
                    : "right-2 bottom-[50%] translate-y-[50%]"
                )}
              >
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-8 w-8 rounded-lg bg-primary/90 hover:bg-primary transition-all duration-200",
                    isFocused ? "opacity-100" : "opacity-90",
                    !input.trim() && "opacity-50"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                  ) : (
                    <ArrowUp className="h-4 w-4 text-primary-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <p className="text-xs text-muted-foreground/80 bg-muted/50 px-3 py-1 rounded-full">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}; 