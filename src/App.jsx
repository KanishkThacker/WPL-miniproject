import React, { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Background, Controls, Handle, MarkerType, Position, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

const Dashboard = lazy(() => import('./Dashboard'))
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Bot, BrainCircuit, Check, ChevronRight, CircleDot,
  ClipboardCheck, CloudSun, Command, Cpu, Database, Download, Gauge, Github,
  HeartPulse, Menu, Moon, Orbit, Radio, Rocket, Satellite, ScanLine, Send,
  ShieldCheck, Signal, Sparkles, Sun, Thermometer, Timer, Waves, X, Zap,
} from 'lucide-react'

const nav = [
  ['Mission', '#mission'], ['Architecture', '#architecture'], ['AI Engine', '#ai-engine'],
  ['Comms', '#communications'], ['Ground Station', '#ground-station'], ['Docs', '#docs'],
]

gsap.registerPlugin(ScrollTrigger)

const status = [
  { icon: Rocket, label: 'Deployment', value: 'Nominal', detail: 'Separation confirmed', tone: 'good' },
  { icon: HeartPulse, label: 'Satellite health', value: '98.7%', detail: 'All systems operational', tone: 'good' },
  { icon: BrainCircuit, label: 'AI decision engine', value: 'Active', detail: 'Priority routing engaged', tone: 'accent' },
  { icon: Signal, label: 'Ground station', value: 'Connected', detail: 'Vashi · 45° elevation', tone: 'good' },
]

const capabilities = [
  { icon: Rocket, number: '01', title: 'Deployment monitoring', text: 'Follow release progress, separation confirmation, activation and initialisation in a single view.' },
  { icon: HeartPulse, number: '02', title: 'Satellite health', text: 'Read power, thermal, memory and subsystem signals before a deviation becomes a risk.' },
  { icon: BrainCircuit, number: '03', title: 'AI decision engine', text: 'Route the right data at the right moment using link quality, urgency and available power.' },
  { icon: ShieldCheck, number: '04', title: 'Failure prediction', text: 'Surface early indicators of communications, thermal and resource anomalies.' },
  { icon: Command, number: '05', title: 'Authorised actions', text: 'Issue approved commands, request payload data and acknowledge alerts with confidence.' },
  { icon: Radio, number: '06', title: 'Ground station', text: 'Receive, decode, verify and retain every contact from the mission control loop.' },
]

const modes = [
  { code: '01', icon: Waves, title: 'TT&C / HOUSEKEEPING', text: 'Essential spacecraft telemetry, tracking and commands. Always held at the highest priority.', className: 'ttc' },
  { code: '02', icon: ScanLine, title: 'SSTV', text: 'Camera images intelligently queued for transmission when the link and power budget permit.', className: 'sstv' },
  { code: '03', icon: Radio, title: 'M17', text: 'Digital voice and data communication through the amateur-radio payload.', className: 'm17' },
  { code: '04', icon: Waves, title: 'CODEC2', text: 'Low-bitrate digital voice engineered for bandwidth-constrained links.', className: 'codec' },
]

function Logo() {
  return <a className="logo" href="#top" aria-label="SomSat home"><span className="logo-orbit"><i /></span><span>Som<span>Sat</span></span></a>
}

function Node({ data }) {
  const Icon = data.icon
  return <div className={`flow-node ${data.variant || ''}`}>
    <Handle type="target" position={Position.Left} />
    <div className="node-icon"><Icon size={17} /></div>
    <div><strong>{data.label}</strong><small>{data.caption}</small></div>
    <Handle type="source" position={Position.Right} />
  </div>
}

