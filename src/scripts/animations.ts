export interface AnimationConfig {
  threshold: number;
  rootMargin: string;
  playOnce: boolean;
}

const defaultConfig: AnimationConfig = {
  threshold: 0.5,
  rootMargin: '0px',
  playOnce: true,
};

const STAGGER_CHILDREN_SELECTOR = ':scope > *';

const observers: Map<string, IntersectionObserver> = new Map();

const MOBILE_BREAKPOINT = '(max-width: 768px)';

function getEffectiveDelay(element: HTMLElement): number {
  const delay = parseInt(element.getAttribute('data-animation-delay') || '0', 10);
  const isMobile = window.matchMedia(MOBILE_BREAKPOINT).matches;
  if (!isMobile || delay === 0) return delay;
  return Math.round(delay * 0.5);
}

function getEffectiveStagger(element: HTMLElement): number {
  const stagger = parseInt(element.getAttribute('data-animation-stagger') || '0', 10);
  const isMobile = window.matchMedia(MOBILE_BREAKPOINT).matches;
  if (!isMobile || stagger === 0) return stagger;
  return Math.round(stagger * 0.5);
}

function revealElement(el: HTMLElement): void {
  el.classList.add('animate-triggered');
  el.classList.remove('opacity-0', 'translate-y-4', 'translate-y-2', 'animate-type-scale');
}

function handleIntersection(
  entries: IntersectionObserverEntry[],
  obs: IntersectionObserver,
  playOnce: boolean
): void {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const element = entry.target as HTMLElement;
    const baseDelay = getEffectiveDelay(element);
    const effectiveStaggerMs = getEffectiveStagger(element);

    if (effectiveStaggerMs > 0) {
      const children = element.querySelectorAll(STAGGER_CHILDREN_SELECTOR);
      if (children.length === 0) {
        revealElement(element);
        if (playOnce) obs.unobserve(element);
        return;
      }

      revealElement(element);

      children.forEach((child, index) => {
        const delay = baseDelay + index * effectiveStaggerMs;
        const htmlChild = child as HTMLElement;
        setTimeout(() => {
          htmlChild.classList.add('animate-triggered');
          htmlChild.classList.remove('opacity-0', 'translate-y-4', 'translate-y-2', 'scale-95', 'animate-type-scale');
          // Inline styles guarantee visibility regardless of CSS specificity
          htmlChild.style.opacity = '1';
          htmlChild.style.transform = 'translateY(0)';
          if (playOnce && index === children.length - 1) {
            obs.unobserve(element);
          }
        }, delay);
      });
    } else {
      setTimeout(() => {
        revealElement(element);
        if (playOnce) {
          obs.unobserve(element);
        }
      }, baseDelay);
    }
  });
}

export function initAnimations(config?: Partial<AnimationConfig>): void {
  document.documentElement.classList.add('js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    const elements = document.querySelectorAll('.animate-on-scroll, .animate-on-load');
    elements.forEach((el) => revealElement(el as HTMLElement));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    const elements = document.querySelectorAll('.animate-on-scroll, .animate-on-load');
    elements.forEach((el) => revealElement(el as HTMLElement));
    return;
  }

  const { threshold: defaultThreshold, rootMargin, playOnce } = { ...defaultConfig, ...config };

  const elements = document.querySelectorAll('.animate-on-scroll, .animate-on-load');
  if (elements.length === 0) return;

  observers.forEach((obs) => obs.disconnect());
  observers.clear();

  const elementsByObserver = new Map<string, Element[]>();
  elements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const thresholdAttr = htmlEl.getAttribute('data-animation-threshold');
    const threshold =
      thresholdAttr !== null && thresholdAttr !== ''
        ? parseFloat(thresholdAttr)
        : defaultThreshold;
    const thresh = Number.isNaN(threshold) ? defaultThreshold : threshold;
    const rootMarginAttr = htmlEl.getAttribute('data-animation-root-margin');
    const margin = rootMarginAttr !== null ? rootMarginAttr : rootMargin;
    const key = `${thresh}__${margin}`;
    if (!elementsByObserver.has(key)) {
      elementsByObserver.set(key, []);
    }
    elementsByObserver.get(key)!.push(el);
  });

  elementsByObserver.forEach((els, key) => {
    const [threshStr, margin] = key.split('__');
    const thresh = parseFloat(threshStr) || defaultThreshold;
    const obs = new IntersectionObserver(
      (entries) => handleIntersection(entries, obs, playOnce),
      { threshold: thresh, rootMargin: margin }
    );
    observers.set(key, obs);
    els.forEach((el) => obs.observe(el));
  });
}

export function destroyAnimations(): void {
  observers.forEach((obs) => obs.disconnect());
  observers.clear();
}
