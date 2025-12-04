import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Compass, LayoutGrid, Sparkles, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { PAGE_ROUTES } from '@/utils';

const roleOptions = [
  { id: 'fan', label: 'Fan', description: 'Volg je favoriete makers en projecten.' },
  { id: 'photographer', label: 'Fotograaf', description: 'Deel shoots en lichtopstellingen.' },
  { id: 'model', label: 'Model', description: 'Bouw aan je portfolio en connecties.' },
  { id: 'artist', label: 'Artist', description: 'Combineer concept, kleur en sfeer.' },
  { id: 'stylist', label: 'Stylist', description: 'Styling, set design en sourcing.' },
  { id: 'makeup_artist', label: 'MUA', description: 'Make-up en hair voor shoots.' },
  { id: 'assistant', label: 'Assistent', description: 'Productie, licht en logistiek.' },
  { id: 'agency', label: 'Agency', description: 'Representeer talent en coördineer bookings.' },
  { id: 'company', label: 'Company', description: 'Organiseer producties namens je organisatie.' },
];

const startPages = [
  { id: 'Timeline', label: 'Galerij', icon: LayoutGrid },
  { id: 'Discover', label: 'Ontdekken', icon: Compass },
  { id: 'Community', label: 'Community', icon: Sparkles },
];

