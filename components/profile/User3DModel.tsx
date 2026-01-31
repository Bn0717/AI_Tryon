'use client';

import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, useAnimations, Html, Stage, Center, Environment } from '@react-three/drei';

interface Props {
  avatarUrl?: string | null;
  measurements: { height: number; chest: number; waist: number; shoulder: number; };
}

function Avatar({ avatarUrl }: { avatarUrl: string | null }) {
  // 1. Load the Model (Avaturn URL or a high-quality fallback)
  const { scene, animations } = useGLTF(avatarUrl || 'https://models.readyplayer.me/658409028886364f9f7435f3.glb');
  const { actions, names } = useAnimations(animations, scene);

  // 2. Play the Avaturn Animation
  useEffect(() => {
    if (actions && names.length > 0) {
      // Plays the first animation found in the file (usually the Idle/Stance)
      actions[names[0]]?.reset().fadeIn(0.5).play();
    }
  }, [actions, names]);

  return <primitive object={scene} />;
}

export default function User3DModel(props: Props) {
  return (
    <div className="w-full h-[600px] bg-[#fcfaf7] rounded-3xl border-2 border-[#FFDBD1] overflow-hidden relative shadow-2xl">
      <Canvas shadows camera={{ position: [0, 1, 4], fov: 35 }}>
        {/* Balanced Studio Lighting */}
        <ambientLight intensity={1.5} />
        <spotLight position={[5, 10, 5]} intensity={1} castShadow />
        <Environment preset="city" />

        <React.Suspense fallback={<Html center><div className="text-navy-400 font-bold animate-pulse">LOADING...</div></Html>}>
          {/* 
            STAGE is the best way to keep it centered.
            adjustCamera={1.8} zooms out so the head and feet aren't cut.
            center={true} forces the model to the absolute middle.
          */}
          <Stage environment="city" intensity={0.5} adjustCamera={1.8} center>
             <Avatar key={props.avatarUrl} avatarUrl={props.avatarUrl || null} />
          </Stage>
        </React.Suspense>
        
        <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 3} 
            maxPolarAngle={Math.PI / 1.7}
            makeDefault 
        />
      </Canvas>

      {/* Analytics Badge - Keeps the professional look */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-[#FFDBD1] shadow-sm">
            <p className="text-[10px] font-black text-[#0B1957] uppercase tracking-widest">3D Reality Engine</p>
            <div className="flex items-center gap-1.5 mt-1">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[8px] font-bold text-gray-500 uppercase">Live Preview</span>
            </div>
        </div>
      </div>
    </div>
  );
}