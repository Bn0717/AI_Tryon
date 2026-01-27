'use client';

import React, { useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, OrbitControls, useAnimations, Html, Stage, Center } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  photoUrl: string | null;
  measurements: {
    height: number;
    chest: number;
    waist: number;
    shoulder: number;
  };
}

function Avatar({ photoUrl, measurements }: Props) {
  const { scene, animations } = useGLTF('/models/mannequin.glb');
  const { actions } = useAnimations(animations, scene);
  
  // 1. Force the texture to update by using the photoUrl as a key
  const texture = useTexture(photoUrl || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png');
  
  // Optimization: Make the texture look better
  useMemo(() => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  const bones = useMemo(() => {
    const b: any = {};
    if (!scene) return b;
    scene.traverse((obj) => {
      if (obj instanceof THREE.Bone) {
        const name = obj.name.toLowerCase();
        if (name.includes('pelvis') || name.includes('hips')) b.hips = obj;
        if (name === 'spine_01' || (name.includes('spine') && !name.includes('02'))) b.waist = obj;
        if (name.includes('spine_02') || name.includes('spine1')) b.chest = obj;
        if (name.includes('shoulder') || name.includes('upperarm')) {
            if (name.includes('_l') || name.includes('left')) b.lSh = obj;
            if (name.includes('_r') || name.includes('right')) b.rSh = obj;
        }
      }
    });
    return b;
  }, [scene]);

  // 2. APPLY COLORS AND FACE (This now triggers whenever the photoUrl/texture changes)
  useEffect(() => {
    if (!scene) return;

    // A much lighter, cleaner skin tone (Professional Mannequin Look)
    const skinMaterial = new THREE.MeshStandardMaterial({
        color: '#FFE0BD', 
        roughness: 0.4,
        metalness: 0.1,
    });

    const faceMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.5,
    });

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        // Check if the part is the head
        if (name.includes('head') || name.includes('face')) {
          mesh.material = faceMaterial;
          const material = mesh.material as THREE.MeshStandardMaterial;
          if (material.map) {
              // Adjust these numbers if the face looks too small/big
              material.map.repeat.set(1.4, 1.4); 
              material.map.offset.set(-0.2, -0.2);
          }
        } else {
          mesh.material = skinMaterial;
        }
      }
    });
  }, [scene, texture, photoUrl]); // RELOADS WHEN PHOTO CHANGES

  useEffect(() => {
    if (actions && animations.length > 0) {
      const first = actions[animations[0].name];
      if (first) first.reset().fadeIn(0.5).play();
    }
  }, [actions, animations]);

  useFrame(() => {
    const { height, waist, chest, shoulder } = measurements;
    if (bones.hips) bones.hips.scale.setScalar((height || 170) / 170);
    if (bones.waist) {
      const wScale = 0.8 + (((waist || 80) - 60) / 60) * 0.8;
      bones.waist.scale.x = bones.waist.scale.z = wScale;
    }
    if (bones.chest) {
      const cScale = 0.8 + (((chest || 95) - 80) / 60) * 0.7;
      bones.chest.scale.x = bones.chest.scale.z = cScale;
    }
    if (bones.lSh && bones.rSh) {
      const sScale = 0.7 + (((shoulder || 45) - 35) / 25) * 0.6;
      bones.lSh.scale.x = bones.rSh.scale.x = sScale;
    }
  });

  return <primitive object={scene} />;
}

export default function User3DModel(props: Props) {
  return (
    <div className="w-full h-[600px] bg-slate-50 rounded-2xl border-2 border-[#FFDBD1] overflow-hidden relative">
      <Canvas camera={{ position: [0, 1, 5], fov: 35 }} shadows>
        {/* BETTER LIGHTING SYSTEM */}
        <ambientLight intensity={1.5} /> {/* High ambient light for overall brightness */}
        <pointLight position={[5, 5, 5]} intensity={2} />
        <spotLight position={[0, 5, 10]} angle={0.15} penumbra={1} intensity={2} />
        
        <React.Suspense fallback={<Html center><div>Loading Avatar...</div></Html>}>
          <Stage environment="city" intensity={0.5} adjustCamera={true}>
            <Center top>
              <Avatar {...props} />
            </Center>
          </Stage>
        </React.Suspense>
        
        <OrbitControls enablePan={true} makeDefault />
      </Canvas>

      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-white/90 p-2 rounded border border-[#FFDBD1] shadow-sm">
            <p className="text-[10px] font-bold text-navy-800">3D SYNC ACTIVE</p>
            <p className="text-[10px] opacity-60 text-navy-800">New photo detected: {props.photoUrl ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}