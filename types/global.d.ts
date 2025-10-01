declare module 'react/jsx-runtime';
declare module 'lucide-react';
declare module 'framer-motion';

declare module '@/components/*';
declare module '@/entities/*';

interface Window {
  // allow misc globals if needed
  [key: string]: any;
}
