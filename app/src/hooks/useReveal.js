import { useEffect } from 'react';

/**
 * Triggers `.is-visible` on all `.reveal` elements when they scroll into view.
 * Mirrors the behavior of the original BSN HTML.
 *
 * Call this once per page that uses `.reveal`.
 */
export function useReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: just show everything
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const els = document.querySelectorAll('.reveal:not(.is-visible)');
    els.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);
}
