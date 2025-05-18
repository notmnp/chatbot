import React from 'react';
import { Chat } from '@/components/Chat';

const Home: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-background to-muted">
      {/* Background blur effects */}
      <div className="fixed top-1/4 -left-1/2 w-[1000px] h-[1000px] bg-purple-500/10 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center overflow-auto no-scrollbar">
        <div className="w-full max-w-lg text-center mt-30 mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Chat with Milan
          </h1>
          <p className="text-muted-foreground text-lg">
            Experience natural conversations powered by Google Gemini
          </p>
        </div>
        <div className="relative w-full max-w-lg mx-auto h-[600px] px-4 mb-8">
          <div className="relative h-full rounded-2xl bg-background/80 backdrop-blur-sm shadow-lg">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 