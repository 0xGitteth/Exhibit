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

const colorPalette = [
  { gradient: 'from-white via-serenity-50 to-serenity-100', text: 'text-midnight-900', border: 'border-serenity-100', ring: 'ring-serenity-200/70' },
  { gradient: 'from-serenity-50 via-serenity-100 to-serenity-200', text: 'text-midnight-900', border: 'border-serenity-100/80', ring: 'ring-serenity-200/70' },
  { gradient: 'from-sky-50 via-sky-100 to-sky-200', text: 'text-midnight-900', border: 'border-sky-100', ring: 'ring-sky-200/70' },
  { gradient: 'from-serenity-100 via-serenity-200 to-serenity-300', text: 'text-midnight-900', border: 'border-serenity-200', ring: 'ring-serenity-300/60' },
  { gradient: 'from-slate-50 via-serenity-50 to-slate-200', text: 'text-midnight-900', border: 'border-serenity-100', ring: 'ring-serenity-200/60' },
  { gradient: 'from-sky-100 via-serenity-200 to-sky-300', text: 'text-midnight-900', border: 'border-sky-100', ring: 'ring-serenity-300/60' },
  { gradient: 'from-white/90 via-slate-100 to-serenity-100', text: 'text-midnight-900', border: 'border-serenity-100/80', ring: 'ring-serenity-200/60' },
  { gradient: 'from-midnight-900/20 via-midnight-800/10 to-serenity-200/80', text: 'text-midnight-900', border: 'border-midnight-100/40', ring: 'ring-serenity-300/70' },
  { gradient: 'from-midnight-800/40 via-midnight-700/40 to-serenity-300/80', text: 'text-serenity-50', border: 'border-midnight-200/50', ring: 'ring-serenity-400/70' },
  { gradient: 'from-serenity-200 via-serenity-300 to-serenity-400', text: 'text-midnight-900', border: 'border-serenity-300', ring: 'ring-serenity-400/60' },
  { gradient: 'from-sky-200 via-serenity-200 to-serenity-300', text: 'text-midnight-900', border: 'border-serenity-200', ring: 'ring-serenity-300/60' },
  { gradient: 'from-serenity-50 via-white to-serenity-100', text: 'text-midnight-900', border: 'border-serenity-100', ring: 'ring-serenity-200/70' },
];

const styleColorMap = {
  fashion: colorPalette[0],
  portrait: colorPalette[1],
  boudoir: colorPalette[2],
  art_nude: colorPalette[2],
  street: colorPalette[3],
  landscape: colorPalette[4],
  nature: colorPalette[3],
  conceptual: colorPalette[5],
  editorial: colorPalette[4],
  fine_art: colorPalette[5],
  wedding: colorPalette[8],
  sport: colorPalette[7],
  advertising: colorPalette[6],
  beauty: colorPalette[10],
  lifestyle: colorPalette[11],
  documentary: colorPalette[6],
  travel: colorPalette[1],
  architecture: colorPalette[9],
  macro: colorPalette[2],
  wildlife: colorPalette[9],
  food: colorPalette[8],
  product: colorPalette[4],
  automotive: colorPalette[7],
  event: colorPalette[6],
  corporate: colorPalette[11],
  maternity: colorPalette[0],
  family: colorPalette[0],
  children: colorPalette[10],
  pet: colorPalette[9],
  black_white: colorPalette[11],
  abstract: colorPalette[5],
  surreal: colorPalette[5],
  vintage: colorPalette[8],
  minimalist: colorPalette[11],
  candid: colorPalette[1],
  glamour: colorPalette[10],
};

const hashStyle = (id) => {
  return id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

export const getStyleTone = (styleId) => {
  if (!styleId) return colorPalette[0];
  const mapped = styleColorMap[styleId];
  if (mapped) return mapped;
  const index = Math.abs(hashStyle(styleId)) % colorPalette.length;
  return colorPalette[index];
};

export const getStylePillClasses = (styleId, { active } = {}) => {
  const tone = getStyleTone(styleId);
  const emphasis = active ? `ring-2 ${tone.ring} shadow-md` : 'shadow-sm';
  return `bg-gradient-to-r ${tone.gradient} ${tone.text} border ${tone.border} ${emphasis} rounded-full transition-all duration-150`;
};
