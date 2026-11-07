import type { Operator } from './schema'

/** Accent colours per railway company (own palette, no logos). */
export const operatorColors: Record<Operator, { main: string; accent: string; fullName: string }> = {
  SBB: { main: '#E30613', accent: '#2D3036', fullName: 'Swiss Federal Railways' },
  BLS: { main: '#5BA145', accent: '#5E6F7B', fullName: 'BLS' },
  RhB: { main: '#C8102E', accent: '#F4F1EA', fullName: 'Rhaetian Railway' },
  MGB: { main: '#D2232A', accent: '#FFFFFF', fullName: 'Matterhorn Gotthard Bahn' },
  zb: { main: '#2A5DA8', accent: '#9AA5AF', fullName: 'Zentralbahn' },
  SOB: { main: '#8A8D3F', accent: '#2D3036', fullName: 'Südostbahn' },
  MOB: { main: '#1F3A6E', accent: '#C9A227', fullName: 'Montreux–Oberland Bernois' },
  JB: { main: '#B4282E', accent: '#E6B800', fullName: 'Jungfraubahn' },
  PB: { main: '#B22222', accent: '#FFFFFF', fullName: 'Pilatus-Bahnen' },
  GGB: { main: '#C0392B', accent: '#ECECEC', fullName: 'Gornergrat Bahn' },
  International: { main: '#3A5BA0', accent: '#C9CED6', fullName: 'International' },
}
