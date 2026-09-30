import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Vector3 } from 'three'

/** Small deterministic PRNG so the island looks the same on every visit. */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Y rotation that turns an object's +z face toward a target on the ground plane. */
export function faceToward(from: [number, number], to: [number, number]) {
  return Math.atan2(to[0] - from[0], to[1] - from[1])
}

/** Flat ribbon following a smooth curve through (x, z) points — used for paths and roads. */
export function ribbonGeometry(points: [number, number][], width: number, y: number, samples = 40) {
  const curve = new CatmullRomCurve3(points.map(([x, z]) => new Vector3(x, y, z)))
  const positions: number[] = []
  const indices: number[] = []
  const half = width / 2
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const p = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t)
    const nx = -tangent.z
    const nz = tangent.x
    positions.push(p.x + nx * half, y, p.z + nz * half, p.x - nx * half, y, p.z - nz * half)
    if (i < samples) {
      const a = i * 2
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

/** Distance from point p to the segment ab, all on the ground plane. */
export function distanceToSegment(p: [number, number], a: [number, number], b: [number, number]) {
  const [px, pz] = p
  const [ax, az] = a
  const [bx, bz] = b
  const dx = bx - ax
  const dz = bz - az
  const lengthSq = dx * dx + dz * dz
  const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lengthSq))
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
}
