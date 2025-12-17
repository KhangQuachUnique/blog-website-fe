import { useEffect } from "react";

export function useClickOutside(
  refs: Array<React.RefObject<HTMLElement | null>>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      const isInside = refs.some(
        (ref) => ref.current && ref.current.contains(target)
      );

      if (!isInside) {
        handler();
      }
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [refs, handler]);
}
