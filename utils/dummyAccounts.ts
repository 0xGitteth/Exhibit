import { sampleProfile, sampleUsers } from './dummyData';

const baseUser = sampleProfile;

const toAccountUser = (
  sample: (typeof sampleUsers)[number],
  details: Pick<typeof sampleProfile, 'email' | 'full_name' | 'bio'> & { show_sensitive_content?: boolean },
) => ({
  id: sample.id,
  display_name: sample.display_name,
  avatar_url: sample.avatar_url,
  roles: sample.roles,
  styles: sample.styles,
  show_sensitive_content: false,
  ...details,
});

export const dummyAccounts = [
  {
    email: baseUser.email,
    password: 'welcome123',
    user: baseUser,
    label: 'Creatieve fotograaf',
  },
  {
    email: 'ava.visser@example.com',
    password: 'shootsafe',
    user: toAccountUser(sampleUsers[0], {
      email: 'ava.visser@example.com',
      full_name: 'Ava Visser',
      bio: 'Street & portrait fotograaf, altijd op zoek naar nieuwe samenwerkingen.',
    }),
    label: 'Street & portrait',
  },
  {
    email: 'noor.vermeulen@example.com',
    password: 'modelmode',
    user: toAccountUser(sampleUsers[1], {
      email: 'noor.vermeulen@example.com',
      full_name: 'Noor Vermeulen',
      bio: 'Model en artist, combineert fashion met conceptuele verhalen.',
      show_sensitive_content: true,
    }),
    label: 'Fashion & concept',
  },
  {
    email: 'bo.terhorst@example.com',
    password: 'muamaster',
    user: toAccountUser(sampleUsers[5], {
      email: 'bo.terhorst@example.com',
      full_name: 'Bo ter Horst',
      bio: 'Make-up artist gespecialiseerd in zachte glow & clean beauty.',
    }),
    label: 'Beauty & editorial (MUA)',
  },
  {
    email: 'ravi.reinders@example.com',
    password: 'assistme',
    user: toAccountUser(sampleUsers[6], {
      email: 'ravi.reinders@example.com',
      full_name: 'Ravi Reinders',
      bio: 'Fotograaf/assistent die sets runt en licht opbouwt.',
    }),
    label: 'Fashion & set-assist',
  },
];
