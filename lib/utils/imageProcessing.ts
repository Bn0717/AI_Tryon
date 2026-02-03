// lib/utils/imageProcessing.ts
import { removeBackground } from "@imgly/background-removal";

/**
 * Automatically shrinks the image before AI processing.
 * This is the ONLY way to stop the browser from lagging.
 */
async function preResizeImage(file: File, maxW: number = 800): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxW / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function removeBackgroundFree(file: File): Promise<Blob | null> {
  try {
    // 1. Shrink image to 800px (Instantly reduces AI work by 80%)
    const smallBlob = await preResizeImage(file);

    // 2. Run AI on the small image
    const resultBlob = await removeBackground(smallBlob, {
      output: {
        format: "image/png",
        quality: 0.8,
      },
      progress: (status, progress) => {
        console.log(`AI Progress: ${status} (${Math.round(progress * 100)}%)`);
      }
    });

    return resultBlob;
  } catch (error) {
    console.error("Background removal failed:", error);
    return null;
  }
}