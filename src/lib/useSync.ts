'use client';

import { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { PlaybackState, SyncResponse } from './types';

export function useSync(channelId: string) {
  const [clockOffset, setClockOffset] = useState(0);
  const [state, setState] = useState<PlaybackState | null>(null);
  const pusherRef = useRef<Pusher | null>(null);

  // 1. Clock Synchronization (NTP-style)
  useEffect(() => {
    async function syncClock() {
      const offsets: number[] = [];
      
      // Perform 5 samples for better accuracy
      for (let i = 0; i < 5; i++) {
        const t0 = Date.now();
        try {
          const response = await fetch('/api/time');
          const data: SyncResponse = await response.json();
          const t1 = data.serverTime;
          const t2 = Date.now();
          
          // offset = serverTime - (receiveTime + sendTime) / 2
          const offset = t1 - (t0 + t2) / 2;
          offsets.push(offset);
        } catch (e) {
          console.error('Sync error', e);
        }
        await new Promise(r => setTimeout(r, 200));
      }
      
      if (offsets.length > 0) {
        const avgOffset = offsets.reduce((a, b) => a + b) / offsets.length;
        setClockOffset(avgOffset);
        console.log(`Clock synchronized. Offset: ${avgOffset.toFixed(2)}ms`);
      }
    }

    syncClock();
  }, []);

  // 2. State Management via Pusher
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    pusherRef.current = pusher;

    const channel = pusher.subscribe(`channel-${channelId}`);
    
    channel.bind('playback-update', (updatedState: PlaybackState) => {
      setState(updatedState);
    });

    // Initial state fetch
    fetch(`/api/state?channelId=${channelId}`)
      .then(res => res.json())
      .then(data => setState(data));

    return () => {
      pusher.unsubscribe(`channel-${channelId}`);
      pusher.disconnect();
    };
  }, [channelId]);

  const updateRemoteState = async (newState: Partial<PlaybackState>) => {
    const fullNewState = { ...state, ...newState, channelId };
    setState(fullNewState as PlaybackState);
    
    await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId, state: fullNewState }),
    });
  };

  const getAdjustedTime = () => Date.now() + clockOffset;

  return { state, updateRemoteState, getAdjustedTime, clockOffset };
}
