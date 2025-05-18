import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ArrowUp, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateInitialPrompt } from '@/lib/prompts';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('Gemini API key not found');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite-preview-02-05' });

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [chat] = useState(() => {
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });
    chat.sendMessage(generateInitialPrompt());
    return chat;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageToSend?: string) => {
    const messageContent = messageToSend || input;
    if (!messageContent.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: messageContent }]);
    setInput('');
    setIsLoading(true);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }

    try {
      const result = await chat.sendMessage(messageContent);
      const response = await result.response;
      setMessages(prev => [...prev, { role: 'bot', content: response.text() }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
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
    textarea.style.height = 'auto';
    setInput(textarea.value);
  };

  return (
    <div className="flex flex-col h-full bg-background/70 rounded-2xl shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-muted/50 rounded-t-2xl">
        <div className="flex items-center gap-3 px-1">
          <div className="relative flex items-center justify-center w-8 h-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0078D4_0%,rgba(0,120,212,0.2)_50%,transparent_100%)] rounded-xl opacity-30 blur-[1px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0078D4]/10 via-[#2B88D8]/5 to-transparent rounded-xl" />
            <User className="relative z-10 h-4 w-4 text-[#0078D4]" />
          </div>
          <div>
            <h2 className="font-medium text-sm">Milan</h2>
            <p className="text-[11px] text-muted-foreground">Powered by Google</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-5 max-w-sm mx-auto">
              <div className="relative mx-auto w-12 h-12">
                <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_center,#0078D4_0%,rgba(0,120,212,0.2)_50%,transparent_100%)] opacity-30 blur-[1px]" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#0078D4]/10 via-[#2B88D8]/5 to-transparent" />
                <div className="relative flex items-center justify-center w-full h-full">
                  <Sparkles className="h-6 w-6 text-[#0078D4]" />
                </div>
              </div>
              <div className="space-y-2">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-[#0078D4] via-[#2B88D8] to-[#0078D4] bg-clip-text text-transparent">
              Welcome! Let's chat
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ask me about my background, interests, or what I'm working on!
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 px-4">
                <button 
                  onClick={() => handleSend("What are you studying at university?")}
                  className="cursor-pointer text-left text-[13px] text-zinc-600 dark:text-zinc-300 bg-zinc-100/80 dark:bg-zinc-800/80 px-3 py-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 hover:!bg-[#0078D4]/5 hover:!text-[#0078D4] hover:!border-[#0078D4]/30"
                >
                  What are you studying at university?
                </button>
                <button 
                  onClick={() => handleSend("What are your plans this summer?")}
                  className="cursor-pointer text-left text-[13px] text-zinc-600 dark:text-zinc-300 bg-zinc-100/80 dark:bg-zinc-800/80 px-3 py-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 hover:!bg-[#0078D4]/5 hover:!text-[#0078D4] hover:!border-[#0078D4]/30"
                >
                  What are your plans this summer?
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  message.role === 'user' && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "px-3 py-2 max-w-[85%] rounded-2xl text-sm transition-all duration-200",
                    message.role === 'user' 
                      ? "bg-[#0078D4] text-white rounded-br-md" 
                      : "dark:bg-zinc-800 bg-zinc-100 rounded-bl-md"
                  )}
                >
                  <pre className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed">
                    {message.content}
                  </pre>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="px-3 py-2 rounded-2xl rounded-bl-md dark:bg-zinc-800 bg-zinc-100">
                  <div className="flex items-center gap-1 h-[22px]">
                    <div className="w-1.5 h-1.5 dark:bg-zinc-500 bg-zinc-400 rounded-full animate-[bounce_1.4s_ease-in-out_infinite]" />
                    <div className="w-1.5 h-1.5 dark:bg-zinc-500 bg-zinc-400 rounded-full animate-[bounce_1.4s_ease-in-out_infinite_0.2s]" />
                    <div className="w-1.5 h-1.5 dark:bg-zinc-500 bg-zinc-400 rounded-full animate-[bounce_1.4s_ease-in-out_infinite_0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3">
        <div className="relative flex items-center rounded-lg dark:bg-[#1E1E1E]/90 bg-white/90 border dark:border-white/5 border-black/5">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={adjustTextareaHeight}
            onKeyDown={handleKeyDown}
            placeholder="Message Milan..."
            className="min-h-[40px] h-[40px] max-h-[120px] resize-none py-[9px] px-3 pr-10 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 no-scrollbar text-sm transition-all duration-200 flex items-center"
            rows={1}
          />
          <Button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            size="icon"
            variant="ghost"
            className={cn(
              "absolute right-2 h-7 w-7 rounded-lg bg-[#0078D4] hover:bg-[#006CBE] dark:hover:bg-[#006CBE] cursor-pointer group transition-all duration-200 active:scale-95 bottom-1.5",
            )}
          >
            <ArrowUp className="h-3.5 w-3.5 text-white dark:text-white transition-all duration-200 group-active:scale-90 group-active:translate-y-[1px]" />
          </Button>
        </div>
        <div className="flex justify-center mt-2">
          <p className="text-[10px] text-muted-foreground/60">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}; 