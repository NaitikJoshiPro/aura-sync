import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Song } from '@/lib/types';

export async function GET() {
  const songsDir = path.join(process.cwd(), 'public/songs');
  
  try {
    const files = fs.readdirSync(songsDir);
    const songs: Song[] = files
      .filter(file => file.endsWith('.mp3'))
      .map(file => ({
        name: file.replace('.mp3', ''),
        url: `/songs/${encodeURIComponent(file)}`,
      }));
    
    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error reading songs:', error);
    return NextResponse.json([]);
  }
}
