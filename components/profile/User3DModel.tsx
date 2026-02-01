'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Canvas, useFrame, useGraph } from '@react-three/fiber';
import { useGLTF, OrbitControls, useAnimations, Html, Environment, Stage, Center } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  avatarUrl?: string | null;
  measurements: { height: number; chest: number; waist: number; shoulder: number; };
  selectedAnimation?: string | null;
  onAnimationChange?: (animationName: string) => void;
}

function Avatar({ avatarUrl, selectedAnimation, measurements, onLoadAnimations }: any) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(avatarUrl);
  const { animations: rawAnims } = useGLTF('/animations/merged-mixamo-animations.glb');
  const { nodes } = useGraph(scene);

  // 1. CLEAN ANIMATIONS (Stay in place)
  const retargetedAnimations = useMemo(() => {
    if (!rawAnims || rawAnims.length === 0) return [];
    return rawAnims.map((clip) => {
      const newClip = clip.clone();
      newClip.tracks = newClip.tracks.filter((track) => {
        track.name = track.name.replace(/^mixamorig:/, '').replace(/^mixamorig/, '');
        if (track.name.endsWith('.position')) return false;
        return true;
      });
      return newClip;
    });
  }, [rawAnims]);

  useEffect(() => {
    if (retargetedAnimations.length > 0 && onLoadAnimations) {
      onLoadAnimations(retargetedAnimations.map(c => c.name));
    }
  }, [retargetedAnimations, onLoadAnimations]);

  const { actions } = useAnimations(retargetedAnimations, group);
  const currentAction = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    if (!actions) return;
    const actionName = selectedAnimation || retargetedAnimations[0]?.name;
    const newAction = actions[actionName];
    if (!newAction || newAction === currentAction.current) return;
    if (currentAction.current) currentAction.current.fadeOut(0.3);
    newAction.reset().fadeIn(0.3).play();
    currentAction.current = newAction;
  }, [selectedAnimation, actions, retargetedAnimations]);

  // 2. REALISTIC PROPORTIONAL SCALING
  useFrame(() => {
    if (!scene) return;

    const findBone = (name: string) => nodes[name] || nodes[`mixamorig${name}`] || scene.getObjectByName(name);
    
    // Bone Chain
    const hips = findBone('Hips');
    const spine = findBone('Spine');   // Waist
    const spine1 = findBone('Spine1'); // Chest
    const spine2 = findBone('Spine2'); // Upper Shoulders
    const neck = findBone('Neck');
    const head = findBone('Head');
    const arms = [findBone('LeftArm'), findBone('RightArm')];

    // Clamping to prevent extreme distortion from accidental inputs (e.g., 02)
    const h = Math.max(100, measurements.height || 175);
    const w = Math.max(40, measurements.waist || 80);
    const c = Math.max(50, measurements.chest || 95);
    const s = Math.max(25, measurements.shoulder || 45);

    // 1. HEIGHT (Global)
    scene.scale.setScalar(h / 175);

    // 2. WAIST (Width/Depth)
    const waistScale = w / 80;
    if (spine) {
      spine.scale.x = waistScale;
      spine.scale.z = waistScale;
    }

    // 3. CHEST (Neutralizing parent waist)
    const chestScale = c / 95;
    if (spine1) {
      spine1.scale.x = chestScale / waistScale;
      spine1.scale.z = chestScale / waistScale;
    }

    // 4. SHOULDERS (Neutralizing waist/chest)
    const shoulderScale = s / 45;
    if (spine2) {
      spine2.scale.x = shoulderScale / (chestScale / waistScale * waistScale);
    }

    // 5. THE FIX: Protect Extremities (Head & Arms)
    // We must invert the accumulated scale of the entire torso chain
    const totalTorsoX = waistScale * (chestScale / waistScale) * (spine2 ? spine2.scale.x : 1);
    const totalTorsoZ = waistScale * (chestScale / waistScale);

    if (neck) {
      neck.scale.x = 1 / totalTorsoX;
      neck.scale.z = 1 / totalTorsoZ;
    }
    if (head) {
        head.scale.x = head.scale.z = 1; // Double lock head
    }
    arms.forEach(arm => {
      if (arm) {
        arm.scale.x = 1 / totalTorsoX;
        arm.scale.z = 1 / totalTorsoZ;
      }
    });
  });

  return (
    <group ref={group} dispose={null}>
        <primitive object={scene} frustumCulled={false} />
    </group>
  );
}

export default function User3DModel(props: Props) {
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);

  const handleAnimationsLoaded = useCallback((names: string[]) => {
    setAvailableAnimations((prev) => JSON.stringify(prev) === JSON.stringify(names) ? prev : names);
  }, []);

  if (!props.avatarUrl) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center border-2 border-dashed border-[#FFDBD1] rounded-3xl opacity-30">
        <p className="text-[#0B1957] font-bold">Please create your avatar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* 3D CANVAS - PERFECTLY CENTERED */}
      <div className="w-full h-[650px] relative">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 35 }}>
          <ambientLight intensity={1.5} />
          <Environment preset="city" />
          
          <React.Suspense fallback={<Html center>Loading Digital Twin...</Html>}>
            {/* 
               STAGE: This is the secret. 
               - adjustCamera={1.8} will move the camera to fit the model's head and feet.
               - center: true makes sure it's at the canvas center (5,5).
            */}
             <Stage 
                adjustCamera={1.8} 
                intensity={0.5} 
                environment="city" 
                center={{ position: [0, 0, 0] }}
                contactShadow={true}
             >
                <Avatar {...props} onLoadAnimations={handleAnimationsLoaded} />
             </Stage>
          </React.Suspense>
          
          <OrbitControls 
            enablePan={false} 
            minDistance={1} 
            maxDistance={5} 
            makeDefault
          />
        </Canvas>
      </div>

      {/* SELECTION BOX (CLEAN GRID) */}
      {availableAnimations.length > 0 && (
        <div className="p-6 bg-white rounded-3xl border-2 border-[#FFDBD1] shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Select Pose</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableAnimations.map((name) => (
              <button
                key={name}
                onClick={() => props.onAnimationChange?.(name)}
                className={`px-4 py-3 text-[10px] font-bold rounded-2xl transition-all border-2 ${
                  props.selectedAnimation === name 
                  ? 'bg-[#0B1957] text-white border-[#0B1957] shadow-lg' 
                  : 'bg-[#F8F3EA] text-[#0B1957] border-transparent hover:border-[#FFDBD1]'
                }`}
              >
                {name.replace(/_/g, ' ').split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

useGLTF.preload('/animations/merged-mixamo-animations.glb');