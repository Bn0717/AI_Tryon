// components/profile/AvaturnCreator.tsx
'use client';
import { useEffect, useRef } from 'react';

export default function AvaturnCreator({ onAvatarExported, onClose }: any) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const iframe = document.createElement('iframe');
    iframe.src = "https://fitcheckk.avaturn.dev"; // Use your .dev link
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.allow = "camera *; microphone *; clipboard-write";
    container.appendChild(iframe);

    const handleMessage = (event: MessageEvent) => {
      // 1. Log everything so you can see it in console
      console.log("Avaturn Message Received:", event.data);

      let data = event.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) { return; }
      }

      // 2. CHECK FOR THE EXPORT EVENT
      if (data?.source === 'avaturn' && data?.eventName === 'v2.avatar.exported') {
        const url = data.data.url;
        console.log("SUCCESS! URL IS:", url);
        onAvatarExported(url); // This triggers the save in ProfilePage
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAvatarExported]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="relative w-full h-full md:w-[95%] md:h-[95%] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <button onClick={onClose} className="absolute top-6 right-6 z-[110] bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-xl">✕</button>
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}