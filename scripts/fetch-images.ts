// Downloads the chosen Wikimedia Commons photos (scripts/image-picks.json), converts them to WebP
// and writes author / licence / source into each train JSON.
//
//   npx tsx scripts/fetch-images.ts            # all trains
//   npx tsx scripts/fetch-images.ts re460      # only some
//
// Uses the normal Commons file pages (not the API) and waits between requests to be polite.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const root = join(import.meta.dirname, '..')
const picks: Record<string, string[]> = JSON.parse(readFileSync(join(root, 'scripts', 'image-picks.json'), 'utf8'))
const outDir = join(root, 'public', 'images', 'trains')
mkdirSync(outDir, { recursive: true })

const UA = 'SwissLokfuehrerBuildScript/0.1 (offline kids app; credits stored with every image)'
const FREE = /^(cc0|cc[ -]by(-sa)?[ -]?\d|cc[ -]by(-sa)?$|public domain|pd|gfdl|attribution)/i
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function get(url: string, tries = 4): Promise<Response> {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (res.ok) return res
    if (res.status !== 429 && res.status < 500) throw new Error(`${res.status} ${url}`)
    await sleep(3000 * (i + 1))
  }
  throw new Error(`gave up: ${url}`)
}

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim()

async function fileInfo(title: string) {
  const pageUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_')).replace(/%3A/, ':')}`
  const html = await (await get(pageUrl)).text()
  const original = html.match(/<div class="fullMedia">.*?href="(https:\/\/upload\.wikimedia\.org\/[^"]+)"/s)?.[1]
  // Commons escapes "_" as "&#95;" inside class/id attributes
  const authorCell = html.match(/id="fileinfotpl(?:_|&#95;)aut"[^>]*>.*?<\/td>\s*<td[^>]*>(.*?)<\/td>/s)?.[1] ?? ''
  const author =
    decode(authorCell)
      .replace(/This file was uploaded with Commonist\.?/i, '')
      .replace(/(Unknown author)+/i, 'Unknown author')
      .trim()
      .slice(0, 120) || 'Unknown author'
  const license = decode(html.match(/class="licensetpl(?:_|&#95;)short"[^>]*>(.*?)<\/span>/s)?.[1] ?? '')
  if (!original) throw new Error(`no original file link for ${title}`)
  return { pageUrl, original, author, license }
}

function thumbUrl(original: string, width: number) {
  const m = original.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/(\w\/\w\w)\/(.+)$/)
  if (!m) return original
  const name = m[3]
  return `${m[1]}/thumb/${m[2]}/${name}/${width}px-${name}`
}

async function download(original: string, width: number) {
  try {
    return Buffer.from(await (await get(thumbUrl(original, width))).arrayBuffer())
  } catch {
    // file smaller than the requested width → take the original
    return Buffer.from(await (await get(original)).arrayBuffer())
  }
}

const only = process.argv.slice(2)
const problems: string[] = []

for (const [id, titles] of Object.entries(picks)) {
  if (only.length && !only.includes(id)) continue
  const jsonPath = join(root, 'src', 'data', 'trains', `${id}.json`)
  if (!existsSync(jsonPath)) {
    problems.push(`${id}: no train JSON yet`)
    continue
  }
  const train = JSON.parse(readFileSync(jsonPath, 'utf8'))
  const images = []
  for (const [i, title] of titles.entries()) {
    const info = await fileInfo(title)
    if (!FREE.test(info.license)) problems.push(`${id} #${i + 1}: licence "${info.license}" needs a manual check`)
    const base = `${id}-${i + 1}`
    const raw = existsSync(join(outDir, `${base}.webp`)) && process.env.REFRESH !== '1' ? null : await download(info.original, 1280)
    if (raw) await sharp(raw).rotate().resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 72 }).toFile(join(outDir, `${base}.webp`))
    if (raw) await sharp(raw).rotate().resize({ width: 480, height: 360, fit: 'cover', position: sharp.strategy.attention }).webp({ quality: 68 }).toFile(join(outDir, `${base}-sm.webp`))
    const previous = train.images?.[i] ?? {}
    images.push({
      file: `images/trains/${base}.webp`,
      thumb: `images/trains/${base}-sm.webp`,
      author: info.author,
      license: info.license || 'see source',
      sourceUrl: info.pageUrl,
      ...(previous.caption ? { caption: previous.caption } : {}),
    })
    console.log(`✓ ${base}  ${info.license}  ${info.author}`)
    await sleep(1500)
  }
  train.images = images
  writeFileSync(jsonPath, JSON.stringify(train, null, 2) + '\n')
}

if (problems.length) {
  console.log('\nPlease check:')
  for (const p of problems) console.log(' - ' + p)
}
