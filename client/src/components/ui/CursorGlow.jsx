import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const move = (e) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
      }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed z-0 w-[400px] h-[400px] rounded-full opacity-[0.06] transition-transform duration-300 ease-out"
      style={{
        background: 'radial-gradient(circle, #f97316 0%, transparent 70%)',
        top: 0,
        left: 0,
      }}
    />
  );
}
