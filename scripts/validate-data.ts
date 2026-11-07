// Validates every train JSON with the Zod schema. Exits non-zero on error, so `npm run build` fails.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { trainSchema } from '../src/data/schema.ts'

const dir = join(import.meta.dirname, '..', 'src', 'data', 'trains')
let errors = 0
const ids = new Set<string>()
const files = readdirSync(dir).filter((f) => f.endsWith('.json'))

for (const file of files) {
  const raw = JSON.parse(readFileSync(join(dir, file), 'utf8'))
  const res = trainSchema.safeParse(raw)
  if (!res.success) {
    errors++
    console.error(`✗ ${file}`)
    for (const issue of res.error.issues) console.error(`   ${issue.path.join('.')}: ${issue.message}`)
    continue
  }
  if (`${res.data.id}.json` !== file) { errors++; console.error(`✗ ${file}: id "${res.data.id}" does not match file name`) }
  if (ids.has(res.data.id)) { errors++; console.error(`✗ ${file}: duplicate id`) }
  ids.add(res.data.id)
}

console.log(`Checked ${files.length} trains, ${errors} error(s).`)
if (errors) process.exit(1)
