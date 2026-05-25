'use client';

import { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';

export default function HorizontalScroller({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      el!.scrollLeft += e.deltaY + e.deltaX;
    }

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        gap: 1.5,
        overflowX: 'auto',
        pb: 1,
        cursor: 'grab',
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 },
      }}
    >
      {children}
    </Box>
  );
}
