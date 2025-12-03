import React, { useState, useEffect } from 'react';
import { User } from '../entities/User.js';
import { Post } from '../entities/Post.js';
import { SavedPost } from '../entities/SavedPost.js';
import { Like } from '../entities/Like.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, Users, Heart, Bookmark, Eye } from 'lucide-react';

type StatCardProps = {
  icon: any;
  title: string;
  value: any;
  note?: string;
};

const StatCard = ({ icon: Icon, title, value, note }: StatCardProps) => (
  <Card className="glass-panel h-full shadow-floating">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
      <CardTitle className="text-sm font-semibold text-midnight-800 dark:text-serenity-50 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-serenity-200/80 to-serenity-400/80 dark:from-midnight-700/70 dark:to-midnight-500/70 text-midnight-900 dark:text-serenity-50 shadow-soft">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-3xl font-bold text-midnight-900 dark:text-white">{value}</div>
      {note && <p className="text-xs text-slate-700 dark:text-slate-100/80 leading-relaxed">{note}</p>}
    </CardContent>
  </Card>
);

export function AnalyticsPage(): JSX.Element {
  type Stats = {
    totalPosts: number;
    totalLikes: number;
    totalSaves: number;
    placeholderFollowers: number;
  };
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalLikes: 0,
    totalSaves: 0,
    placeholderFollowers: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const user = await User.me();
        const posts = await Post.filter({ created_by: user.email });
        const postIds = posts.map((p: { id: string }) => p.id);
        let totalLikes = 0;
        let totalSaves = 0;
        if (postIds.length > 0) {
          const likes = await Like.filter({ post_id: { $in: postIds } } as any);
          totalLikes = Array.isArray(likes) ? likes.length : 0;
          const saves = await SavedPost.filter({ post_id: { $in: postIds } } as any);
          totalSaves = Array.isArray(saves) ? saves.length : 0;
        }
        if (mounted) {
          setStats({
            totalPosts: posts.length,
            totalLikes,
            totalSaves,
            placeholderFollowers: Math.floor(Math.random() * 1000),
          });
        }
      } catch (e) {
        // keep console.error but don't throw — page should tolerate missing backend
        // eslint-disable-next-line no-console
        console.error('Failed to fetch stats', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-panel p-6 shadow-floating">
          <p className="text-slate-700 dark:text-slate-200">Statistieken laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="glass-panel p-6 md:p-7 space-y-3 shadow-floating">
        <p className="text-xs uppercase tracking-[0.25em] text-serenity-700 dark:text-serenity-200">Overzicht</p>
        <h1 className="text-3xl font-bold text-midnight-900 dark:text-white flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-serenity-500 to-serenity-400 text-white shadow-floating"><BarChart2 className="w-6 h-6" /></span>
          Jouw Statistieken
        </h1>
        <p className="text-slate-700 dark:text-slate-200">Een serene weergave van je prestaties met zachte blauwe tinten.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          title="Volgers"
          value={stats.placeholderFollowers}
          note="Volger-tracking binnenkort beschikbaar"
        />
        <StatCard icon={Heart} title="Totaal Likes" value={stats.totalLikes} />
        <StatCard icon={Bookmark} title="Totaal Opgeslagen" value={stats.totalSaves} />
        <StatCard
          icon={Eye}
          title="Post Weergaven"
          value="N/A"
          note="Weergave-tracking binnenkort beschikbaar"
        />
      </div>
      <Card className="glass-panel shadow-floating">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-midnight-900 dark:text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-serenity-400 to-serenity-500 text-white shadow-soft"><Eye className="w-5 h-5" /></span>
            Binnenkort meer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-slate-700 dark:text-slate-200">
            We werken aan gedetailleerde grafieken en analyses om je nog meer inzicht te geven in de
            prestaties van je account.
          </p>
          <p className="text-sm text-serenity-700 dark:text-serenity-200">Houd deze pagina in de gaten voor nieuwe widgets en interactieve grafieken.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsPage;
