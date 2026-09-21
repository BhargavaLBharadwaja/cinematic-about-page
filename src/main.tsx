import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import './styles.css';

type Scene = 'connector' | 'particles' | 'atmosphere' | 'blue' | 'team' | 'projects';
const sections = ['The connective tissue', 'A wider field of view', 'We work everywhere', 'A practice in motion', 'People make the difference', 'Selected projects'];

function useSceneCanvas(scene: Scene, pointer: React.MutableRefObject<{x:number;y:number}>) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!; const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8)); renderer.setSize(innerWidth, innerHeight); renderer.outputColorSpace = THREE.SRGBColorSpace;
    const camera = new THREE.PerspectiveCamera(38, innerWidth/innerHeight, .1, 100); camera.position.z = 8;
    const world = new THREE.Scene();
    const group = new THREE.Group(); world.add(group);
    const clock = new THREE.Clock(); let raf=0;
    const mat = new THREE.MeshStandardMaterial({color:0x6b7cff, roughness:.22, metalness:.15});
    const black = new THREE.MeshStandardMaterial({color:0x111318, roughness:.3, metalness:.35});
    const white = new THREE.MeshStandardMaterial({color:0xf4f3ef, roughness:.2});
    const torus = new THREE.TorusGeometry(.5,.13,12,32);
    const nodes: THREE.Object3D[]=[];
    for(let i=0;i<34;i++){ const m=new THREE.Mesh(torus, i%5===0?white:i%3===0?black:mat); m.position.set((Math.random()-.5)*4.8,(Math.random()-.5)*4,(Math.random()-.5)*3); m.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3); m.scale.setScalar(.45+Math.random()*.75); group.add(m); nodes.push(m); }
    const count=4200, pos=new Float32Array(count*3), seed=new Float32Array(count); for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*9;pos[i*3+1]=(Math.random()-.5)*7;pos[i*3+2]=(Math.random()-.5)*6;seed[i]=Math.random();}
    const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.BufferAttribute(pos,3)); pg.setAttribute('aSeed',new THREE.BufferAttribute(seed,1));
    const pm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uScene:{value:0}},vertexShader:`attribute float aSeed; uniform float uTime,uScene; varying float vA; void main(){vec3 p=position; p.z+=sin(uTime*.35+p.x*1.4+aSeed*8.)*.35; p.x+=sin(uTime*.2+p.y*2.)*.12; p.y+=cos(uTime*.27+p.z*1.7)*.14; float d=length(p.xy); vA=.25+.75*(1.-smoothstep(0.,4.,d)); vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=(2.0+aSeed*3.5)*(7./-mv.z); gl_Position=projectionMatrix*mv;}`,fragmentShader:`varying float vA; void main(){float d=length(gl_PointCoord-.5); if(d>.5) discard; float glow=smoothstep(.5,0.,d); gl_FragColor=vec4(vec3(.65,.72,1.),glow*vA*.72);}`});
    const particles=new THREE.Points(pg,pm); particles.visible=false; world.add(particles);
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(30,20),new THREE.MeshBasicMaterial({color:0x103cdb,transparent:true,opacity:.13})); plane.position.z=-4; plane.visible=false; world.add(plane);
    const resize=()=>{renderer.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix()}; addEventListener('resize',resize);
    const animate=()=>{const t=clock.getElapsedTime(); pm.uniforms.uTime.value=t; const dark=scene!=='connector'&&scene!=='projects'; group.visible=scene==='connector'||scene==='atmosphere'||scene==='team'; particles.visible=dark; plane.visible=scene==='blue'; group.rotation.y += ((pointer.current.x*.15)-group.rotation.y)*.025; group.rotation.x += ((pointer.current.y*.1)-group.rotation.x)*.025; nodes.forEach((n,i)=>{n.rotation.x+=.001+(i%3)*.0005;n.rotation.y+=.002;}); particles.rotation.y=t*.008; renderer.setClearColor(scene==='connector'||scene==='projects'?0xf1f0ec:scene==='blue'?0x1450e8:0x07080a, scene==='connector'||scene==='projects'?1:1); renderer.render(world,camera); raf=requestAnimationFrame(animate)}; animate();
    return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);renderer.dispose();pg.dispose();pm.dispose();};
  },[scene,pointer]); return ref;
}

