'use client';

import { useState, useEffect } from 'react';
import { useSync } from '@/lib/useSync';
import AudioPlayer from '@/components/AudioPlayer';
import { Song } from '@/lib/types';
import { Music, Plus, DoorOpen } from 'lucide-react';

export default function Home() {
  const [channelId, setChannelId] = useState<string | null>(null);
  const [inputChannel, setInputChannel] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  
  const { state, updateRemoteState, getAdjustedTime, clockOffset } = useSync(channelId || 'default');

  useEffect(() => {
    fetch('/api/songs')
      .then(res => res.json())
      .then(data => setSongs(data));
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputChannel.trim()) {
      setChannelId(inputChannel.trim());
    }
  };

  const handleCreate = () => {
    const newId = Math.random().toString(36).substring(7).toUpperCase();
    setChannelId(newId);
  };

  if (!channelId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-black">
        <div className="aura-card w-full max-w-md text-center flex flex-col items-center gap-8 py-16">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl">Aura Sync</h1>
            <p className="serift-text italic text-white/50 text-lg">Experience music in perfect unison.</p>
          </div>

          <form onSubmit={handleJoin} className="w-full space-y-4 pt-8">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter Channel ID"
                value={inputChannel}
                onChange={(e) => setInputChannel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-mint transition-colors text-center text-xl tracking-widest uppercase font-mono"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full py-4 text-lg">
              <DoorOpen size={20} /> Join Session
            </button>
          </form>

          <div className="flex items-center gap-4 w-full">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-[10px] text-white/30 uppercase tracking-widest">or</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <button onClick={handleCreate} className="btn w-full py-4 text-lg">
            <Plus size={20} /> Create New Channel
          </button>
        </div>
        
        <footer className="mt-12 text-[10px] text-white/20 uppercase tracking-[0.2em] font-light">
          Built for perfectly synchronized playback
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-transparent">
      <div className="mb-12 flex items-center gap-2 text-white/30">
        <Music size={14} className="text-mint" />
        <span className="text-[10px] uppercase tracking-widest">Connected to {channelId}</span>
      </div>
      
      <AudioPlayer 
        channelId={channelId}
        songs={songs}
        state={state}
        updateState={updateRemoteState}
        getAdjustedTime={getAdjustedTime}
      />

      <div className="mt-12 flex flex-col items-center gap-4">
         <button 
           onClick={() => setChannelId(null)}
           className="text-[10px] text-white/20 hover:text-white/60 transition-colors uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10"
         >
           Leave Session
         </button>
      </div>
    </main>
  );
}
