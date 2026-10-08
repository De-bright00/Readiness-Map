'use client'
import { useEffect, useRef } from 'react'

type RGB = readonly [number, number, number]
type Variant = 'light' | 'dark'
type Pulse = { x: number; y: number; born: number; life: number; c: RGB; maxR: number }
type Arc = { ax: number; ay: number; bx: number; by: number; born: number; life: number }

// Same status colours as the map, weighted roughly like the real mix of statuses.
const STATUS: { c: RGB; w: number }[] = [
  { c: [63, 154, 104], w: 0.6 },   // Ready
  { c: [231, 162, 59], w: 0.25 },  // At risk
  { c: [217, 104, 87], w: 0.1 },   // Not ready
  { c: [154, 167, 162], w: 0.05 }, // Unknown (silent)
]

const THEMES = {
  light: { dot: [14, 98, 94] as RGB, base: 0.03, amp: 0.2, arc: [14, 98, 94] as RGB, parallax: 0.22, density: 110000, ring: 0.5 },
  dark: { dot: [143, 190, 175] as RGB, base: 0.05, amp: 0.26, arc: [243, 197, 121] as RGB, parallax: 0, density: 80000, ring: 0.6 },
}

const BUCKETS = 8
const TAU = Math.PI * 2
const FPS = 45
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, a).toFixed(3)})`
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const pickStatus = (): RGB => {
  let r = Math.random()
  for (const s of STATUS) if ((r -= s.w) <= 0) return s.c
  return STATUS[0].c
}

export default function AmbientBackground({ variant = 'light' }: { variant?: Variant }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const theme = THEMES[variant]
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduced = motionQuery.matches
    let w = 1, h = 1, spacing = 26
    let pulses: Pulse[] = []
    let arcs: Arc[] = []
    let raf = 0, last = 0, nextArc = 0, frozenT = 0
    let running = false, visible = true, shown = false

    const scrollOffset = () => (reduced || !theme.parallax ? 0 : window.scrollY * theme.parallax)

    const spawn = (t: number, scroll: number, age = 0): Pulse => {
      const life = 4.2 + Math.random() * 2.4
      return {
        x: spacing / 2 + Math.floor(Math.random() * Math.max(1, w / spacing)) * spacing,
        y: Math.round((scroll + Math.random() * h) / spacing) * spacing,
        born: t - (age < 0 ? life * (0.2 + 0.5 * Math.random()) : age * life),
        life,
        c: pickStatus(),
        maxR: spacing * (1.1 + Math.random() * 0.8),
      }
    }

    const seed = (t: number) => {
      const n = Math.min(14, Math.max(3, Math.round((w * h) / theme.density)))
      const scroll = scrollOffset()
      // Reduced motion: freeze rings part-way through so the still frame still reads.
      pulses = Array.from({ length: n }, () => spawn(t, scroll, reduced ? -1 : Math.random()))
      arcs = []
      frozenT = t
    }

    const draw = (now: number) => {
      const t = reduced ? frozenT : now / 1000
      const scroll = scrollOffset()
      ctx.clearRect(0, 0, w, h)

      // 1. Breathing dot matrix. Dots are batched into alpha buckets: one fill per bucket.
      const paths = Array.from({ length: BUCKETS }, () => new Path2D())
      const oy = -(scroll % spacing)
      for (let gy = oy; gy < h + spacing; gy += spacing) {
        const wy = gy + scroll
        for (let gx = spacing / 2; gx < w; gx += spacing) {
          const v = Math.sin(gx * 0.011 + t * 0.32) * Math.cos(wy * 0.009 - t * 0.21) + Math.sin((gx + wy) * 0.0045 + t * 0.17)
          let k = (v + 2) / 4
          k = k * k * (3 - 2 * k)
          const b = Math.min(BUCKETS - 1, (k * BUCKETS) | 0)
          const r = 0.7 + 0.75 * (b / (BUCKETS - 1))
          paths[b].rect(gx - r, gy - r, r * 2, r * 2)
        }
      }
      for (let b = 0; b < BUCKETS; b++) {
        ctx.fillStyle = rgba(theme.dot, theme.base + theme.amp * ((b + 1) / BUCKETS))
        ctx.fill(paths[b])
      }

      // 2. Readiness pulses.
      for (let i = 0; i < pulses.length; i++) {
        let p = pulses[i]
        let k = (t - p.born) / p.life
        let sy = p.y - scroll
        if (!reduced && (k >= 1 || sy < -90 || sy > h + 90)) {
          p = pulses[i] = spawn(t, scroll)
          k = 0
          sy = p.y - scroll
        }
        k = Math.min(Math.max(k, 0), 1)
        for (const d of [0, 0.28]) {
          const q = (k - d) / (1 - d)
          if (q <= 0 || q >= 1) continue
          ctx.strokeStyle = rgba(p.c, theme.ring * Math.pow(1 - q, 1.8))
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(p.x, sy, p.maxR * easeOut(q), 0, TAU)
          ctx.stroke()
        }
        const glow = Math.sin(Math.PI * k)
        ctx.fillStyle = rgba(p.c, 0.1 * glow)
        ctx.beginPath(); ctx.arc(p.x, sy, 9, 0, TAU); ctx.fill()
        ctx.fillStyle = rgba(p.c, 0.85 * glow)
        ctx.beginPath(); ctx.arc(p.x, sy, 2.6, 0, TAU); ctx.fill()
      }

      // 3. Light arcs travelling between live pulses.
      if (!reduced && t > nextArc) {
        nextArc = t + 1.8 + Math.random() * 1.8
        const live = pulses.filter(p => {
          const k = (t - p.born) / p.life
          const y = p.y - scroll
          return k > 0.05 && k < 0.6 && y > 0 && y < h
        })
        const maxD = Math.min(560, w * 0.6)
        for (let tries = 0; tries < 6 && live.length >= 2; tries++) {
          const a = live[(Math.random() * live.length) | 0]
          const b = live[(Math.random() * live.length) | 0]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (a !== b && d > 90 && d < maxD) {
            arcs.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, born: t, life: 2.8 })
            break
          }
        }
      }
      arcs = arcs.filter(a => t - a.born < a.life)
      for (const a of arcs) {
        const k = (t - a.born) / a.life
        const fade = Math.sin(Math.PI * k)
        const ay = a.ay - scroll, by = a.by - scroll
        const mx = (a.ax + a.bx) / 2
        const my = (ay + by) / 2 - Math.hypot(a.bx - a.ax, by - ay) * 0.3
        const at = (s: number): [number, number] => {
          const u = 1 - s
          return [u * u * a.ax + 2 * u * s * mx + s * s * a.bx, u * u * ay + 2 * u * s * my + s * s * by]
        }
        ctx.strokeStyle = rgba(theme.arc, 0.16 * fade)
        ctx.lineWidth = 1
        ctx.setLineDash([2, 5])
        ctx.beginPath(); ctx.moveTo(a.ax, ay); ctx.quadraticCurveTo(mx, my, a.bx, by); ctx.stroke()
        ctx.setLineDash([])
        const s = easeInOut(k)
        const s0 = Math.max(0, s - 0.16)
        ctx.strokeStyle = rgba(theme.arc, 0.55 * fade)
        ctx.lineWidth = 1.6
        ctx.beginPath()
        for (let j = 0; j <= 10; j++) {
          const [x, y] = at(s0 + ((s - s0) * j) / 10)
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        }
        ctx.stroke()
        const [hx, hy] = at(s)
        ctx.fillStyle = rgba(theme.arc, 0.8 * fade)
        ctx.beginPath(); ctx.arc(hx, hy, 2, 0, TAU); ctx.fill()
      }

      if (!shown) { shown = true; canvas.style.opacity = '1' }
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (now - last < 1000 / FPS) return
      last = now
      draw(now)
    }
    const start = () => {
      if (running || reduced || !visible || document.hidden) return
      running = true
      last = 0
      raf = requestAnimationFrame(frame)
    }
    const stop = () => { running = false; cancelAnimationFrame(raf) }

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      w = Math.max(1, r.width)
      h = Math.max(1, r.height)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      spacing = w < 640 ? 22 : 26
      const now = performance.now()
      seed(now / 1000)
      draw(now)
    }

    const onMotion = () => {
      reduced = motionQuery.matches
      stop()
      resize()
      start()
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    resize()
    start()

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start(); else stop()
    })
    io.observe(wrap)
    document.addEventListener('visibilitychange', onVisibility)
    motionQuery.addEventListener('change', onMotion)

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      motionQuery.removeEventListener('change', onMotion)
    }
  }, [variant])

  const light = variant === 'light'
  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden ${light ? 'fixed inset-0 z-0' : 'absolute inset-0'}`}
    >
      <div
        className="ambient-glow"
        style={{ width: '60vmax', height: '60vmax', left: '-18vmax', top: '-20vmax', background: `radial-gradient(closest-side, ${light ? 'rgba(14,98,94,.10)' : 'rgba(63,154,104,.22)'}, transparent)` }}
      />
      <div
        className="ambient-glow"
        style={{ width: '50vmax', height: '50vmax', right: '-16vmax', bottom: '-18vmax', animationDelay: '-11s', background: `radial-gradient(closest-side, ${light ? 'rgba(231,162,59,.10)' : 'rgba(243,197,121,.08)'}, transparent)` }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 block opacity-0 transition-opacity duration-[1200ms] ease-out" />
    </div>
  )
}