function Nav({onMenu}:{onMenu:()=>void}){return <header className="nav"><a className="mark" href="#top">ORBIT<span>®</span></a><div className="navRight"><a href="#contact">Let’s talk <i>↗</i></a><button onClick={onMenu} aria-label="Open menu"><span/> <span/> MENU</button></div></header>}
function Menu({close}:{close:()=>void}){return <div className="menu"><button className="close" onClick={close}>CLOSE ×</button><div className="menuLinks">{['About us','Expertise','Selected work','People','Contact'].map((x,i)=><a href={'#s'+i} onClick={close} key={x}><small>0{i+1}</small>{x}<b>↗</b></a>)}</div><p>Independent digital makers<br/>building the next useful thing.</p></div>}
function Section({id,children,className='',eyebrow}:{id:string;children:React.ReactNode;className?:string;eyebrow?:string}){return <section id={id} className={'section '+className}><div className="sectionInner">{eyebrow&&<div className="eyebrow"><span/> {eyebrow}</div>}{children}</div></section>}
function App(){const [menu,setMenu]=useState(false);const [scene,setScene]=useState<Scene>('connector');const pointer=useRef({x:0,y:0}); const canvas=useSceneCanvas(scene,pointer); const prefers=useRef(false);
 useEffect(()=>{prefers.current=matchMedia('(prefers-reduced-motion: reduce)').matches; const lenis=new Lenis({duration:1.25,smoothWheel:true}); const tick=(time:number)=>{lenis.raf(time);requestAnimationFrame(tick)};requestAnimationFrame(tick); const onMove=(e:MouseEvent)=>{pointer.current.x=(e.clientX/innerWidth-.5)*2;pointer.current.y=(e.clientY/innerHeight-.5)*2};addEventListener('mousemove',onMove); const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const s=e.target.getAttribute('data-scene') as Scene|null;if(s)setScene(s);gsap.fromTo(e.target.querySelectorAll('.reveal'),{y:40,opacity:0},{y:0,opacity:1,duration:1.2,stagger:.08,ease:'power3.out'})}}),{threshold:.3});document.querySelectorAll('.section').forEach(x=>obs.observe(x));return()=>{lenis.destroy();removeEventListener('mousemove',onMove);obs.disconnect()}},[]);
 return <><canvas ref={canvas} className="webgl"/><Nav onMenu={()=>setMenu(true)}/>{menu&&<Menu close={()=>setMenu(false)}/>}<main id="top">
 <Section id="s0" className="hero light" eyebrow="ORBIT / INDEPENDENT DIGITAL STUDIO"><h1 className="display reveal">We make<br/><em>connections</em><br/>matter.</h1><p className="intro reveal">A creative technology studio shaping identities, digital products and experiences for a world in motion.</p><div className="scrollHint">SCROLL TO EXPLORE <span>↓</span></div></Section>
 <Section id="s1" className="dark titleScene" eyebrow="01 — OUR POINT OF VIEW" ><h2 className="display reveal">A wider<br/><em>field of view.</em></h2><p className="bodyCopy reveal">We look beyond the obvious. Strategy, design and technology converge to create work with a pulse.</p><div className="sideNote">SCROLL / 01—02</div></Section>
 <Section id="s2" className="dark atmosphere" eyebrow="02 — GLOBAL BY NATURE"><h2 className="display reveal">Everywhere<br/><em>at once.</em></h2><p className="bodyCopy reveal">From the first sketch to the final frame, our distributed team brings different perspectives into one clear direction.</p></Section>
 <Section id="contact" className="blue contact" eyebrow="03 — START A CONVERSATION"><h2 className="display reveal">Have a good<br/><em>question?</em></h2><form className="signup reveal" onSubmit={e=>e.preventDefault()}><input placeholder="Your email address" type="email"/><button>GET IN TOUCH <span>↗</span></button></form></Section>
 <Section id="s3" className="dark editorial" eyebrow="04 — NOTES FROM THE STUDIO"><div className="editorialGrid"><h2 className="display reveal">Articles<br/><em>& talks</em></h2><div className="stories reveal"><article><span>01 / 04</span><h3>Designing for the in-between</h3><small>READ ARTICLE ↗</small></article><article><span>02 / 04</span><h3>Why systems need room to breathe</h3><small>WATCH TALK ↗</small></article></div></div></Section>
 <Section id="s4" className="blue expertise" eyebrow="05 — WHAT WE DO"><h2 className="display reveal">Area of<br/><em>expertise.</em></h2><div className="expertiseList reveal">{['Brand worlds','Digital products','Motion & 3D','Creative technology'].map((x,i)=><div key={x}><b>0{i+1}</b>{x}<span>↗</span></div>)}</div></Section>
 <Section id="s5" className="dark data" eyebrow="06 — A TRACK RECORD"><h2 className="display reveal">Small team.<br/><em>Big signal.</em></h2><div className="stats reveal"><div><strong>18</strong><span>AWARDS<br/>& NOMINATIONS</span></div><div><strong>34</strong><span>GLOBAL<br/>COLLABORATIONS</span></div><div><strong>12</strong><span>YEARS OF<br/>MAKING</span></div></div></Section>
 <Section id="s6" className="dark brands" eyebrow="07 — IN GOOD COMPANY"><h2 className="display reveal">People we<br/><em>work with.</em></h2><div className="brandRow reveal">NIKE <span>SONOS</span> PATAGONIA <span>SPOTIFY</span> A24</div></Section>
 <Section id="s7" className="dark team" eyebrow="08 — THE PEOPLE BEHIND THE WORK"><h2 className="display reveal">Meet the<br/><em>makers.</em></h2><div className="member reveal"><div className="portrait"><div className="portraitLines"/><span>01</span></div><div><h3>Alex Morgan</h3><p>Creative Director / New York</p></div><button>Next member ↗</button></div></Section>
 <Section id="s8" className="projects light" eyebrow="09 — SELECTED PROJECTS"><h2 className="display reveal">Made to<br/><em>move.</em></h2><div className="projectGrid reveal">{['Northstar / Identity','Still Life / Digital experience','Field Notes / Editorial'].map((x,i)=><article className={'project p'+i} key={x}><div><small>0{i+1}</small><h3>{x}</h3><span>VIEW PROJECT ↗</span></div></article>)}</div></Section>
 </main><footer><a className="mark" href="#top">ORBIT®</a><span>© 2026 — Made with intent.</span><a href="#contact">Contact ↗</a></footer></>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
