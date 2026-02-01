//Components/profile/User3DModel.tsx//

'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Canvas, useFrame, useGraph } from '@react-three/fiber';
import { useGLTF, OrbitControls, useAnimations, Html, Environment, Stage, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  avatarUrl?: string | null;
  measurements: { height: number; chest: number; waist: number; shoulder: number; };
  selectedAnimation?: string | null;
  onAnimationChange?: (animationName: string) => void;
}

function Avatar({ avatarUrl, selectedAnimation, measurements, onLoadAnimations }: any) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(avatarUrl) as any;
  const scene = (gltf as any).scene || (Array.isArray(gltf) ? gltf[0].scene : null);
  const { animations: rawAnims } = useGLTF('/animations/merged-mixamo-animations.glb');
  const { nodes } = useGraph(scene);

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

  // --- NATURAL BODY SCALING LOGIC ---
  useFrame(() => {
    if (!scene) return;

    const findBone = (name: string) => nodes[name] || nodes[`mixamorig${name}`] || scene.getObjectByName(name);
    
    const hips = findBone('Hips');
    const spine = findBone('Spine');   
    const spine1 = findBone('Spine1'); 
    const spine2 = findBone('Spine2'); 
    const neck = findBone('Neck');
    const head = findBone('Head');
    const arms = [findBone('LeftArm'), findBone('RightArm')];

    // Standard Averages
    const BASE_H = 175, BASE_W = 80, BASE_C = 95, BASE_S = 45;

    // Current Ratios
    const hRatio = (measurements.height || BASE_H) / BASE_H;
    const wRatio = (measurements.waist || BASE_W) / BASE_W;
    const cRatio = (measurements.chest || BASE_C) / BASE_C;
    const sRatio = (measurements.shoulder || BASE_S) / BASE_S;

    // 1. HEIGHT (Global)
    scene.scale.setScalar(hRatio);
    if (hips) hips.position.set(0, 0, 0);

    /**
     * DISTRIBUTED SCALING (Natural Rounding)
     * To avoid the "Triangle/Vertex" look, we distribute the waist and chest 
     * across multiple bones so the transition is smooth.
     */
    
    // A. HIPS (Bases of the belly/waist)
    // Hips take 30% of the waist expansion to broaden the lower torso naturally
    const hipsGirth = 1 + (wRatio - 1) * 0.3;
    if (hips) {
      hips.scale.x = hipsGirth;
      hips.scale.z = hipsGirth;
    }

    // B. SPINE (The main waist)
    // Neutralize hipsGirth and apply the remaining waist expansion
    if (spine) {
      spine.scale.x = wRatio / hipsGirth;
      spine.scale.z = wRatio / hipsGirth;
    }

    // C. SPINE1 & SPINE2 (The Chest)
    // We smooth the chest between Spine1 and Spine2
    const chestGirth = cRatio;
    if (spine1) {
      // Transition from waist to chest girth
      const midGirth = (wRatio + chestGirth) / 2;
      spine1.scale.x = midGirth / wRatio;
      spine1.scale.z = midGirth / wRatio;
    }

    if (spine2) {
      const chestInPlace = chestGirth / ((wRatio + chestGirth) / 2);
      // Apply Shoulder Width (X only) while maintaining chest depth (Z)
      spine2.scale.x = (sRatio / chestGirth) * chestInPlace;
      spine2.scale.z = chestInPlace;
    }

    // 2. INVERSE SCALING (Protects extremities from "bloating")
    // Total accumulated scale from Hips -> Spine -> Spine1 -> Spine2
    const totalTorsoX = hipsGirth * (wRatio / hipsGirth) * (spine1 ? spine1.scale.x : 1) * (spine2 ? spine2.scale.x : 1);
    const totalTorsoZ = hipsGirth * (wRatio / hipsGirth) * (spine1 ? spine1.scale.z : 1) * (spine2 ? spine2.scale.z : 1);

    if (neck) {
      neck.scale.x = 1 / totalTorsoX;
      neck.scale.z = 1 / totalTorsoZ;
    }
    if (head) {
        head.scale.x = head.scale.z = 1; 
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
      <div className="w-full h-[650px] relative">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 35 }}>
          <ambientLight intensity={1.5} />
          <Environment preset="city" />
          
          <React.Suspense fallback={<Html center>Building Reality...</Html>}>
             <Stage 
                adjustCamera={1.8} 
                intensity={0.5} 
                environment="city" 
                center={{ position: [0, 0, 0] }}
             >
                <Avatar {...props} onLoadAnimations={handleAnimationsLoaded} />
             </Stage>
             <ContactShadows opacity={0.4} scale={10} blur={2.5} far={20} resolution={256} color="#000000" />
          </React.Suspense>
          
          <OrbitControls enablePan={false} minDistance={1} maxDistance={5} makeDefault />
        </Canvas>
      </div>

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