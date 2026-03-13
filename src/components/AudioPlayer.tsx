'use client';

import { useEffect, useRef, useState } from 'react';
import { Song, PlaybackState } from '@/lib/types';
import { Play, Pause, SkipForward, SkipBack, Loader2, Wifi, Zap } from 'lucide-react';
import ConnectedDevices from './ConnectedDevices';

interface AudioPlayerProps {
  channelId: string;
  songs: Song[];
  state: PlaybackState | null;
  updateState: (state: Partial<PlaybackState>) => void;
  getAdjustedTime: () => number;
}

export default function AudioPlayer({ 
  channelId, 
  songs, 
  state, 
  updateState, 
  getAdjustedTime 
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [drift, setDrift] = useState(0);

  const currentSong = songs.find(s => s.url === state?.currentTrack) || songs[0];

  useEffect(() => {
    if (!audioRef.current || !state) return;

    const audio = audioRef.current;

    if (state.isPlaying) {
      const serverNow = getAdjustedTime();
      const playStartTime = state.startTime;
      const expectedPos = (serverNow - playStartTime) / 1000;
      
      // If we are significantly out of sync (> 50ms), jump to the correct position
      const localPos = audio.currentTime;
      const diff = Math.abs(expectedPos - localPos);
      setDrift(diff * 1000);

      if (diff > 0.05) {
        audio.currentTime = expectedPos;
      }
      
      if (audio.paused) {
        audio.play().catch(e => console.error("Playback failed:", e));
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
      audio.currentTime = state.pauseOffset;
    }
  }, [state, getAdjustedTime]);

  // Periodic sync check
  useEffect(() => {
    const interval = setInterval(() => {
      if (state?.isPlaying && audioRef.current) {
        const serverNow = getAdjustedTime();
        const expectedPos = (serverNow - state.startTime) / 1000;
        const diff = Math.abs(expectedPos - audioRef.current.currentTime);
        setDrift(diff * 1000);
        
        // Minor adjustment if drift is > 10ms but < 200ms
        // We can slightly change playbackRate to compensate for small drift
        // or just jump if it's too much
        if (diff > 0.05) {
          audioRef.current.currentTime = expectedPos;
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [state, getAdjustedTime]);

  const handleTogglePlay = () => {
    if (!state) return;
    
    if (state.isPlaying) {
      updateState({ 
        isPlaying: false, 
        pauseOffset: audioRef.current?.currentTime || 0 
      });
    } else {
      updateState({ 
        isPlaying: true, 
        startTime: getAdjustedTime() - (state.pauseOffset * 1000)
      });
    }
  };

  const handleSkip = (direction: 'next' | 'prev') => {
    const currentIndex = songs.findIndex(s => s.url === state?.currentTrack);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= songs.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = songs.length - 1;
    
    updateState({
      currentTrack: songs[nextIndex].url,
      isPlaying: true,
      startTime: getAdjustedTime(),
      pauseOffset: 0
    });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <audio 
        ref={audioRef} 
        src={currentSong?.url}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
      />

      <div className="aura-card w-full flex flex-col items-center gap-8">
        {/* Album Art Placeholder */}
        <div className="relative w-64 h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-burgundy to-violet shadow-2xl flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
          <span className="text-6xl text-white/10 font-serif">Aura</span>
          {isBuffering && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-mint animate-spin" />
            </div>
          )}
        </div>

        <div className="text-center w-full">
          <h2 className="text-2xl mb-1 truncate">{currentSong?.name || 'Select a Track'}</h2>
          <p className="text-sm text-white/50 font-sans tracking-widest uppercase">Shared Session: {channelId}</p>
        </div>

        {/* Progress */}
        <div className="w-full space-y-2">
          <div className="progress-bar-container h-1">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-white/40 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button onClick={() => handleSkip('prev')} className="text-white/60 hover:text-white transition-colors">
            <SkipBack size={24} />
          </button>
          <button 
            onClick={handleTogglePlay}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:bg-mint hover:scale-105 transition-all shadow-lg"
          >
            {state?.isPlaying ? <Pause size={32} /> : <Play size={32} fill="black" />}
          </button>
          <button onClick={() => handleSkip('next')} className="text-white/60 hover:text-white transition-colors">
            <SkipForward size={24} />
          </button>
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-4 text-[10px] text-white/30 uppercase tracking-widest pt-4 border-t border-white/5 w-full justify-center">
          <div className="flex items-center gap-1">
             <div className={`w-2 h-2 rounded-full bg-mint ${drift < 10 ? 'mint-pulse' : ''}`}></div>
             <span>Synced</span>
          </div>
          <div className="flex items-center gap-1">
             <Zap size={10} className={drift < 20 ? 'text-mint' : 'text-white/20'} />
             <span>{drift.toFixed(0)}ms Drift</span>
          </div>
          <div className="flex items-center gap-1">
             <Wifi size={10} className="text-white/20" />
             <span>Active</span>
          </div>
        </div>
      </div>

      <ConnectedDevices />
    </div>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
