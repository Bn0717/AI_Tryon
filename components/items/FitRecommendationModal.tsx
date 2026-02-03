'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { ClothingItem } from '@/lib/types/clothing';
import type { ParametricAvatar } from '@/lib/types/avatar';

const colors = {
  cream: '#F8F3EA',
  navy: '#0B1957',
  peach: '#FFDBD1',
  red: '#ef4444',
  green: '#10b981',
  blue: '#3b82f6',
  orange: '#f59e0b'
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ClothingItem;
  userProfile: ParametricAvatar | null;
}

export default function FitRecommendationModal({ isOpen, onClose, item, userProfile }: Props) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const [fitStatus, setFitStatus] = useState<any>({ chest: {}, waist: {} });

  // 1. Select middle size by default when opening
  useEffect(() => {
    if (isOpen && item.sizeChart.length > 0) {
      const midIndex = Math.floor(item.sizeChart.length / 2);
      setSelectedSize(item.sizeChart[midIndex].size);
    }
  }, [isOpen, item]);

  // 2. THE VISUAL ENGINE (Canvas)
  useEffect(() => {
    if (!isOpen || !userProfile || !selectedSize || !item.imageUrl) return;

    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 650;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bodyImg = new Image();
    const shirtImg = new Image();
    
    // Use Avatar Snapshot (or uploaded photo) as base
    bodyImg.src = userProfile.photoUrl || '/models/2d-silhouette.png';
    shirtImg.src = item.imageUrl;
    
    bodyImg.crossOrigin = "Anonymous";
    shirtImg.crossOrigin = "Anonymous";

    const sizeData = item.sizeChart.find(s => s.size === selectedSize);
    if (!sizeData) return;

    // --- FIT MATH ---
    // Calculate Ratios
    const chestRatio = sizeData.chest / userProfile.chest; // e.g., 1.1 (Loose) or 0.9 (Tight)
    const waistRatio = (sizeData.waist || sizeData.chest * 0.9) / userProfile.waist;

    // Determine Status Labels
    const getLabel = (ratio: number) => {
        if (ratio < 0.96) return { text: 'Tight', color: colors.red };
        if (ratio > 1.15) return { text: 'Loose', color: colors.orange };
        return { text: 'Just Right', color: colors.green };
    };

    setFitStatus({
        chest: getLabel(chestRatio),
        waist: getLabel(waistRatio)
    });

    Promise.all([
        new Promise(r => bodyImg.onload = r),
        new Promise(r => shirtImg.onload = r)
    ]).then(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // A. DRAW BODY
        // We scale the body to fill the canvas height (leaving padding)
        const padding = 50;
        const availHeight = canvas.height - (padding * 2);
        const scaleFactor = availHeight / userProfile.height; // Pixels per CM based on height
        
        const bodyW = (bodyImg.width / bodyImg.height) * availHeight;
        const bodyX = (canvas.width - bodyW) / 2;
        
        ctx.drawImage(bodyImg, bodyX, padding, bodyW, availHeight);

        // B. DRAW SHIRT (The Physics Simulation)
        // We calculate shirt width based on REAL CM measurements converted to pixels
        const cmToPx = bodyW / (userProfile.chest * 0.45); // Approximate frontal width ratio
        
        let shirtW = sizeData.chest * 0.45 * cmToPx; // Convert Shirt CM to Pixels
        const shirtH = shirtW * (shirtImg.height / shirtImg.width);

        // Center shirt horizontally on body
        const shirtX = (canvas.width - shirtW) / 2;
        
        // Estimate shoulder height (approx 15% down from top of body)
        const shoulderY = padding + (availHeight * 0.16); 

        // --- DRAWING LOGIC ---
        ctx.save();
        
        if (chestRatio < 0.96) {
            // TIGHT MODE: Draw shirt slightly smaller + Red Overlay
            ctx.drawImage(shirtImg, shirtX, shoulderY, shirtW, shirtH);
            
            // Heatmap Overlay (Source-Atop to only color the shirt)
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'rgba(255, 0, 0, 0.25)'; // Red Tint
            ctx.fillRect(shirtX, shoulderY + (shirtH * 0.3), shirtW, shirtH * 0.4); // Highlight chest area
            
        } else if (chestRatio > 1.15) {
            // LOOSE MODE: Draw shirt wider
            // We widen it slightly more to simulate "hanging"
            const drapeW = shirtW * 1.05; 
            const drapeX = (canvas.width - drapeW) / 2;
            
            ctx.drawImage(shirtImg, drapeX, shoulderY, drapeW, shirtH);
            
        } else {
            // PERFECT FIT
            ctx.drawImage(shirtImg, shirtX, shoulderY, shirtW, shirtH);
        }
        
        ctx.restore();

        // C. DRAW "STYLE.ME" HUD LINES
        const drawLine = (yPos: number, label: string, status: any) => {
            ctx.beginPath();
            ctx.moveTo(40, yPos);
            ctx.lineTo(410, yPos);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.stroke();

            // Draw Label Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.roundRect(40, yPos - 22, 50, 18, 4);
            ctx.roundRect(320, yPos - 22, 90, 18, 4);
            ctx.fill();

            // Draw Text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText(label, 48, yPos - 9);
            
            ctx.fillStyle = status.color;
            ctx.fillText(status.text, 330, yPos - 9);
        };

        drawLine(shoulderY + (shirtH * 0.35), "CHEST", getLabel(chestRatio));
        drawLine(shoulderY + (shirtH * 0.8), "WAIST", getLabel(waistRatio));

        setPreview(canvas.toDataURL());
    });

  }, [isOpen, selectedSize, userProfile, item]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden">
        
        {/* LEFT: VISUALIZER */}
        <div className="w-2/3 bg-gray-900 relative flex items-center justify-center p-4">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                 <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border border-white/20">
                    Smart Mirror v2.0
                 </span>
            </div>

            {preview ? (
                <img src={preview} alt="Virtual Try On" className="h-full object-contain rounded-lg shadow-2xl" />
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-400 font-bold text-sm">ANALYZING FIT...</span>
                </div>
            )}
        </div>

        {/* RIGHT: CONTROLS */}
        <div className="w-1/3 bg-white flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.brand}</p>
                        <h2 className="text-2xl font-black text-[#0B1957] leading-tight">{item.name}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* Analysis Results */}
            <div className="p-6 flex-1 overflow-y-auto">
                <div className="bg-[#F8F3EA] rounded-xl p-4 border-2 border-[#FFDBD1] mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">FIT STATUS</p>
                    <div className="flex items-center gap-3">
                         <div className={`w-3 h-3 rounded-full ${fitStatus.chest.text === 'Just Right' ? 'bg-green-500' : 'bg-red-500'}`} />
                         <span className="text-2xl font-black text-[#0B1957]">{fitStatus.chest.text}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        {fitStatus.chest.text === 'Tight' 
                            ? 'This size is restrictive around the chest area. We recommend sizing up for comfort.' 
                            : fitStatus.chest.text === 'Loose'
                            ? 'This gives an oversized look. If you prefer a regular fit, size down.'
                            : 'Measurements align perfectly with your body profile.'}
                    </p>
                </div>

                {/* Size Selector */}
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">SELECT SIZE</p>
                    <div className="grid grid-cols-4 gap-2">
                        {item.sizeChart.map((s) => (
                            <button
                                key={s.size}
                                onClick={() => setSelectedSize(s.size)}
                                className={`py-3 rounded-lg font-bold text-sm transition-all ${
                                    selectedSize === s.size 
                                    ? 'bg-[#0B1957] text-white shadow-lg scale-105' 
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {s.size}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
                 <button 
                    onClick={onClose}
                    className="w-full py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all"
                    style={{ backgroundColor: colors.navy }}
                 >
                    Add to Outfit
                 </button>
            </div>
        </div>

      </div>
    </div>
  );
}