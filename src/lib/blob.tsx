// lib/blob.ts
//
// Organic morph: a single smoothly-pinched "petal" that never exceeds the
// base circle radius (no bean overshoot, no sharp crescent cut), rotating
// gently, occasionally rolling into the three-lobe trefoil.
//
// IMPORTANT: the `tie` / `tieHold` / `untie` / `settle` phases below are the
// trefoil formation and are intentionally left byte-for-byte identical to
// the original formula — this is the part that was already right.

const TAU = Math.PI * 2;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function bell(t: number): number {
  return Math.sin(Math.PI * clamp(t, 0, 1));
}

// Where the pinch point sits for the two "resting" orientations, and how
// pointed the tip is. Raise PINCH_SHARPNESS for a more needle-like tip,
// lower it for a rounder, softer teardrop.
const ANGLE_A = 0.35 * Math.PI;
const ANGLE_B = ANGLE_A + Math.PI;
const PINCH_SHARPNESS = 1.8;

export const PHASES = [
  { id: "rest", label: "Gentle wobble", dur: 1.2 },
  { id: "pinchA", label: "Pinch to a point", dur: 1.1 },
  { id: "pinchAHold", label: "Teardrop", dur: 0.5 },
  { id: "healA", label: "Back to circle", dur: 0.8 },
  { id: "breathe", label: "Breathe", dur: 0.6 },
  { id: "twist", label: "Tip travels around", dur: 1.5 },
  { id: "pinchBHold", label: "Teardrop, other side", dur: 0.5 },
  { id: "healB", label: "Back to circle", dur: 0.8 },
  { id: "spin", label: "Rotating tail", dur: 1.6 },
  { id: "tie", label: "Rolling / tying into three", dur: 1.6 },
  { id: "tieHold", label: "Tied", dur: 0.7 },
  { id: "untie", label: "Untying", dur: 1.2 },
  { id: "settle", label: "Settle", dur: 0.8 },
];

export const LOOP = PHASES.reduce((s, p) => s + p.dur, 0);

export function phaseAt(time: number): { id: string; label: string; p: number } {
  const t = ((time % LOOP) + LOOP) % LOOP;
  let acc = 0;
  for (let i = 0; i < PHASES.length; i++) {
    const ph = PHASES[i];
    if (t < acc + ph.dur || i === PHASES.length - 1) {
      return {
        id: ph.id,
        label: ph.label,
        p: clamp((t - acc) / ph.dur, 0, 1),
      };
    }
    acc += ph.dur;
  }
  return { id: "rest", label: "Rest", p: 0 };
}

function blobState(time: number) {
  const T = ((time % LOOP) + LOOP) % LOOP;
  const ph = phaseAt(T);
  const p = ph.p;
  const cycle = T / LOOP;
  const drift = TAU * cycle;
  const wind = -TAU * 6 * cycle;

  const st = {
    // Contained pinch system (organic phases) — radius only ever shrinks
    // toward the center, it never grows past the base circle.
    pinch: 0,
    pinchAngle: ANGLE_A,
    sharpness: PINCH_SHARPNESS,
    // Trefoil system (tie group) — untouched from the original.
    lobe: 0.025,
    egg: 0.008,
    lobeAngle: -drift * 0.35,
    tie: 0,
    wind: wind,
    spin: drift,
    scale: 1,
    organic: 0.25,
  };
  let extra = 0;

  switch (ph.id) {
    case "rest":
      st.pinch = 0.06 + 0.03 * Math.sin(p * Math.PI);
      st.pinchAngle = ANGLE_A - drift * 0.35;
      break;
    case "pinchA":
      st.pinch = 0.6 * easeInOut(p);
      st.pinchAngle = ANGLE_A;
      break;
    case "pinchAHold":
      st.pinch = 0.6 + 0.03 * Math.sin(p * Math.PI * 2);
      st.pinchAngle = ANGLE_A;
      break;
    case "healA":
      st.pinch = 0.6 * (1 - easeInOut(p));
      st.pinchAngle = ANGLE_A;
      break;
    case "breathe":
      st.pinch = 0.05 * bell(p);
      st.pinchAngle = ANGLE_A;
      break;
    case "twist":
      // The tip travels smoothly from one side to the other, dipping
      // slightly in depth mid-way rather than ever poking outward.
      st.pinch = 0.55 - 0.18 * Math.sin(p * Math.PI);
      st.pinchAngle = mix(ANGLE_A, ANGLE_B, easeInOut(p));
      break;
    case "pinchBHold":
      st.pinch = 0.6 + 0.03 * Math.sin(p * Math.PI * 2);
      st.pinchAngle = ANGLE_B;
      break;
    case "healB":
      st.pinch = 0.6 * (1 - easeInOut(p));
      st.pinchAngle = ANGLE_B;
      break;
    case "spin":
      // A softer tail continuously rotating a full turn around the ring,
      // contained the whole time — replaces the old overshooting bean.
      st.pinch = 0.32 + 0.08 * bell(p);
      st.pinchAngle = ANGLE_A + TAU * easeInOut(p);
      extra = TAU * easeInOut(p);
      break;

    // --- Trefoil group: unchanged from the original formula. ---
    case "tie": {
      const w = easeInOut(p);
      st.tie = w;
      st.lobe = mix(0.19, 0.05, w);
      st.egg = mix(0.06, 0, w);
      st.organic = 1 - 0.75 * w;
      st.scale = mix(1, 1.06, w);
      extra = TAU + TAU * easeInOut(p);
      break;
    }
    case "tieHold":
      st.tie = 1;
      st.lobe = 0.05;
      st.egg = 0;
      st.organic = 0.25;
      st.scale = 1.06 + 0.015 * Math.sin(p * Math.PI * 2);
      extra = TAU * 2;
      break;
    case "untie": {
      const w2 = 1 - easeInOut(p);
      st.tie = w2;
      st.lobe = mix(0.155, 0.05, w2);
      st.egg = mix(0.045, 0, w2);
      st.organic = 1 - 0.75 * w2;
      st.scale = mix(1, 1.06, w2);
      extra = TAU * 2;
      break;
    }
    case "settle":
      st.lobe = 0.155 + 0.04 * (1 - easeOut(p)) * Math.cos(p * Math.PI * 3);
      st.scale = 1 + 0.02 * (1 - easeOut(p)) * Math.cos(p * Math.PI * 3);
      extra = TAU * 2;
      break;
  }

  st.spin = drift + extra;
  return st;
}

