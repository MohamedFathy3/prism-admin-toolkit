// components/magicui/animated-dots-background.tsx
"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface AnimatedDotsBackgroundProps {
  numDots?: number;
  speed?: number;
  dotSize?: number;
  className?: string;
}

export const AnimatedDotsBackground = ({
  numDots = 80,
  speed = 0.5,
  dotSize = 1.5,
  className = "",
}: AnimatedDotsBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Get dot color based on theme
    const getDotColor = () => {
      return theme === 'dark' 
        ? 'hsla(0, 0%, 100%, 0.15)'  // أبيض شفاف في Dark mode
        : 'hsla(220, 13%, 18%, 0.1)'; // رمادي شفاف في Light mode
    };

    // Create dots
    const dots = Array.from({ length: numDots }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: dotSize + Math.random() * dotSize,
    }));

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const currentDotColor = getDotColor();

      // Update and draw dots
      dots.forEach((dot) => {
        // Move dot
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Bounce off edges
        if (dot.x <= 0 || dot.x >= canvas.width) dot.vx *= -1;
        if (dot.y <= 0 || dot.y >= canvas.height) dot.vy *= -1;

        // Keep within bounds
        dot.x = Math.max(0, Math.min(canvas.width, dot.x));
        dot.y = Math.max(0, Math.min(canvas.height, dot.y));

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = currentDotColor;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [numDots, speed, dotSize, theme]); // إضافة theme ك dependency

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};