import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import { PlaybackState } from '@/lib/types';

// In-memory state for demo purposes. 
// Note: In a real Vercel deployment, you'd use KV or Redis because serverless functions are stateless.
// For this challenge, we'll use a global variable which might persist across some requests in the same execution context.
let globalState: Record<string, PlaybackState> = {};

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channelId') || 'default';
  
  const state = globalState[channelId] || {
    channelId,
    currentTrack: null,
    isPlaying: false,
    startTime: 0,
    pauseOffset: 0,
    version: 0,
  };
  
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { channelId, state } = body;
  
  globalState[channelId] = {
    ...state,
    version: (globalState[channelId]?.version || 0) + 1,
  };
  
  // Trigger pusher event
  try {
    await pusher.trigger(`channel-${channelId}`, 'playback-update', globalState[channelId]);
  } catch (error) {
    console.error('Pusher trigger error:', error);
  }
  
  return NextResponse.json(globalState[channelId]);
}