const nodeTypes = { mission: Node }
const flowNodes = [
  { id: 'pod', type: 'mission', position: { x: 0, y: 135 }, data: { icon: Rocket, label: 'SomaiyaPod', caption: 'Deployment events' } },
  { id: 'sat', type: 'mission', position: { x: 205, y: 135 }, data: { icon: Satellite, label: 'SomaiyaSat', caption: 'Live telemetry', variant: 'active' } },
  { id: 'ai', type: 'mission', position: { x: 410, y: 32 }, data: { icon: BrainCircuit, label: 'AI Engine', caption: 'Priority routing', variant: 'active' } },
  { id: 'dashboard', type: 'mission', position: { x: 615, y: 32 }, data: { icon: Gauge, label: 'Mission Dashboard', caption: 'Operational view' } },
  { id: 'ground', type: 'mission', position: { x: 410, y: 238 }, data: { icon: Radio, label: 'Ground station', caption: 'Downlink confirmed' } },
  { id: 'action', type: 'mission', position: { x: 615, y: 238 }, data: { icon: Command, label: 'Mission action', caption: 'Approved command' } },
]
const flowEdges = [
  ['pod', 'sat'], ['sat', 'ai'], ['ai', 'dashboard'], ['sat', 'ground'], ['ground', 'action'], ['ai', 'action'],
].map(([source, target], i) => ({ id: `e-${i}`, source, target, animated: i === 1 || i === 3 || i === 5, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6798ff', strokeWidth: 1.3 } }))

function MetricChart() {
  const bars = [45, 58, 43, 64, 78, 68, 82, 73, 88, 78, 94, 88]
  return <div className="metric-chart" aria-label="Simulated link quality chart">
    <div className="chart-label"><span>LINK QUALITY</span><strong>91.4<span>%</span></strong></div>
    <div className="chart-grid">{bars.map((height, index) => <i key={index} style={{ height: `${height}%`, animationDelay: `${index * 70}ms` }} />)}</div>
    <div className="chart-axis"><span>10:00</span><span>10:15</span><span>10:30</span><span>10:45</span></div>
  </div>
}

function LandingPage() {
  const [dark, setDark] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const appRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.85,
    })
    const update = (time) => lenis.raf(time * 1000)

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .from('.hero-copy > *', { y: 24, opacity: 0, duration: 0.72, stagger: 0.1 })
        .from('.orbit-stage', { scale: 0.88, opacity: 0, duration: 0.9 }, 0.18)
        .to('.orbit-stage', { y: -8, rotation: 1.5, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0.9)

      gsap.from('.status-item', {
        y: 18,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: { trigger: '.status-bar', start: 'top 85%' },
      })

      gsap.from('.gsap-card', {
        y: 32,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.mission-cards', start: 'top 78%' },
      })

      gsap.from('.flow-wrap', {
        scale: 0.94,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.architecture', start: 'top 70%' },
      })

      gsap.from('.capability-card', {
        y: 26,
        opacity: 0,
        duration: 0.5,
        stagger: { amount: 0.42, from: 'start' },
        ease: 'power2.out',
        scrollTrigger: { trigger: '.capability-grid', start: 'top 78%' },
      })

      gsap.from('.metric', {
        scale: 0.94,
        opacity: 0,
        duration: 0.5,
        stagger: 0.09,
        ease: 'back.out(1.35)',
        scrollTrigger: { trigger: '.metrics-layout', start: 'top 78%' },
      })

      gsap.to('.decision-result', {
        boxShadow: '0 0 0 5px rgba(103, 152, 255, 0.08)',
        duration: 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    }, appRef)

    return () => context.revert()
  }, [])

  return <main id="top" ref={appRef}>
    <div className="announcement"><Sparkles size={14} /><span>SomaiyaSat Mission Operations · <b>Demo mission environment</b></span><a href="/dashboard">View dashboard <ArrowRight size={13} /></a></div>
    <header className="site-header">
      <Logo />
      <nav className={menuOpen ? 'open' : ''}>{nav.map(([name, href]) => <a key={name} href={href} onClick={() => setMenuOpen(false)}>{name}</a>)}</nav>
      <div className="header-actions">
        <button className="theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle color mode">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
        <a className="button primary header-cta" href="/dashboard">Open dashboard <ArrowUpRight /></a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
      </div>
    </header>

    <section className="hero grid-section">
      <div className="hero-copy">
        <p className="eyebrow"><CircleDot size={12} /> SOMAIYASAT MISSION OPERATIONS</p>
        <h1>Autonomous intelligence for <em>orbit.</em></h1>
        <p className="hero-text">SomSat connects spacecraft telemetry, AI-assisted decisions and ground-station operations into one clear mission picture.</p>
        <div className="button-row"><a className="button primary" href="/dashboard">Open Mission Dashboard <ArrowUpRight /></a><a className="button ghost" href="#mission">Explore the mission <ArrowDownRight /></a></div>
        <div className="hero-proof"><span className="pulse-dot" /> <b>SIMULATED MISSION DATA</b><i /> Updated 42 seconds ago</div>
      </div>
      <div className="orbit-stage">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
        <div className="satellite-art"><span className="solar solar-left" /><span className="sat-core"><Satellite size={39} /><i /></span><span className="solar solar-right" /></div>
        <div className="signal signal-a" /><div className="signal signal-b" />
        <div className="orbit-tag tag-top"><span>ALTITUDE</span><b>425.6 km</b></div>
        <div className="orbit-tag tag-bottom"><span>VELOCITY</span><b>7.66 km/s</b></div>
      </div>
    </section>

    <section className="status-bar section-shell" aria-label="Simulated mission status">
      <div className="status-heading"><span className="eyebrow">MISSION STATUS</span><small>DEMO DATA</small></div>
      <div className="status-list">{status.map(({ icon: Icon, label, value, detail, tone }) => <article className="status-item" key={label}><Icon /><div><small>{label}</small><strong className={tone}>{value}</strong><span>{detail}</span></div></article>)}</div>
    </section>

    <section className="section-shell intro" id="mission">
      <div className="section-title reveal"><p className="eyebrow">01 / MISSION OVERVIEW</p><h2>One platform for the <span>complete mission lifecycle.</span></h2></div>
      <div className="intro-text reveal-delay"><p>The SomaiyaSat mission brings together a deployer, PocketQube satellite, autonomous data-routing logic, multi-mode payloads and a ground station.</p><p>Mission Operations turns those systems into a coherent operational loop: observe the spacecraft, understand risk, and act with control.</p><a className="text-link" href="#architecture">See system architecture <ArrowRight /></a></div>
    </section>

    <section className="section-shell mission-cards">{[
      [Rocket, 'SOMAIYAPOD', 'Deployment, release and handover', 'The deployer safely houses and releases SomaiyaSat, with confirmation events held in the mission record.'],
      [Satellite, 'SOMAIYASAT', 'The PocketQube in orbit', 'Flight computer, sensors, power systems and radio payloads reported through a shared telemetry stream.'],
      [Gauge, 'MISSION DASHBOARD', 'The operational picture', 'Deployment, health, AI decisions and mission actions in a purpose-built command view.'],
      [Radio, 'GROUND STATION', 'Every contact captured', 'Downlinked telemetry, payload data, voice and SSTV images decoded, stored and ready to inspect.'],
    ].map(([Icon, tag, title, text], index) => <article className="mission-card gsap-card" key={tag}><div className="card-top"><Icon /><span>{tag}</span><ArrowUpRight size={16} /></div><h3>{title}</h3><p>{text}</p><div className={`mini-viz viz-${index}`}><i /><i /><i /><i /><i /></div></article>)}</section>

    <section className="architecture grid-section" id="architecture">
      <div className="section-shell"><div className="architecture-heading reveal"><p className="eyebrow">02 / SYSTEM ARCHITECTURE</p><h2>From spacecraft telemetry to <span>mission action.</span></h2><p>Every signal has a path. The platform joins onboard data and ground feedback to support safe, timely mission decisions.</p></div><div className="flow-wrap"><ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.12 }} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} proOptions={{ hideAttribution: true }}><Background gap={24} size={1} color="var(--flow-grid)" /><Controls showInteractive={false} /></ReactFlow></div></div>
    </section>

    <section className="section-shell capability-section">
      <div className="section-title narrow reveal"><p className="eyebrow">03 / CAPABILITIES</p><h2>Mission control, <span>made intelligible.</span></h2></div>
      <div className="capability-grid">{capabilities.map(({ icon: Icon, number, title, text }) => <article className="capability-card" key={title}><span className="cap-number">{number}</span><Icon /><h3>{title}</h3><p>{text}</p><ArrowRight className="card-arrow" /></article>)}</div>
    </section>

    <section className="ai-section grid-section" id="ai-engine"><div className="section-shell ai-layout"><div className="ai-copy reveal"><p className="eyebrow">04 / AI DECISION ENGINE</p><h2>AI that thinks in <span>mission priorities.</span></h2><p>The decision engine evaluates satellite resources and link conditions, choosing a safe transmission order while protecting critical telemetry.</p><a className="button ghost" href="#communications">Explore communication modes <ArrowRight /></a></div><div className="decision-board reveal-delay"><div className="board-header"><div><BrainCircuit /><span>DECISION WORKFLOW</span></div><b><i /> PROCESSING</b></div><div className="workflow">{['Collect telemetry', 'Rank payload queue', 'Predict mission risks', 'Select transmission mode', 'Confirm ground feedback'].map((step, index) => <div className="workflow-step" key={step}><span>{`0${index + 1}`}</span><strong>{step}</strong>{index < 4 && <i className="workflow-line" />}</div>)}</div><div className="decision-result"><Sparkles /><div><small>RECOMMENDED ACTION</small><strong>Transmit TT&C packet</strong></div><b>98.4% confidence</b></div></div></div></section>

    <section className="section-shell comms-section" id="communications"><div className="section-title reveal"><p className="eyebrow">05 / COMMUNICATION MODES</p><h2>Multi-mode communication for <span>every mission need.</span></h2></div><div className="modes-grid">{modes.map(({ code, icon: Icon, title, text, className }, index) => <article className={`mode-card ${className} reveal`} style={{ '--delay': `${index * 100}ms` }} key={title}><span>{code}</span><Icon /><h3>{title}</h3><p>{text}</p><div className="mode-wave"><i /><i /><i /><i /><i /><i /><i /></div></article>)}</div></section>

    <section className="metrics-section"><div className="section-shell"><div className="metrics-head reveal"><div><p className="eyebrow">MISSION READINESS</p><h2>Designed to make each <span>pass count.</span></h2></div><p>Representative values from a simulated test environment. Live values are available inside the mission dashboard.</p></div><div className="metrics-layout"><div className="metrics-grid">{[['99.2%', 'Deployment success rate'], ['98.8%', 'Packet delivery rate'], ['92.6%', 'Data priority accuracy'], ['247', 'Telemetry packets received']].map(([value, label]) => <div className="metric" key={label}><b>{value}</b><span>{label}</span><i /></div>)}</div><MetricChart /></div></div></section>

    <section className="dashboard-cta grid-section" id="dashboard"><div className="section-shell cta-content reveal"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Monitor the mission <span>in real time.</span></h2><p>Inspect spacecraft health, review AI decisions, trace communication activity and perform authorised mission actions.</p></div><a className="button primary large" href="/dashboard">Open Mission Dashboard <ArrowUpRight /></a></div></section>

    <section className="section-shell documentation" id="docs"><div className="docs-header reveal"><p className="eyebrow">DOCUMENTATION</p><h2>The mission, <span>fully documented.</span></h2></div><div className="docs-list">{['Mission objectives', 'SomaiyaSat & SomaiyaPod architecture', 'Payload descriptions', 'AI routing methodology', 'Ground-station workflow', 'Telemetry definitions'].map((title, index) => <a className="doc-link reveal" style={{ '--delay': `${index * 65}ms` }} href="#contact" key={title}><span>{`0${index + 1}`}</span><strong>{title}</strong><ArrowUpRight /></a>)}</div></section>

    <footer id="contact"><div className="section-shell footer-grid"><div className="footer-brand"><Logo /><p>Autonomous mission operations for SomaiyaSat.</p><a href="mailto:mission@somsat.org">mission@somsat.org <ArrowUpRight /></a></div><div><p className="footer-label">EXPLORE</p>{nav.slice(0, 4).map(([n, h]) => <a key={n} href={h}>{n}</a>)}</div><div><p className="footer-label">RESOURCES</p><a href="#docs">Documentation</a><a href="#architecture">System architecture</a><a href="/dashboard">Mission dashboard</a><a href="#contact">Contact team</a></div><div className="footer-mark"><Orbit size={44} /><span>STUDENT-LED<br />SPACE TECHNOLOGY</span></div></div><div className="section-shell footer-bottom"><span>© 2026 SomSat Mission Operations</span><span>Built for a better view of orbit.</span><a href="#top">Back to top ↑</a></div></footer>
  </main>
}

function App() {
  const isDashboard = window.location.pathname.replace(/\/$/, '') === '/dashboard'
  return isDashboard
    ? <Suspense fallback={<div className="dashboard-route-loading">Loading mission console…</div>}><Dashboard /></Suspense>
    : <LandingPage />
}

export default App
