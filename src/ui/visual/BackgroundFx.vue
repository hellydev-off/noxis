<template>
  <div class="fx" aria-hidden="true">
    <canvas ref="canvasEl" class="particles" />
    <div class="fog" />
    <div class="streaks" />
    <div class="vignette" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasEl = ref(null)

let raf = 0
let dpr = 1
let w = 0
let h = 0
let ctx = null
let particles = []

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function resize() {
  const canvas = canvasEl.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  dpr = Math.min(2, window.devicePixelRatio || 1)
  w = Math.max(1, Math.floor(rect.width))
  h = Math.max(1, Math.floor(rect.height))

  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const count = Math.floor(Math.min(140, Math.max(70, (w * h) / 18000)))
  particles = new Array(count).fill(0).map(() => ({
    x: rand(0, w),
    y: rand(0, h),
    r: rand(0.6, 1.6),
    vx: rand(-0.12, 0.12),
    vy: rand(-0.08, 0.08),
    a: rand(0.08, 0.22),
    t: rand(0, Math.PI * 2),
    hue: Math.random() < 0.5 ? 'purple' : 'cyan',
  }))
}

function tick() {
  if (!ctx) {
    raf = requestAnimationFrame(tick)
    return
  }

  ctx.clearRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'lighter'

  for (const p of particles) {
    p.t += 0.012
    p.x += p.vx + Math.sin(p.t) * 0.02
    p.y += p.vy + Math.cos(p.t) * 0.02

    if (p.x < -20) p.x = w + 20
    if (p.x > w + 20) p.x = -20
    if (p.y < -20) p.y = h + 20
    if (p.y > h + 20) p.y = -20

    const color =
      p.hue === 'purple' ? `rgba(124, 58, 237, ${p.a})` : `rgba(0, 245, 255, ${p.a * 0.85})`
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalCompositeOperation = 'source-over'
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  resize()
  window.addEventListener('resize', resize, { passive: true })
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  cancelAnimationFrame(raf)
})
</script>

<style scoped>
.fx {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(160deg, var(--n-bg-0), var(--n-bg-1));
}

.particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.9;
  filter: blur(0.2px);
}

.fog {
  position: absolute;
  inset: -40% -20%;
  background:
    radial-gradient(900px 620px at 22% 28%, rgba(124, 58, 237, 0.14), transparent 55%),
    radial-gradient(820px 560px at 74% 34%, rgba(0, 245, 255, 0.10), transparent 58%),
    radial-gradient(740px 540px at 60% 78%, rgba(124, 58, 237, 0.10), transparent 62%),
    radial-gradient(860px 620px at 18% 82%, rgba(0, 245, 255, 0.06), transparent 62%);
  opacity: 0.95;
  filter: blur(22px);
  animation: drift 22s var(--n-ease) infinite alternate;
  transform: translate3d(0, 0, 0);
}

.streaks {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(110deg, transparent 0%, rgba(0, 245, 255, 0.08) 30%, transparent 55%),
    linear-gradient(110deg, transparent 0%, rgba(124, 58, 237, 0.09) 36%, transparent 62%);
  background-size: 120% 120%;
  opacity: 0.35;
  filter: blur(10px);
  mix-blend-mode: screen;
  animation: sweep 18s linear infinite;
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(closest-side at 50% 40%, transparent 0%, rgba(0, 0, 0, 0.55) 90%);
  pointer-events: none;
}

@keyframes drift {
  from {
    transform: translate3d(-1.5%, -0.6%, 0) scale(1.02);
  }
  to {
    transform: translate3d(1.5%, 0.8%, 0) scale(1.02);
  }
}

@keyframes sweep {
  from {
    transform: translateX(-12%) translateY(-6%) scale(1.08);
  }
  to {
    transform: translateX(12%) translateY(6%) scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fog,
  .streaks {
    animation: none;
  }
}
</style>

