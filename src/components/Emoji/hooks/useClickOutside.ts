import { useEffect, type RefObject } from 'react';

/**
 * Hook to detect clicks outside of specified element(s)
 */
export function useClickOutside(
  refs: RefObject<HTMLElement> | RefObject<HTMLElement>[],
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const refArray = Array.isArray(refs) ? refs : [refs];

      // Check if click is inside any of the refs
      const isInside = refArray.some((ref) => {
        return ref.current && ref.current.contains(event.target as Node);
      });

      if (!isInside) {
        handler();
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, handler]);
}
