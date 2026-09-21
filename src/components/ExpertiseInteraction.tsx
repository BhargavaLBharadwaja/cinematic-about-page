import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { expertiseModes } from '../data/expertise';

export function ExpertiseInteraction() {
  const [active, setActive] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const mode = expertiseModes[active];

  useEffect(() => {
    const announce = () => window.dispatchEvent(new CustomEvent('expertisechange', { detail: { index: active } }));
    announce();
    const node = contentRef.current;
    if (!node) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(node.querySelectorAll('[data-expertise-copy]'), { y: 35, opacity: 0, filter: 'blur(9px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .8, stagger: .06, ease: 'power4.out' });
    }, node);
    return () => ctx.revert();
  }, [active]);

  return <div className="expertiseInterface" style={{ '--expertise-accent': mode.accent } as React.CSSProperties}>
    <div className="expertiseTabs" role="tablist" aria-label="Areas of expertise">
      {expertiseModes.map((item, index) => <button key={item.id} role="tab" aria-selected={active === index} className={active === index ? 'is-active' : ''} onClick={() => setActive(index)} onMouseEnter={() => setActive(index)}><span>0{index + 1}</span>{item.label}<i>↗</i></button>)}
    </div>
    <div className="expertiseCopy" ref={contentRef} key={mode.id}>
      <span data-expertise-copy className="expertiseKicker">{mode.label} / 0{active + 1}</span>
      <h3 data-expertise-copy>{mode.title}</h3>
      <p data-expertise-copy>{mode.description}</p>
    </div>
  </div>;
}
