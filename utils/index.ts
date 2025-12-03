export const PAGE_ROUTES = {
  timeline: '/',
  community: '/community',
  discover: '/search',
  profile: '/profile',
  chat: '/chat',
  analytics: '/analytics',
  login: '/login',
  onboarding: '/onboarding',
  idVerification: '/id-verification',
} as const;

const pageRouteMap: Record<string, string> = {
  Timeline: PAGE_ROUTES.timeline,
  Community: PAGE_ROUTES.community,
  Discover: PAGE_ROUTES.discover,
  Profile: PAGE_ROUTES.profile,
  Chat: PAGE_ROUTES.chat,
  Analytics: PAGE_ROUTES.analytics,
  Login: PAGE_ROUTES.login,
  Onboarding: PAGE_ROUTES.onboarding,
  IDVerification: PAGE_ROUTES.idVerification,
};

export function createPageUrl(pageName: string) {
  if (!pageName) return PAGE_ROUTES.timeline;
  if (pageRouteMap[pageName]) return pageRouteMap[pageName];
  return pageName.startsWith('/') ? pageName : `/${pageName}`;
}
