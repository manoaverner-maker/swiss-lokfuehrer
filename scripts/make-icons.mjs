// Renders public/icons/icon.svg to the PNG sizes needed for the PWA and iOS (uses the preinstalled Playwright).
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? 'playwright')

const dir = join(import.meta.dirname, '..', 'public', 'icons')
const svg = readFileSync(join(dir, 'icon.svg'), 'utf8')
const targets = [
  { file: 'icon-192.png', size: 192, pad: 0 },
  { file: 'icon-512.png', size: 512, pad: 0 },
  { file: 'apple-touch-icon.png', size: 180, pad: 0, square: true },
  { file: 'icon-maskable-512.png', size: 512, pad: 0.12, square: true },
]
const browser = await chromium.launch()
const page = await browser.newPage()
for (const t of targets) {
  await page.setViewportSize({ width: t.size, height: t.size })
  const inner = t.size * (1 - t.pad * 2)
  // square: fill background so iOS/Android masks have no transparent corners
  const body = svg.replace('rx="112"', t.square ? 'rx="0"' : 'rx="112"')
  await page.setContent(`<html><body style="margin:0;background:${t.square ? '#ffd9a8' : 'transparent'};display:flex;align-items:center;justify-content:center;width:${t.size}px;height:${t.size}px">
    <div style="width:${inner}px;height:${inner}px">${body.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div></body></html>`)
  await page.screenshot({ path: join(dir, t.file), omitBackground: !t.square })
  console.log('wrote', t.file)
}
await browser.close()