function wobble(t: number, cycle: number) {
  const a = TAU * cycle;
  return 0.024 * Math.sin(3 * t + 3 * a) + 0.016 * Math.sin(5 * t - 2 * a);
}

export function samplePoints(time: number, opts?: { samples?: number; size?: number; radius?: number }) {
  const samples = opts?.samples || 72;
  const size = opts?.size || 400;
  const radius = opts?.radius || 184;

  const st = blobState(time);
  const cycle = (((time % LOOP) + LOOP) % LOOP) / LOOP;

  const cx = size / 2;
  const cy = size / 2;
  const cs = Math.cos(st.spin);
  const sn = Math.sin(st.spin);
  const w = st.tie;
  const norm = 1 / (1 + 2 * w);

  const pts = new Array(samples);
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * TAU;

    // Base is always the plain unit circle — no crescent bite.
    const baseX = Math.cos(t);
    const baseY = Math.sin(t);

    // Trefoil-group warp (lobe/egg/organic), unchanged.
    const f =
      1 +
      (st.lobe * Math.cos(2 * (t - st.lobeAngle)) +
        st.egg * Math.cos(t - st.lobeAngle * 0.5) +
        wobble(t, cycle) * st.organic);

    // Contained pinch — only ever multiplies radius down, never up, so the
    // shape can't overshoot the base circle the way the old crescent/lobe
    // formula could.
    const pinchFalloff = Math.pow((1 + Math.cos(t - st.pinchAngle)) / 2, st.sharpness);
    const pinchMul = 1 - st.pinch * (1 - pinchFalloff);

    let x = baseX * f * pinchMul;
    let y = baseY * f * pinchMul;

    if (w > 1e-4) {
      const a = -2 * t + st.wind;
      x = (x + 2 * w * Math.cos(a)) * norm;
      y = (y + 2 * w * Math.sin(a)) * norm;
    }

    const r = radius * st.scale;
    pts[i] = {
      x: cx + (x * cs - y * sn) * r,
      y: cy + (x * sn + y * cs) * r,
    };
  }
  return pts;
}

function catmullRomPath(pts: Array<{ x: number; y: number }>): string {
  const n = pts.length;
  let d = "M" + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);

  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d +=
      "C" +
      c1x.toFixed(1) + " " + c1y.toFixed(1) + " " +
      c2x.toFixed(1) + " " + c2y.toFixed(1) + " " +
      p2.x.toFixed(1) + " " + p2.y.toFixed(1);
  }
  return d + "Z";
}

export function blobPathAt(time: number, opts?: { size?: number; radius?: number; samples?: number }): string {
  return catmullRomPath(samplePoints(time, opts));
}