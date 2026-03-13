'use client';

import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface DeviceNodeProps {
  type: 'mac' | 'iphone' | 'generic';
  status: 'online' | 'synced';
  name: string;
}

export default function ConnectedDevices() {
  // Mock data for demo. In a real app, this would come from Pusher Presence.
  const devices: DeviceNodeProps[] = [
    { type: 'mac', status: 'synced', name: 'Mac Studio' },
    { type: 'iphone', status: 'synced', name: 'iPhone 15' },
  ];

  return (
    <div className="flex gap-6 mt-8">
      {devices.map((device, i) => (
        <div key={i} className="flex flex-col items-center gap-2 group">
          <div className={`relative w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:scale-110 group-hover:border-mint/50 ${device.status === 'synced' ? 'mint-glow' : ''}`}>
             {device.type === 'mac' ? <Monitor size={20} /> : <Smartphone size={20} />}
             <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${device.status === 'synced' ? 'bg-mint' : 'bg-white/20'}`}></div>
          </div>
          <span className="text-[8px] uppercase tracking-widest text-white/40">{device.name}</span>
        </div>
      ))}
    </div>
  );
}
