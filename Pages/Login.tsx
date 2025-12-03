import React, { useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { dummyAccounts } from '../utils/dummyAccounts';
import { PAGE_ROUTES } from '@/utils';
import { Link } from 'react-router-dom';

const roleLabels: Record<string, string> = {
  photographer: 'Fotograaf',
  model: 'Model',
  artist: 'Artist',
  stylist: 'Stylist',
  makeup_artist: 'MUA',
  assistant: 'Assistent',
};

const LoginPage: React.FC = () => {
  const { login, loading, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });

  const redirectTarget = useMemo(() => searchParams.get('redirect'), [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(form.username, form.password, redirectTarget);
    } catch (err: any) {
      setError(err?.message || 'Inloggen is mislukt.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeUserCard = user && location.pathname === PAGE_ROUTES.login;

  return (
    <div className="min-h-screen bg-gradient-to-br from-serenity-50 via-white to-serenity-100 dark:from-midnight-400 dark:via-midnight-500 dark:to-midnight-700 flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.2em] text-serenity-600 dark:text-serenity-200 font-semibold">Exhibit</p>
          <h1 className="text-4xl font-bold text-midnight-900 dark:text-white leading-tight">
            Log in om de community te ontdekken
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-200 max-w-xl">
            Gebruik een van de vooraf aangemaakte demo-accounts of log in met je eigen sessie. We tonen bewust de
            inloggegevens zodat je snel kunt testen.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {dummyAccounts.map((account) => (
              <Card key={account.email} className={`shadow-soft border-serenity-200/80 dark:border-midnight-50/40 ${
                activeUserCard && account.email === user?.email ? 'ring-2 ring-serenity-500' : ''
              }`}>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Avatar>
                    <AvatarImage src={account.user.avatar_url} />
                    <AvatarFallback>{account.user.display_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{account.user.display_name}</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{account.label}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Inlognaam</Badge>
                    <span className="font-mono text-xs">{account.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Wachtwoord</Badge>
                    <span className="font-mono text-xs">{account.password}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {account.user.roles?.map((role: string) => (
                      <Badge key={role} className="bg-serenity-100 text-serenity-800 border-serenity-200">
                        {roleLabels[role] || role}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="shadow-floating border-serenity-200/70 dark:border-midnight-50/30 bg-white/90 dark:bg-midnight-100/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Inloggen</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Vul je gegevens in om toegang te krijgen tot je account.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-midnight-900 dark:text-white" htmlFor="username">
                  Gebruikersnaam
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Demo"
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-midnight-900 dark:text-white" htmlFor="password">Wachtwoord</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
              <Button type="submit" className="w-full bg-serenity-600 hover:bg-serenity-700" disabled={loading || submitting}>
                {submitting ? 'Bezig met inloggen...' : 'Log in'}
              </Button>
              {redirectTarget && (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Na het inloggen sturen we je door naar: <span className="font-semibold">{redirectTarget}</span>
                </p>
              )}
              <div className="pt-2 text-sm text-slate-700 dark:text-slate-200">
                Nog geen account?{' '}
                <Link className="text-serenity-700 font-semibold" to={PAGE_ROUTES.onboarding}>
                  Maak er één aan
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
