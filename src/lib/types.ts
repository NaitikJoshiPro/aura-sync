export interface PlaybackState {
  channelId: string;
  currentTrack: string | null;
  isPlaying: boolean;
  startTime: number; // Server timestamp when playback started
  pauseOffset: number; // Position in seconds when paused
  version: number;
}

export interface SyncResponse {
  serverTime: number;
}

export interface Song {
  name: string;
  url: string;
  duration?: number;
}
