// ✏️ Optional personal settings.
// The kids create their own profiles in the app on first start, so their names stay on the iPad only.
export const personal = {
  /** Optional pre-made profiles. Leave empty to let the kids create their own. */
  kids: [] as { name: string; age: number; defaultMode: 'junior' | 'pro' }[],
  defaultLanguage: 'en' as 'en' | 'fr',
  /** Shown in the hidden surprise corner (Phase 5). */
  secretMessage: '',
  secretPhoto: null as string | null,
}
