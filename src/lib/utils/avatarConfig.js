/**
 * Speelse avatar-opties voor medewerkers.
 * Elke avatar heeft een uniek id, emoji, label en accentkleur.
 */
export const AVATARS = [
  // Dieren
  { id: 'vos', emoji: '\uD83E\uDD8A', label: 'Vos', color: '#FF6B35' },
  { id: 'uil', emoji: '\uD83E\uDD89', label: 'Uil', color: '#8B5CF6' },
  { id: 'beer', emoji: '\uD83D\uDC3B', label: 'Beer', color: '#92400E' },
  { id: 'kat', emoji: '\uD83D\uDC31', label: 'Kat', color: '#F59E0B' },
  { id: 'hond', emoji: '\uD83D\uDC36', label: 'Hond', color: '#D97706' },
  { id: 'konijn', emoji: '\uD83D\uDC30', label: 'Konijn', color: '#EC4899' },
  { id: 'panda', emoji: '\uD83D\uDC3C', label: 'Panda', color: '#374151' },
  { id: 'pinguin', emoji: '\uD83D\uDC27', label: 'Pingu\u00EFn', color: '#1E40AF' },
  { id: 'dolfijn', emoji: '\uD83D\uDC2C', label: 'Dolfijn', color: '#0EA5E9' },
  { id: 'vlinder', emoji: '\uD83E\uDD8B', label: 'Vlinder', color: '#A855F7' },
  { id: 'eekhoorn', emoji: '\uD83D\uDC3F\uFE0F', label: 'Eekhoorn', color: '#B45309' },
  { id: 'schildpad', emoji: '\uD83D\uDC22', label: 'Schildpad', color: '#059669' },
  // Planten & natuur
  { id: 'bloem', emoji: '\uD83C\uDF3B', label: 'Zonnebloem', color: '#EAB308' },
  { id: 'cactus', emoji: '\uD83C\uDF35', label: 'Cactus', color: '#16A34A' },
  { id: 'boom', emoji: '\uD83C\uDF33', label: 'Boom', color: '#15803D' },
  { id: 'paddestoel', emoji: '\uD83C\uDF44', label: 'Paddenstoel', color: '#DC2626' },
  // Voorwerpen & symbolen
  { id: 'raket', emoji: '\uD83D\uDE80', label: 'Raket', color: '#EF4444' },
  { id: 'ster', emoji: '\u2B50', label: 'Ster', color: '#F59E0B' },
  { id: 'regenboog', emoji: '\uD83C\uDF08', label: 'Regenboog', color: '#8B5CF6' },
  { id: 'boek', emoji: '\uD83D\uDCDA', label: 'Boeken', color: '#0369A1' },
  { id: 'lamp', emoji: '\uD83D\uDCA1', label: 'Idee', color: '#FBBF24' },
  { id: 'kompas', emoji: '\uD83E\uDDED', label: 'Kompas', color: '#0891B2' },
  { id: 'diamant', emoji: '\uD83D\uDC8E', label: 'Diamant', color: '#7C3AED' },
  { id: 'bliksem', emoji: '\u26A1', label: 'Bliksem', color: '#F59E0B' },
]

/**
 * Zoek een avatar op basis van ID.
 * @param {string} avatarId
 * @returns {{ id: string, emoji: string, label: string, color: string } | null}
 */
export function getAvatarById(avatarId) {
  return AVATARS.find((a) => a.id === avatarId) || null
}

/**
 * Geeft de initialen van een naam terug (fallback als er geen avatar is).
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
