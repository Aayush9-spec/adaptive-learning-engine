'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function DotGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const options = {
      grid: [13, 13],
      from: 'center',
    };

    const timeline = gsap.timeline({ repeat: -1, yoyo: true });
    
    timeline.add(
      gsap.to('.dot', {
        scale: gsap.utils.wrap([1.1, 0.75]),
        ease: 'power2.inOut',
        stagger: {
          amount: 0.8,
          grid: options.grid,
          from: options.from,
        },
        duration: 1.5,
      })
    );

    return () => {
      timeline.kill();
    };
  }, []);

  // Generate 13x13 grid of dots
  const dots = Array.from({ length: 13 * 13 }, (_, i) => i);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden opacity-20"
      style={{ zIndex: 0 }}
    >
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(13, 1fr)',
          gridTemplateRows: 'repeat(13, 1fr)',
          gap: '2rem',
          width: '90vw',
          height: '90vh',
        }}
      >
        {dots.map((i) => (
          <div
            key={i}
            className="dot"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'white',
              margin: 'auto',
            }}
          />
        ))}
      </div>
    </div>
  );
}
