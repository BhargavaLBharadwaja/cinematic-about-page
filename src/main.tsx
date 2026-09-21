import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { PersistentWebGLCanvas } from './components/PersistentWebGLCanvas';
import './styles.css';

type SceneId = 'connector' | 'particles' | 'atmosphere' | 'contact' | 'editorial' | 'expertise' | 'data' | 'brands' | 'team' | 'projects';

const sceneFor = (scene: SceneId) => scene;

function Nav({ onMenu }: { onMenu: () => void }) {
  return <header className="nav"><a className="mark" href="#top">ORBIT<span>®</span></a><div className="navRight"><a href="#contact">Let’s talk <i>↗</i></a><button onClick={onMenu}><span /> <span /> MENU</button></div></header>;
}
function Menu({ close }: { close: () => void }) {
  const links = [['01', 'About', 's0'], ['02', 'Profile', 's4'], ['03', 'Expertise', 's10'], ['04', 'People', 's7'], ['05', 'Contact', 'contact']];
  return <div className="menu"><button className="close" onClick={close}>CLOSE ×</button><div className="menuLinks">{links.map(([number, label, id]) => <a href={`#${id}`} onClick={close} key={label}><small>{number}</small>{label}<b>↗</b></a>)}</div><p>Independent digital makers<br />building useful futures.</p></div>;
}
function Section({ id, scene, eyebrow, className = '', children }: { id: string; scene: SceneId; eyebrow: string; className?: string; children: React.ReactNode }) {
  return <section id={id} data-scene={scene} className={`section ${className}`}><div className="sectionInner"><div className="eyebrow"><span />{eyebrow}</div>{children}</div></section>;
}
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <div className={`reveal ${className}`}>{children}</div>; }
function App() {
  const [menu, setMenu] = useState(false);
  const pageRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = pageRef.current; if (!root) return;
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      gsap.to(entry.target.querySelectorAll('.reveal'), { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, stagger: .06, ease: 'power4.out', overwrite: 'auto' });
    }), { threshold: .2 });
    root.querySelectorAll('.section').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return <><PersistentWebGLCanvas /><Nav onMenu={() => setMenu(true)} />{menu && <Menu close={() => setMenu(false)} />}<main id="top" ref={pageRef}>
    <Section id="s0" scene={sceneFor('connector')} className="hero light" eyebrow="ORBIT / INDEPENDENT DIGITAL STUDIO"><Reveal><h1 className="display">We make<br /><em>connections</em><br />matter.</h1></Reveal><Reveal className="intro">A creative production studio shaping identities, digital products and experiences for a world in motion.</Reveal><div className="scrollHint">SCROLL TO EXPLORE <span>↓</span></div></Section>
    <Section id="s1" scene={sceneFor('particles')} className="dark titleScene" eyebrow="01 — CREATIVE PRODUCTION"><Reveal><h2 className="display">Ideas made<br /><em>real.</em></h2></Reveal><Reveal className="bodyCopy">We turn ambitious ideas into tactile, useful experiences through strategy, design, motion and technology.</Reveal></Section>
    <Section id="s2" scene={sceneFor('particles')} className="dark experience" eyebrow="02 — DIGITAL EXPERIENCES"><Reveal><h2 className="display">Digital<br /><em>with feeling.</em></h2></Reveal><Reveal className="bodyCopy">Interfaces should have a pulse. We build responsive worlds that invite people in and stay with them.</Reveal></Section>
    <Section id="s3" scene={sceneFor('atmosphere')} className="dark atmosphere" eyebrow="03 — WORLDWIDE TEAM"><Reveal><h2 className="display">Everywhere<br /><em>at once.</em></h2></Reveal><Reveal className="bodyCopy">A distributed group of designers, directors, engineers and producers bringing distinct perspectives into one clear direction.</Reveal><div className="sideNote">NEW YORK / LONDON / TOKYO</div></Section>
    <Section id="s4" scene={sceneFor('editorial')} className="dark profile" eyebrow="04 — PROFILE"><Reveal><h2 className="display">Small team.<br /><em>Wide lens.</em></h2></Reveal><div className="profileGrid reveal"><p>ORBIT is an independent studio for brands and people moving culture forward.</p><p>We work from first question to final frame, making systems that are as considered as they are alive.</p></div></Section>
    <Section id="s5" scene={sceneFor('brands')} className="dark brands" eyebrow="05 — BRANDS"><Reveal><h2 className="display">In good<br /><em>company.</em></h2></Reveal><div className="brandRow reveal">SONOS <span>PATAGONIA</span> A24 <span>SPOTIFY</span> NIKE <span>MONOCLE</span></div></Section>
    <Section id="s6" scene={sceneFor('data')} className="dark awards" eyebrow="06 — AWARDS"><Reveal><h2 className="display">Work that<br /><em>travels.</em></h2></Reveal><div className="stats reveal"><div><strong>18</strong><span>AWARDS<br />& NOMINATIONS</span></div><div><strong>34</strong><span>GLOBAL<br />COLLABORATIONS</span></div><div><strong>12</strong><span>YEARS OF<br />MAKING</span></div></div></Section>
    <Section id="s7" scene={sceneFor('editorial')} className="dark storiesSection" eyebrow="07 — ARTICLES"><div className="editorialGrid"><Reveal><h2 className="display">Articles<br /><em>in progress.</em></h2></Reveal><div className="stories reveal"><article><span>01 / 04</span><h3>Designing for the in-between</h3><small>READ ARTICLE ↗</small></article><article><span>02 / 04</span><h3>Making space for surprise</h3><small>READ ARTICLE ↗</small></article></div></div></Section>
    <Section id="s8" scene={sceneFor('editorial')} className="dark talks" eyebrow="08 — TALKS"><Reveal><h2 className="display">Listen<br /><em>closely.</em></h2></Reveal><div className="talkList reveal"><div><span>2026</span> Systems with a soul <b>WATCH ↗</b></div><div><span>2025</span> The useful unknown <b>LISTEN ↗</b></div></div></Section>
    <Section id="s9" scene={sceneFor('expertise')} className="blue expertise" eyebrow="09 — AREA OF EXPERTISE"><Reveal><h2 className="display">Area of<br /><em>expertise.</em></h2></Reveal><div className="expertiseList reveal">{['Brand worlds', 'Digital products', 'Motion & 3D', 'Creative technology'].map((label, index) => <div key={label}><b>0{index + 1}</b>{label}<span>↗</span></div>)}</div></Section>
    <Section id="s10" scene={sceneFor('expertise')} className="blue capability" eyebrow="10 — STRATEGY"><Reveal><h2 className="display">Start with<br /><em>why.</em></h2></Reveal><Reveal className="bodyCopy">Positioning, research and a clear point of view. We find the signal before we shape the form.</Reveal></Section>
    <Section id="s11" scene={sceneFor('expertise')} className="blue capability" eyebrow="11 — CREATIVE"><Reveal><h2 className="display">Make it<br /><em>matter.</em></h2></Reveal><Reveal className="bodyCopy">Art direction, identity, campaigns and worlds with enough character to become memorable.</Reveal></Section>
    <Section id="s12" scene={sceneFor('expertise')} className="blue capability" eyebrow="12 — TECH"><Reveal><h2 className="display">Build the<br /><em>impossible.</em></h2></Reveal><Reveal className="bodyCopy">Code, WebGL and intelligent systems turn a strong idea into an experience you can feel.</Reveal></Section>
    <Section id="s13" scene={sceneFor('expertise')} className="blue capability" eyebrow="13 — PRODUCTION"><Reveal><h2 className="display">Make the<br /><em>moment.</em></h2></Reveal><Reveal className="bodyCopy">From prototype to launch, our producers keep the details moving and the ambition intact.</Reveal></Section>
    <Section id="contact" scene={sceneFor('contact')} className="blue contact" eyebrow="14 — START A CONVERSATION"><Reveal><h2 className="display">Have a good<br /><em>question?</em></h2></Reveal><form className="signup reveal" onSubmit={(event) => event.preventDefault()}><input type="email" placeholder="Your email address" /><button>GET IN TOUCH <span>↗</span></button></form></Section>
  </main><footer><a className="mark" href="#top">ORBIT®</a><span>© 2026 — Made with intent.</span><a href="#contact">Contact ↗</a></footer></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
