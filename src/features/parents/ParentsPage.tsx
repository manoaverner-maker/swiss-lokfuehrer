import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Screen } from '../../components/Screen'
import { ToyButton } from '../../components/ToyButton'
import { CapAvatar } from '../../components/CapAvatar'
import { Modal } from '../../components/Modal'
import { ProfileEditor, type ProfileDraft } from '../home/ProfileEditor'
import { useProfiles, capColors, type Profile } from '../../store/profiles'
import { useSettings } from '../../store/settings'
import { pickVoice, speechAvailable } from '../../audio/speech'
import { sfx } from '../../audio/engine'
import { trains } from '../../data/trains'
import type { Language } from '../../i18n'

let unlockedThisSession = false

const randomFactor = () => 6 + Math.floor(Math.random() * 7)
const makeQuestion = (): [number, number] => [randomFactor(), randomFactor()]

function Gate({ onOpen }: { onOpen: () => void }) {
  const { t } = useTranslation()
  const [[a, b]] = useState(makeQuestion)
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState(false)
  const press = (k: string) => {
    sfx.tap()
    setWrong(false)
    if (k === '⌫') setValue((v) => v.slice(0, -1))
    else if (value.length < 3) setValue((v) => v + k)
  }
  const submit = () => {
    if (Number(value) === a * b) {
      unlockedThisSession = true
      sfx.reward()
      onOpen()
    } else {
      sfx.error()
      setWrong(true)
      setValue('')
    }
  }
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 pt-4">
      <h2 className="text-2xl font-extrabold">🔒 {t('parents.gateTitle')}</h2>
      <p className="font-display text-3xl font-bold">{t('parents.gateQuestion', { a, b })}</p>
      <div className={`flex h-16 w-40 items-center justify-center rounded-2xl bg-white font-display text-4xl font-extrabold ${wrong ? 'ring-4 ring-rail' : ''}`}>{value || '·'}</div>
      {wrong && <p className="font-bold text-rail">{t('parents.gateWrong')}</p>}
      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0'].map((k) => (
          <button key={k} type="button" onClick={() => press(k)} className="h-16 w-16 rounded-2xl bg-white font-display text-3xl font-bold" style={{ boxShadow: 'var(--shadow-toy)' }}>
            {k}
          </button>
        ))}
        <button type="button" onClick={submit} className="h-16 w-16 rounded-2xl bg-alpine font-display text-2xl font-bold text-white" style={{ boxShadow: 'var(--shadow-toy)' }}>
          ✓
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel p-5">
      <h2 className="mb-3 text-2xl font-extrabold">{title}</h2>
      {children}
    </section>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-14 items-center justify-between gap-3 text-lg font-bold">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => {
          sfx.pop()
          onChange(!value)
        }}
        className={`relative h-10 w-18 rounded-full transition-colors ${value ? 'bg-alpine' : 'bg-black/20'}`}
      >
        <span className={`absolute top-1 h-8 w-8 rounded-full bg-white transition-all ${value ? 'left-9' : 'left-1'}`} />
      </button>
    </label>
  )
}

export function ParentsPage() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(unlockedThisSession)
  const { profiles, add, update, remove, resetProgress } = useProfiles()
  const settings = useSettings()
  const [editing, setEditing] = useState<Profile | 'new' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const lang = i18n.language as Language

  if (!open)
    return (
      <Screen title={t('parents.title')}>
        <Gate onOpen={() => setOpen(true)} />
      </Screen>
    )

  const save = (d: ProfileDraft) => {
    if (editing === 'new') add(d)
    else if (editing) update(editing.id, d)
    setEditing(null)
  }

  const voiceOk = (['en', 'fr'] as Language[]).map((l) => ({ l, ok: speechAvailable() && !!pickVoice(l) }))

  return (
    <Screen title={t('parents.title')}>
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {notice && <div className="rounded-2xl bg-alpine/20 p-3 font-bold">{notice}</div>}

        <Section title={`👥 ${t('parents.profiles')}`}>
          <div className="flex flex-col gap-3">
            {profiles.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-black/5 p-3">
                <CapAvatar color={p.cap} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-xl font-extrabold">{p.name}</div>
                  <div className="text-sm font-bold opacity-70">
                    {t(`profile.${p.mode}`)} · {p.language.toUpperCase()} · ⭐ {p.progress.stars} · 🃏 {p.progress.cards.length}
                  </div>
                </div>
                <ToyButton color="#fff" textColor="#2D3036" className="!min-h-12 !text-base" onClick={() => setEditing(p)}>
                  ✏️
                </ToyButton>
                <ToyButton
                  color="#FFF4D6"
                  textColor="#2D3036"
                  className="!min-h-12 !text-base"
                  onClick={() => {
                    if (window.confirm(t('parents.resetConfirm', { name: p.name }))) {
                      resetProgress(p.id)
                      setNotice(t('parents.resetDone'))
                    }
                  }}
                >
                  ↺ {t('parents.resetProgress')}
                </ToyButton>
                <ToyButton
                  color="#FDE2E2"
                  textColor="#B0040F"
                  className="!min-h-12 !text-base"
                  aria-label={t('common.delete')}
                  onClick={() => {
                    if (window.confirm(t('parents.deleteConfirm', { name: p.name }))) remove(p.id)
                  }}
                >
                  🗑️
                </ToyButton>
              </div>
            ))}
            <ToyButton color="#4CAF50" onClick={() => setEditing('new')}>
              + {t('parents.addProfile')}
            </ToyButton>
          </div>
        </Section>

        <Section title={`🔊 ${t('parents.sound')}`}>
          <Toggle label={t('parents.mute')} value={settings.soundOn} onChange={(v) => settings.set({ soundOn: v })} />
          <label className="flex min-h-14 items-center gap-3 text-lg font-bold">
            {t('parents.volume')}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.volume}
              onChange={(e) => settings.set({ volume: Number(e.target.value) })}
              onPointerUp={() => sfx.horn()}
              className="h-10 flex-1 accent-rail"
            />
          </label>
          <Toggle label={t('parents.music')} value={settings.musicOn} onChange={(v) => settings.set({ musicOn: v })} />
          <Toggle label={t('parents.speech')} value={settings.speechOn} onChange={(v) => settings.set({ speechOn: v })} />
          {voiceOk
            .filter((v) => !v.ok)
            .map((v) => (
              <p key={v.l} className="text-sm font-bold text-rail">
                {v.l.toUpperCase()}: {t('parents.voiceMissing')}
              </p>
            ))}
        </Section>

        <Section title={`🖼️ ${t('parents.credits')}`}>
          <p className="mb-3 text-sm opacity-70">{t('parents.creditsIntro')}</p>
          <ul className="flex flex-col gap-2 text-sm">
            {trains.flatMap((tr) =>
              tr.images
                .filter((im) => !im.placeholder)
                .map((im, i) => (
                  <li key={`${tr.id}${i}`} className="rounded-xl bg-black/5 p-2">
                    <b>{tr.nickname ?? tr.name} #{i + 1}</b> – {im.author} · {im.license} ·{' '}
                    <a href={im.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                      Wikimedia Commons
                    </a>
                  </li>
                )),
            )}
          </ul>
        </Section>

        <Section title={`ℹ️ ${t('parents.about')}`}>
          <p>{t('parents.aboutText')}</p>
          <p className="mt-2 text-sm opacity-70">{t('parents.dataNote')}</p>
        </Section>
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)}>
        {editing && (
          <ProfileEditor
            initial={editing === 'new' ? { name: '', mode: 'pro', language: lang, cap: capColors[profiles.length % capColors.length] } : editing}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </Screen>
  )
}
