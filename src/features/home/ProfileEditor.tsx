import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { CapAvatar } from '../../components/CapAvatar'
import { ToyButton } from '../../components/ToyButton'
import { capColors, type Mode, type Profile } from '../../store/profiles'
import { languages, type Language } from '../../i18n'
import { sfx } from '../../audio/engine'

export type ProfileDraft = Pick<Profile, 'name' | 'mode' | 'language' | 'cap'>

/** Create / edit a driver profile. Big choices, little text. */
export function ProfileEditor({ initial, onSave, onCancel }: { initial: ProfileDraft; onSave: (d: ProfileDraft) => void; onCancel: () => void }) {
  const { t } = useTranslation()
  const [d, setD] = useState(initial)
  const set = (patch: Partial<ProfileDraft>) => {
    sfx.pop()
    setD((x) => ({ ...x, ...patch }))
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <motion.div key={d.cap} initial={{ rotate: -15, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }}>
          <CapAvatar color={d.cap} size={88} />
        </motion.div>
        <h2 className="text-3xl font-extrabold">{t('profile.title')}</h2>
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-display text-lg font-bold">{t('profile.name')}</span>
        <input
          className="h-16 rounded-2xl border-4 border-sky/60 bg-white px-4 font-display text-2xl outline-none focus:border-sky-deep"
          value={d.name}
          maxLength={16}
          placeholder={t('profile.namePlaceholder')}
          onChange={(e) => setD((x) => ({ ...x, name: e.target.value }))}
        />
      </label>

      <div>
        <span className="font-display text-lg font-bold">{t('profile.cap')}</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {capColors.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              aria-pressed={d.cap === c}
              onClick={() => set({ cap: c })}
              className="h-16 w-16 rounded-full border-4 transition-transform"
              style={{ background: c, borderColor: d.cap === c ? '#2D3036' : 'white', transform: d.cap === c ? 'scale(1.1)' : undefined }}
            />
          ))}
        </div>
      </div>

      <div>
        <span className="font-display text-lg font-bold">{t('profile.mode')}</span>
        <div className="mt-1 grid grid-cols-2 gap-3">
          {(['junior', 'pro'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={d.mode === m}
              onClick={() => set({ mode: m })}
              className={`flex flex-col items-center gap-1 rounded-3xl border-4 p-3 text-center ${d.mode === m ? 'border-rail bg-rail/10' : 'border-transparent bg-black/5'}`}
            >
              <span className="text-5xl" aria-hidden="true">{m === 'junior' ? '🧸' : '🏆'}</span>
              <span className="font-display text-2xl font-extrabold">{t(`profile.${m}`)}</span>
              <span className="text-sm leading-tight">{t(`profile.${m}Hint`)}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="font-display text-lg font-bold">{t('profile.language')}</span>
        <div className="mt-1 flex gap-3">
          {languages.map((l: Language) => (
            <button
              key={l}
              type="button"
              aria-pressed={d.language === l}
              onClick={() => set({ language: l })}
              className={`h-16 flex-1 rounded-2xl border-4 font-display text-2xl font-extrabold ${d.language === l ? 'border-rail bg-rail text-white' : 'border-transparent bg-black/5'}`}
            >
              {l === 'en' ? 'English' : 'Français'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <ToyButton color="#E9ECEF" textColor="#2D3036" sound="back" onClick={onCancel}>
          {t('common.cancel')}
        </ToyButton>
        <ToyButton color="#4CAF50" sound="reward" disabled={!d.name.trim()} onClick={() => onSave({ ...d, name: d.name.trim() })}>
          ✓ {t('common.save')}
        </ToyButton>
      </div>
    </div>
  )
}