const OnboardingPage: React.FC = () => {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = useMemo(() => searchParams.get('redirect'), [searchParams]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [postOnboardingOpen, setPostOnboardingOpen] = useState(false);
  const [postOnboardingRole, setPostOnboardingRole] = useState<'fan' | 'photographer'>('fan');
  const [postOnboardingRedirect, setPostOnboardingRedirect] = useState<string>(PAGE_ROUTES.timeline);
  const [postOnboardingStorageKey, setPostOnboardingStorageKey] = useState<string | null>(null);
  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    instagram: user?.instagram || '',
    roles: user?.roles || [],
    start_page: 'Timeline',
  });

  useEffect(() => {
    if (user?.onboarding_complete && !submitting && !postOnboardingOpen) {
      const target = redirectTarget || PAGE_ROUTES.timeline;
      navigate(target, { replace: true });
    }
  }, [navigate, redirectTarget, submitting, postOnboardingOpen, user?.onboarding_complete]);

  const toggleRole = (roleId: string) => {
    setForm((prev) => {
      const hasRole = prev.roles.includes(roleId);
      const nextRoles = hasRole ? prev.roles.filter((r) => r !== roleId) : [...prev.roles, roleId];
      return { ...prev, roles: nextRoles };
    });
  };

  const getPostOnboardingStorageKey = (createdUser: any) => {
    const identifier = createdUser?.id || createdUser?.email || 'new-user';
    return `exhibit_post_onboarding_${identifier}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.display_name.trim() || !form.email.trim()) {
      setError('Vul je naam en e-mailadres in.');
      return;
    }

    if (!form.roles.length) {
      setError('Kies minimaal één rol ("fan" is altijd beschikbaar).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        onboarding_complete: true,
        avatar_url:
          user?.avatar_url ||
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
      };
      const redirect = redirectTarget || PAGE_ROUTES.timeline;
      const created = await register(payload, redirect, { skipRedirect: true });

      const nextRole = payload.roles.includes('photographer') ? 'photographer' : 'fan';
      const storageKey = getPostOnboardingStorageKey(created);
      setPostOnboardingRedirect(redirect);
      setPostOnboardingStorageKey(storageKey);

      if (typeof window !== 'undefined' && localStorage.getItem(storageKey) === 'true') {
        navigate(redirect, { replace: true });
        return;
      }

      setPostOnboardingRole(nextRole);
      setPostOnboardingOpen(true);
    } catch (err: any) {
      setError(err?.message || 'Registratie is mislukt. Probeer het opnieuw.');
    } finally {
      setSubmitting(false);
    }
  };

  const postOnboardingCopy = {
    fan: {
      title: 'Welkom als fan',
      intro:
        'Je profiel is klaar. Ontdek nieuwe creators, bewaar favorieten en bouw je eigen inspiratielijst.',
      bullets: [
        {
          title: 'Volg snel nieuwe makers',
          body: 'Gebruik Ontdekken om direct fotografen, modellen en stylisten te vinden die bij je smaak passen.',
        },
        {
          title: 'Bewaar wat je inspireert',
          body: 'Sla shoots en setups op zodat je ze later eenvoudig kunt terugvinden en delen.',
        },
        {
          title: 'Blijf op de hoogte',
          body: 'Activeer meldingen voor je favoriete makers zodat je niets mist.',
        },
      ],
      cta: 'Start met ontdekken',
    },
    photographer: {
      title: 'Welkom als fotograaf',
      intro:
        'Mooi werk! Deel je shoots, beschrijf je lichtopstellingen en leg contact met nieuwe modellen en fans.',
      bullets: [
        {
          title: 'Publiceer je eerste set',
          body: 'Upload beelden, voeg lichtschema’s toe en tag je teamleden om zichtbaar te worden.',
        },
        {
          title: 'Bouw je community',
          body: 'Volg modellen, MUA’s en stylisten om samenwerkingen sneller te starten.',
        },
        {
          title: 'Houd je profiel actueel',
          body: 'Update bio en links zodat fans en opdrachtgevers je direct kunnen benaderen.',
        },
      ],
      cta: 'Deel mijn eerste shoot',
    },
  } as const;

  const activeCopy = postOnboardingCopy[postOnboardingRole];

  const handlePostOnboardingClose = () => {
    if (postOnboardingStorageKey && typeof window !== 'undefined') {
      localStorage.setItem(postOnboardingStorageKey, 'true');
    }
    setPostOnboardingOpen(false);
    navigate(postOnboardingRedirect, { replace: true });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-serenity-50 via-white to-serenity-100 dark:from-midnight-400 dark:via-midnight-500 dark:to-midnight-700 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid xl:grid-cols-[1.2fr_1fr] gap-8 items-start">
          <div className="space-y-6">
            <Badge className="bg-serenity-100 text-serenity-700 border-serenity-200">Nieuw account</Badge>
            <h1 className="text-4xl font-bold text-midnight-900 dark:text-white leading-tight">
              Maak je Exhibit-profiel compleet
            </h1>
            <p className="text-lg text-slate-700 dark:text-slate-200 max-w-2xl">
              Kies minstens één rol (waaronder fan) en vul je kerngegevens in. We sturen je pas door zodra je profiel klaar is,
              zodat je startpagina bij je past.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => toggleRole(role.id)}
                  className={`text-left rounded-2xl border p-4 transition shadow-soft bg-white/80 dark:bg-midnight-100/80 backdrop-blur-sm ${
                    form.roles.includes(role.id)
                      ? 'border-serenity-400 ring-2 ring-serenity-300'
                      : 'border-serenity-200/70 dark:border-midnight-50/30 hover:border-serenity-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-midnight-900 dark:text-white">{role.label}</div>
                    {form.roles.includes(role.id) && (
                      <span className="rounded-full bg-serenity-100 text-serenity-700 px-3 py-1 text-xs font-semibold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Geselecteerd
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{role.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Card className="shadow-floating border-serenity-200/70 dark:border-midnight-50/30 bg-white/90 dark:bg-midnight-100/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <UserPlus className="w-6 h-6 text-serenity-600" />
                Je basisgegevens
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Deze info helpt makers je sneller te vinden.
              </p>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-midnight-900 dark:text-white" htmlFor="display_name">
                    Weergavenaam
                  </label>
                  <Input
                    id="display_name"
                    value={form.display_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Bijv. Nova Lint"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-midnight-900 dark:text-white" htmlFor="email">
                    E-mailadres
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="jij@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-midnight-900 dark:text-white" htmlFor="bio">
                    Korte bio
                  </label>
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Waar ben je naar op zoek?"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-midnight-900 dark:text-white" htmlFor="instagram">
                    Instagram (optioneel)
                  </label>
                  <Input
                    id="instagram"
                    value={form.instagram}
                    onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value }))}
                    placeholder="@username"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-midnight-900 dark:text-white">Waar wil je starten?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {startPages.map((page) => {
                      const Icon = page.icon;
                      const selected = form.start_page === page.id;
                      return (
                        <button
                          key={page.id}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, start_page: page.id }))}
                          className={`rounded-xl border p-3 text-left transition bg-white/70 dark:bg-midnight-100/70 shadow-soft ${
                            selected
                              ? 'border-serenity-400 ring-2 ring-serenity-300'
                              : 'border-serenity-200/70 dark:border-midnight-50/30 hover:border-serenity-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-semibold text-midnight-900 dark:text-white">
                            <Icon className="w-4 h-4" /> {page.label}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                            {selected ? 'We sturen je hiernaartoe' : 'Kies dit als start'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full bg-serenity-600 hover:bg-serenity-700"
                  disabled={loading || submitting}
                >
                  {submitting ? 'Profiel opslaan...' : 'Start Exhibit'}
                </Button>
                <p className="text-xs text-slate-600 dark:text-slate-300 text-center">
                  Je account wordt pas aangemaakt zodra je dit formulier afrondt.
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      <Dialog open={postOnboardingOpen} onOpenChange={(open) => !open && handlePostOnboardingClose()}>
        <DialogContent className="bg-white/95 dark:bg-midnight-100 border-serenity-200/80 dark:border-midnight-50/40 shadow-floating">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-midnight-900 dark:text-white">
              <Sparkles className="w-5 h-5 text-serenity-600" /> {activeCopy.title}
            </DialogTitle>
            <p className="text-slate-700 dark:text-slate-200 mt-2">{activeCopy.intro}</p>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              {activeCopy.bullets.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-serenity-200/80 dark:border-midnight-50/40 bg-white dark:bg-midnight-50 p-4 shadow-soft"
                >
                  <p className="text-sm font-semibold text-midnight-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-serenity-50 dark:bg-midnight-50 border border-serenity-100 dark:border-midnight-50/40 rounded-xl p-4">
              <div>
                <p className="text-sm font-semibold text-midnight-900 dark:text-white">Klaar voor je volgende stap?</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">We bewaren deze uitleg voor nu en tonen hem niet opnieuw.</p>
              </div>
              <Button className="bg-serenity-600 hover:bg-serenity-700" onClick={handlePostOnboardingClose}>
                {activeCopy.cta}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnboardingPage;
