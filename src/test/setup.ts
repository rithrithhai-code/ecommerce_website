/**
 * Minimal IntersectionObserver for jsdom, which does not implement one. Framer Motion's
 * `whileInView` needs it, and every callback reports the target as visible so revealed
 * content is really exercised rather than skipped.
 *
 * This only exists for the test environment — `src/components/ui/Reveal.tsx` separately
 * guards the same absence in old browsers.
 */
class TestIntersectionObserver {
  private readonly callback: (entries: unknown[], observer: unknown) => void;

  constructor(
    callback: (entries: unknown[], observer: unknown) => void,
    _options?: unknown,
  ) {
    this.callback = callback;
  }

  observe(target: Element) {
    queueMicrotask(() => {
      this.callback(
        [{ isIntersecting: true, intersectionRatio: 1, target, boundingClientRect: {}, boundaryRect: {}, rootBounds: null, time: 0 }],
        this,
      );
    });
  }

  unobserve() {}

  disconnect() {}

  takeRecords() {
    return [];
  }
}

globalThis.IntersectionObserver =
  TestIntersectionObserver as unknown as typeof globalThis.IntersectionObserver;
