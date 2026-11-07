import { z } from 'zod'

export const operators = ['SBB', 'BLS', 'RhB', 'MGB', 'zb', 'SOB', 'MOB', 'JB', 'PB', 'GGB', 'International'] as const
export const categories = ['locomotive', 'multiple_unit', 'rack_railway', 'shunter', 'historic', 'composition'] as const
export const gauges = ['standard', 'meter', 'other'] as const
export const eras = ['historic', 'classic', 'modern'] as const
export const rarities = ['common', 'rare', 'gold'] as const

const text = z.string().min(1)
const localized = z.object({ junior: text, pro: text })

const imageSchema = z.object({
  file: text, // path below public/, or "placeholder"
  author: text,
  license: text,
  sourceUrl: z.string(),
  placeholder: z.boolean().optional(),
})

export const trainSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: text,
  nickname: z.string().optional(),
  operator: z.enum(operators),
  category: z.enum(categories),
  gauge: z.enum(gauges),
  era: z.enum(eras),
  manufacturer: z.string().optional(),
  inService: z.object({ from: z.number().int(), to: z.number().int().optional() }),
  numberBuilt: z.number().int().positive().optional(),
  specs: z.object({
    maxSpeedKmh: z.number().positive().optional(),
    powerKw: z.number().positive().optional(),
    weightT: z.number().positive().optional(),
    lengthM: z.number().positive().optional(),
    seats: z.number().int().positive().optional(),
    electrification: z.string().optional(),
  }),
  routes: z.array(z.string()),
  funFacts: z.array(z.object({ en: text, fr: text, junior: z.boolean() })).min(1),
  description: z.object({ en: localized, fr: localized }),
  images: z.array(imageSchema).length(3),
  model: z.discriminatedUnion('type', [
    z.object({ type: z.literal('procedural'), preset: text, colors: z.record(z.string(), z.string()) }),
    z.object({ type: z.literal('gltf'), file: text }),
  ]),
  sound: z.string().optional(),
  rarity: z.enum(rarities),
  verified: z.boolean(),
  /** Names of spec fields that still need checking, when verified is false */
  unverifiedFields: z.array(z.string()).optional(),
  sources: z.array(z.string().url()).min(1),
})

export type Train = z.infer<typeof trainSchema>
export type Operator = (typeof operators)[number]
export type Category = (typeof categories)[number]
