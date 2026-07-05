import { useEffect, useRef } from 'react';

const NOTE_DENOMS = [50, 100, 200, 500, 1000] as const;

interface Note {
  x: number;
  y: number;
  speed: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  swingAmp: number;
  swingFreq: number;
  img: HTMLImageElement;
}

export function useKenyanNotes(count = 28) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const notesRef = useRef<Note[]>([]);
  const rafRef = useRef(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
    };
    const handleTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = t.clientX - r.left;
      mouseRef.current.y = t.clientY - r.top;
    };
    const handleLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('mouseleave', handleLeave);

    const images = NOTE_DENOMS.map((val) => {
      const img = new Image();
      img.src = `/images/note-${val}.png`;
      return img;
    });
    imagesRef.current = images;

    const allLoaded = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const notes: Note[] = [];
      for (let i = 0; i < count; i++) {
        notes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          speed: 0.3 + Math.random() * 0.9,
          size: 80 + Math.random() * 80,
          rotation: Math.random() * 360,
          rotationSpeed: (-0.4 + Math.random()) * 0.5,
          swingAmp: 0.5 + Math.random() * 1.5,
          swingFreq: 0.005 + Math.random() * 0.01,
          img: images[Math.floor(Math.random() * images.length)],
        });
      }
      notesRef.current = notes;

      const animate = () => {
        const cw = canvas.offsetWidth;
        const ch = canvas.offsetHeight;
        ctx.clearRect(0, 0, cw, ch);

        for (const n of notes) {
          n.y += n.speed;
          n.rotation += n.rotationSpeed;
          n.x += Math.sin(n.y * n.swingFreq) * n.swingAmp;

          const dx = n.x - mouseRef.current.x;
          const dy = n.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 && dist > 0) {
            n.x += (dx / dist) * 2;
            n.y += (dy / dist) * 2;
          }

          if (n.y > ch + 120) {
            n.y = -80 - Math.random() * 40;
            n.x = Math.random() * cw;
            n.img = images[Math.floor(Math.random() * images.length)];
            n.size = 80 + Math.random() * 80;
            n.speed = 0.3 + Math.random() * 0.9;
          }

          const aspect = 2;
          const w2 = n.size;
          const h2 = n.size / aspect;

          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.rotate((n.rotation * Math.PI) / 180);
          ctx.drawImage(n.img, -w2 / 2, -h2 / 2, w2, h2);
          ctx.restore();
        }

        rafRef.current = requestAnimationFrame(animate);
      };

      animate();
    };

    if (images.every((i) => i.complete && i.naturalWidth > 0)) {
      allLoaded();
    } else {
      let loaded = 0;
      for (const img of images) {
        img.onload = () => {
          loaded++;
          if (loaded === images.length) allLoaded();
        };
        img.onerror = () => {
          loaded++;
          if (loaded === images.length) allLoaded();
        };
      }
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('touchmove', handleTouch);
      canvas.removeEventListener('mouseleave', handleLeave);
    };
  }, [count]);

  return canvasRef;
}
