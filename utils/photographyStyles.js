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
  { gradient: 'from-rose-50 via-rose-100 to-rose-200', text: 'text-rose-900', border: 'border-rose-100', ring: 'ring-rose-200/70' },
  { gradient: 'from-sky-50 via-sky-100 to-sky-200', text: 'text-sky-900', border: 'border-sky-100', ring: 'ring-sky-200/70' },
  { gradient: 'from-amber-50 via-amber-100 to-amber-200', text: 'text-amber-900', border: 'border-amber-100', ring: 'ring-amber-200/70' },
  { gradient: 'from-emerald-50 via-emerald-100 to-emerald-200', text: 'text-emerald-900', border: 'border-emerald-100', ring: 'ring-emerald-200/70' },
  { gradient: 'from-indigo-50 via-indigo-100 to-indigo-200', text: 'text-indigo-900', border: 'border-indigo-100', ring: 'ring-indigo-200/70' },
  { gradient: 'from-purple-50 via-purple-100 to-purple-200', text: 'text-purple-900', border: 'border-purple-100', ring: 'ring-purple-200/70' },
  { gradient: 'from-teal-50 via-teal-100 to-teal-200', text: 'text-teal-900', border: 'border-teal-100', ring: 'ring-teal-200/70' },
  { gradient: 'from-blue-50 via-blue-100 to-blue-200', text: 'text-blue-900', border: 'border-blue-100', ring: 'ring-blue-200/70' },
  { gradient: 'from-orange-50 via-orange-100 to-orange-200', text: 'text-orange-900', border: 'border-orange-100', ring: 'ring-orange-200/70' },
  { gradient: 'from-lime-50 via-lime-100 to-lime-200', text: 'text-lime-900', border: 'border-lime-100', ring: 'ring-lime-200/70' },
  { gradient: 'from-pink-50 via-pink-100 to-pink-200', text: 'text-pink-900', border: 'border-pink-100', ring: 'ring-pink-200/70' },
  { gradient: 'from-slate-50 via-slate-100 to-slate-200', text: 'text-slate-900', border: 'border-slate-100', ring: 'ring-slate-200/70' },
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
