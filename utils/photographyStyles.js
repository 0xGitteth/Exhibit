export const photographyStyles = [
  { id: 'portrait', label: 'Portrait' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'boudoir', label: 'Boudoir', autoTrigger: ['artistic_nudity'] },
  { id: 'art_nude', label: 'Art Nude', autoTrigger: ['artistic_nudity'] },
  { id: 'street', label: 'Street' },
  { id: 'landscape', label: 'Landscape' },
  { id: 'nature', label: 'Nature' },
  { id: 'conceptual', label: 'Conceptual' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'fine_art', label: 'Fine Art' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'sport', label: 'Sport' },
  { id: 'advertising', label: 'Advertising' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'documentary', label: 'Documentary' },
  { id: 'travel', label: 'Travel' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'macro', label: 'Macro' },
  { id: 'wildlife', label: 'Wildlife' },
  { id: 'food', label: 'Food' },
  { id: 'product', label: 'Product' },
  { id: 'automotive', label: 'Automotive' },
  { id: 'event', label: 'Event' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'maternity', label: 'Maternity' },
  { id: 'family', label: 'Family' },
  { id: 'children', label: 'Children' },
  { id: 'pet', label: 'Pet' },
  { id: 'black_white', label: 'Black & White' },
  { id: 'abstract', label: 'Abstract' },
  { id: 'surreal', label: 'Surreal' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'candid', label: 'Candid' },
  { id: 'glamour', label: 'Glamour' },
];

const pastelTone = (color, base) => ({
  gradient: `from-${color}-50 via-${color}-100 to-${color}-200`,
  text: `text-${color}-900`,
  border: `border-${color}-100`,
  ring: `ring-${color}-200/70`,
  base,
});

const styleToneMap = {
  portrait: pastelTone('amber', '#fbbf24'),
  fashion: pastelTone('fuchsia', '#d946ef'),
  boudoir: pastelTone('rose', '#f43f5e'),
  art_nude: pastelTone('red', '#ef4444'),
  street: pastelTone('slate', '#64748b'),
  landscape: pastelTone('emerald', '#10b981'),
  nature: pastelTone('green', '#22c55e'),
  conceptual: pastelTone('violet', '#8b5cf6'),
  editorial: pastelTone('sky', '#0ea5e9'),
  fine_art: pastelTone('purple', '#a855f7'),
  wedding: pastelTone('pink', '#ec4899'),
  sport: pastelTone('blue', '#3b82f6'),
  advertising: pastelTone('cyan', '#06b6d4'),
  beauty: {
    gradient: 'from-fuchsia-50 via-pink-100 to-fuchsia-200',
    text: 'text-fuchsia-900',
    border: 'border-fuchsia-100',
    ring: 'ring-fuchsia-200/70',
    base: '#c026d3',
  },
  lifestyle: pastelTone('orange', '#f97316'),
  documentary: pastelTone('neutral', '#737373'),
  travel: pastelTone('indigo', '#6366f1'),
  architecture: pastelTone('stone', '#78716c'),
  macro: pastelTone('lime', '#84cc16'),
  wildlife: {
    gradient: 'from-green-50 via-lime-100 to-green-200',
    text: 'text-green-900',
    border: 'border-green-100',
    ring: 'ring-green-200/70',
    base: '#15803d',
  },
  food: pastelTone('yellow', '#eab308'),
  product: pastelTone('teal', '#14b8a6'),
  automotive: {
    gradient: 'from-orange-50 via-red-100 to-orange-200',
    text: 'text-red-900',
    border: 'border-orange-100',
    ring: 'ring-orange-200/70',
    base: '#dc2626',
  },
  event: {
    gradient: 'from-rose-50 via-amber-100 to-rose-200',
    text: 'text-rose-900',
    border: 'border-amber-100',
    ring: 'ring-amber-200/70',
    base: '#fb7185',
  },
  corporate: {
    gradient: 'from-cyan-50 via-blue-100 to-cyan-200',
    text: 'text-cyan-900',
    border: 'border-cyan-100',
    ring: 'ring-cyan-200/70',
    base: '#0891b2',
  },
  maternity: {
    gradient: 'from-rose-50 via-purple-100 to-rose-200',
    text: 'text-purple-900',
    border: 'border-purple-100',
    ring: 'ring-purple-200/70',
    base: '#c084fc',
  },
  family: {
    gradient: 'from-yellow-50 via-amber-100 to-yellow-200',
    text: 'text-amber-900',
    border: 'border-amber-100',
    ring: 'ring-amber-200/70',
    base: '#fcd34d',
  },
  children: {
    gradient: 'from-sky-50 via-cyan-100 to-sky-200',
    text: 'text-sky-900',
    border: 'border-sky-100',
    ring: 'ring-sky-200/70',
    base: '#38bdf8',
  },
  pet: {
    gradient: 'from-emerald-50 via-teal-100 to-emerald-200',
    text: 'text-emerald-900',
    border: 'border-emerald-100',
    ring: 'ring-emerald-200/70',
    base: '#34d399',
  },
  black_white: pastelTone('gray', '#6b7280'),
  abstract: {
    gradient: 'from-indigo-50 via-violet-100 to-indigo-200',
    text: 'text-indigo-900',
    border: 'border-indigo-100',
    ring: 'ring-indigo-200/70',
    base: '#7c3aed',
  },
  surreal: {
    gradient: 'from-pink-50 via-violet-100 to-pink-200',
    text: 'text-pink-900',
    border: 'border-pink-100',
    ring: 'ring-pink-200/70',
    base: '#f472b6',
  },
  vintage: {
    gradient: 'from-amber-50 via-orange-100 to-amber-200',
    text: 'text-amber-900',
    border: 'border-amber-100',
    ring: 'ring-amber-200/70',
    base: '#d97706',
  },
  minimalist: pastelTone('zinc', '#71717a'),
  candid: {
    gradient: 'from-teal-50 via-cyan-100 to-teal-200',
    text: 'text-cyan-900',
    border: 'border-teal-100',
    ring: 'ring-teal-200/70',
    base: '#22d3ee',
  },
  glamour: {
    gradient: 'from-red-50 via-rose-100 to-red-200',
    text: 'text-red-900',
    border: 'border-rose-100',
    ring: 'ring-red-200/70',
    base: '#f87171',
  },
};

const tonePalette = Object.values(styleToneMap);

const hashStyle = (id) => {
  return id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

export const getStyleTone = (styleId) => {
  if (!styleId) return tonePalette[0];
  const mapped = styleToneMap[styleId];
  if (mapped) return mapped;
  const index = Math.abs(hashStyle(styleId)) % tonePalette.length;
  return tonePalette[index];
};

export const getStylePillClasses = (styleId, { active } = {}) => {
  const tone = getStyleTone(styleId);
  const emphasis = active ? `ring-2 ${tone.ring} shadow-md` : 'shadow-sm';
  return `bg-gradient-to-r ${tone.gradient} ${tone.text} border ${tone.border} ${emphasis} rounded-full transition-all duration-150`;
};
