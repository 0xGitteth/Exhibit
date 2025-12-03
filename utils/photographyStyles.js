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
  { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200', ring: 'ring-rose-200/80', dot: 'bg-rose-500' },
  { bg: 'bg-sky-50', text: 'text-sky-900', border: 'border-sky-200', ring: 'ring-sky-200/80', dot: 'bg-sky-500' },
  { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200', ring: 'ring-emerald-200/80', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', ring: 'ring-amber-200/80', dot: 'bg-amber-500' },
  { bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-200', ring: 'ring-indigo-200/80', dot: 'bg-indigo-500' },
  { bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-200', ring: 'ring-purple-200/80', dot: 'bg-purple-500' },
  { bg: 'bg-teal-50', text: 'text-teal-900', border: 'border-teal-200', ring: 'ring-teal-200/80', dot: 'bg-teal-500' },
  { bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-200', ring: 'ring-orange-200/80', dot: 'bg-orange-500' },
  { bg: 'bg-lime-50', text: 'text-lime-900', border: 'border-lime-200', ring: 'ring-lime-200/80', dot: 'bg-lime-500' },
  { bg: 'bg-pink-50', text: 'text-pink-900', border: 'border-pink-200', ring: 'ring-pink-200/80', dot: 'bg-pink-500' },
  { bg: 'bg-slate-50', text: 'text-slate-900', border: 'border-slate-200', ring: 'ring-slate-200/80', dot: 'bg-slate-500' },
];

const styleColorMap = {
  portrait: colorPalette[1],
  fashion: colorPalette[9],
  boudoir: colorPalette[0],
  art_nude: colorPalette[0],
  street: colorPalette[10],
  landscape: colorPalette[2],
  nature: colorPalette[2],
  conceptual: colorPalette[5],
  editorial: colorPalette[1],
  fine_art: colorPalette[5],
  wedding: colorPalette[3],
  sport: colorPalette[1],
  advertising: colorPalette[6],
  beauty: colorPalette[9],
  lifestyle: colorPalette[10],
  documentary: colorPalette[6],
  travel: colorPalette[4],
  architecture: colorPalette[8],
  macro: colorPalette[3],
  wildlife: colorPalette[2],
  food: colorPalette[7],
  product: colorPalette[4],
  automotive: colorPalette[1],
  event: colorPalette[7],
  corporate: colorPalette[10],
  maternity: colorPalette[0],
  family: colorPalette[3],
  children: colorPalette[9],
  pet: colorPalette[8],
  black_white: colorPalette[10],
  abstract: colorPalette[5],
  surreal: colorPalette[5],
  vintage: colorPalette[7],
  minimalist: colorPalette[10],
  candid: colorPalette[1],
  glamour: colorPalette[9],
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
  const emphasis = active ? `ring-2 ${tone.ring} shadow-md` : 'hover:ring hover:ring-slate-100 shadow-sm';
  return `${tone.bg} ${tone.text} border ${tone.border} ${emphasis} rounded-full transition-colors duration-150`;
};
