import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CharacterReveal, WordReveal } from './SplitText';
import type { ScrollState } from '../engine/types';

export function useTypographySync() {
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!root.current) return;
    const elements = Array.from(root.current.querySelectorAll<HTMLElement>('[data-typography]'));
    elements.forEach((element) => {
      const mode = element.dataset.typography === 'characters' ? 'chars' : 'words';
      const units = Array.from(element.querySelectorAll<HTMLElement>('.text-unit'));
      if (!units.length) return;
      gsap.fromTo(units, { yPercent: 80, opacity: 0, filter: 'blur(8px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: mode === 'chars' ? .018 : .06, ease: 'power4.out', scrollTrigger: { trigger: element, start: 'top 82%', toggleActions: 'play reverse play reverse' } });
    });
  }, []);
  return root;
}

export function SyncedHeadline({ children, characters = false, className = '' }: { children: string; characters?: boolean; className?: string }) {
  return characters ? <CharacterReveal as="span" className={className} data-typography="characters">{children}</CharacterReveal> : <WordReveal as="span" className={className} data-typography="words">{children}</WordReveal>;
}
