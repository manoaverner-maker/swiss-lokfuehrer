import * as THREE from 'three'

const cache = new Map<string, THREE.Material>()

function cached<T extends THREE.Material>(key: string, make: () => T): T {
  let m = cache.get(key) as T | undefined
  if (!m) {
    m = make()
    cache.set(key, m)
  }
  return m
}

/** Glossy toy-like paint. */
export const paint = (color: string) =>
  cached(`paint:${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, metalness: 0.05, clearcoat: 0.7, clearcoatRoughness: 0.25 }))

export const glass = (color = '#1f2328') =>
  cached(`glass:${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.08, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 }))

export const metal = (color = '#5b6068') => cached(`metal:${color}`, () => new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.7 }))

export const matte = (color: string) => cached(`matte:${color}`, () => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0 }))

export const chrome = () => cached('chrome', () => new THREE.MeshStandardMaterial({ color: '#d9dde2', roughness: 0.15, metalness: 1 }))
