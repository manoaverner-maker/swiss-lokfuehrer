import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../../components/Modal'
import { ToyButton } from '../../components/ToyButton'
import type { Train } from '../../data/schema'
import type { Language } from '../../i18n'
import { sfx } from '../../audio/engine'

const url = (path: string) => `${import.meta.env.BASE_URL}${path}`

/** Swipeable row of the 3 photos; tap opens a big view. Credits always shown small. */
export function PhotoGallery({ train, accent }: { train: Train; accent: string }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as Language
  const [open, setOpen] = useState<number | null>(null)
  const img = open !== null ? train.images[open] : null

  return (
    <>
      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
        {train.images.map((im, i) => (
          <figure key={i} className="panel w-[78%] max-w-sm shrink-0 snap-start overflow-hidden sm:w-80">
            {im.placeholder ? (
              <div className="flex h-44 items-center justify-center text-5xl" style={{ background: `repeating-linear-gradient(45deg, ${accent}18 0 14px, #fff 14px 28px)` }}>
                🖼️
              </div>
            ) : (
              <button
                type="button"
                className="block h-44 w-full"
                onClick={() => {
                  sfx.pop()
                  setOpen(i)
                }}
              >
                <img src={url(im.thumb ?? im.file)} alt={im.caption?.[lang] ?? train.name} loading="lazy" className="h-full w-full object-cover" />
              </button>
            )}
            <figcaption className="px-3 py-2 text-[11px] leading-tight opacity-70">
              {im.caption && <span className="mb-0.5 block text-xs font-bold opacity-100">{im.caption[lang]}</span>}
              {im.placeholder ? t('lexicon.photoSoon') : t('photo.by', { author: im.author, license: im.license })}
            </figcaption>
          </figure>
        ))}
      </div>
      <Modal open={img !== null} onClose={() => setOpen(null)}>
        {img && (
          <div className="flex flex-col gap-3">
            <img src={url(img.file)} alt={img.caption?.[lang] ?? train.name} className="max-h-[70vh] w-full rounded-2xl object-contain" />
            {img.caption && <p className="font-bold">{img.caption[lang]}</p>}
            <p className="text-xs opacity-70">
              {t('photo.by', { author: img.author, license: img.license })} · Wikimedia Commons
            </p>
            <ToyButton color="#E9ECEF" textColor="#2D3036" sound="back" onClick={() => setOpen(null)}>
              {t('photo.close')}
            </ToyButton>
          </div>
        )}
      </Modal>
    </>
  )
}
