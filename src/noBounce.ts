/**
 * iOS/Safari rubber-band bounce prevention.
 *
 * Locks window overscroll while allowing scroll inside elements that can scroll
 * (those with overflow-y: auto/scroll and scrollable content).
 * Safe to call multiple times.
 */

let initialized = false;

export function installNoBounce() {
  if (initialized) return;
  initialized = true;

  const isIOS = /iP(ad|hone|od)/.test(navigator.platform) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  if (!isIOS) return;

  let startY = 0;

  function isScrollable(el: Element | null): boolean {
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el as Element);
      const canScroll = /(auto|scroll)/.test(style.overflowY || '') &&
        (el as HTMLElement).scrollHeight > (el as HTMLElement).clientHeight;
      if (canScroll) return true;
      el = el.parentElement;
    }
    return false;
  }

  function onTouchStart(ev: TouchEvent) {
    if (ev.touches.length !== 1) return;
    startY = ev.touches[0].clientY;
  }

  function onTouchMove(ev: TouchEvent) {
    if (ev.touches.length !== 1) return;
    const el = ev.target as Element | null;
    const scrollable = isScrollable(el);

    if (!scrollable) {
      // No scrollable ancestor: prevent viewport rubber-band
      ev.preventDefault();
      return;
    }

    // Within a scrollable container, prevent rubber-band when at edges
    let cur: Element | null = el;
    while (cur && cur !== document.body) {
      const style = window.getComputedStyle(cur as Element);
      const isYScroll = /(auto|scroll)/.test(style.overflowY || '');
      if (isYScroll) {
        const node = cur as HTMLElement;
        const y = ev.touches[0].clientY;
        const dy = y - startY;
        if (node.scrollTop <= 0 && dy > 0) {
          ev.preventDefault();
          return;
        }
        const maxScroll = node.scrollHeight - node.clientHeight;
        if (node.scrollTop >= maxScroll && dy < 0) {
          ev.preventDefault();
          return;
        }
        break;
      }
      cur = cur.parentElement;
    }
  }

  // Use passive: false so we can call preventDefault()
  window.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
}

export default installNoBounce;
