import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PersistentWebGLCanvas } from './components/PersistentWebGLCanvas';
import './styles.css';

type SceneId = 'connector' | 'particles' | 'atmosphere' | 'contact' | 'editorial' | 'expertise' | 'data' | 'brands' | 'team' | 'projects';

function Nav({ onMenu }: { onMenu: () => void }) {
  return <header className="nav"><a className="mark" href="#top">ORBIT<span>®</span></a><div className="navRight"><a href="#contact">Let’s talk <i>↗</i></a><button onClick={onMenu}><span /> <span /> MENU</button></div></header>;
}
function Menu({ close }: { close: () => void }) {
  return <div className="menu"><button className="close" onClick={close}>CLOSE ×</button><div className="menuLinks">{['About us','Expertise','Selected work','People','Contact'].map((label, index) => <a href={`#s${index}`} onClick={close} key={label}><small>0{index + 1}</small>{label}<b>↗</b></a>)}</div><p>Independent digital makers<br />building the next useful thing.</p></div>;
}
function Section({ id, scene, children, className = '', eyebrow }: { id: string; scene: SceneId; children: React.ReactNode; className?: string; eyebrow?: string }) {
  return <section id={id} data-scene={scene} className={`section ${className}`}><div className="sectionInner">{eyebrow && <div className="eyebrow"><span /> {eyebrow}</div>}{children}</div></section>;
}
function App() {
  const [menu, setMenu] = useState(false);
  return <><PersistentWebGLCanvas /><Nav onMenu={() => setMenu(true)} />{menu && <Menu close={() => setMenu(false)} />}<main id="top">
    <Section id="s0" scene="connector" className="hero light" eyebrow="ORBIT / INDEPENDENT DIGITAL STUDIO"><h1 className="display reveal">We make<br /><em>connections</em><br />matter.</h1><p className="intro reveal">A creative technology studio shaping identities, digital products and experiences for a world in motion.</p><div className="scrollHint">SCROLL TO EXPLORE <span>↓</span></div></Section>
    <Section id="s1" scene="particles" className="dark titleScene" eyebrow="01 — OUR POINT OF VIEW"><h2 className="display reveal">A wider<br /><em>field of view.</em></h2><p className="bodyCopy reveal">We look beyond the obvious. Strategy, design and technology converge to create work with a pulse.</p><div className="sideNote">SCROLL / 01—02</div></Section>
    <Section id="s2" scene="atmosphere" className="dark atmosphere" eyebrow="02 — GLOBAL BY NATURE"><h2 className="display reveal">Everywhere<br /><em>at once.</em></h2><p className="bodyCopy reveal">From the first sketch to the final frame, our distributed team brings different perspectives into one clear direction.</p></Section>
    <Section id="contact" scene="contact" className="blue contact" eyebrow="03 — START A CONVERSATION"><h2 className="display reveal">Have a good<br /><em>question?</em></h2><form className="signup reveal" onSubmit={(event) => event.preventDefault()}><input placeholder="Your email address" type="email" /><button>GET IN TOUCH <span>↗</span></button></form></Section>
    <Section id="s3" scene="editorial" className="dark editorial" eyebrow="04 — NOTES FROM THE STUDIO"><div className="editorialGrid"><h2 className="display reveal">Articles<br /><em>& talks</em></h2><div className="stories reveal"><article><span>01 / 04</span><h3>Designing for the in-between</h3><small>READ ARTICLE ↗</small></article><article><span>02 / 04</span><h3>Why systems need room to breathe</h3><small>WATCH TALK ↗</small></article></div></div></Section>
    <Section id="s4" scene="expertise" className="blue expertise" eyebrow="05 — WHAT WE DO"><h2 className="display reveal">Area of<br /><em>expertise.</em></h2><div className="expertiseList reveal">{['Brand worlds','Digital products','Motion & 3D','Creative technology'].map((label, index) => <div key={label}><b>0{index + 1}</b>{label}<span>↗</span></div>)}</div></Section>
    <Section id="s5" scene="data" className="dark data" eyebrow="06 — A TRACK RECORD"><h2 className="display reveal">Small team.<br /><em>Big signal.</em></h2><div className="stats reveal">{[['18','AWARDS','& NOMINATIONS'],['34','GLOBAL','COLLABORATIONS'],['12','YEARS OF','MAKING']].map(([number, first, second]) => <div key={number}><strong>{number}</strong><span>{first}<br />{second}</span></div>)}</div></Section>
    <Section id="s6" scene="brands" className="dark brands" eyebrow="07 — IN GOOD COMPANY"><h2 className="display reveal">People we<br /><em>work with.</em></h2><div className="brandRow reveal">NIKE <span>SONOS</span> PATAGONIA <span>SPOTIFY</span> A24</div></Section>
    <Section id="s7" scene="team" className="dark team" eyebrow="08 — THE PEOPLE BEHIND THE WORK"><h2 className="display reveal">Meet the<br /><em>makers.</em></h2><div className="member reveal"><div className="portrait"><div className="portraitLines" /><span>01</span></div><div><h3>Alex Morgan</h3><p>Creative Director / New York</p></div><button>Next member ↗</button></div></Section>
    <Section id="s8" scene="projects" className="projects light" eyebrow="09 — SELECTED PROJECTS"><h2 className="display reveal">Made to<br /><em>move.</em></h2><div className="projectGrid reveal">{['Northstar / Identity','Still Life / Digital experience','Field Notes / Editorial'].map((label, index) => <article className={`project p${index}`} key={label}><div><small>0{index + 1}</small><h3>{label}</h3><span>VIEW PROJECT ↗</span></div></article>)}</div></Section>
  </main><footer><a className="mark" href="#top">ORBIT®</a><span>© 2026 — Made with intent.</span><a href="#contact">Contact ↗</a></footer></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
