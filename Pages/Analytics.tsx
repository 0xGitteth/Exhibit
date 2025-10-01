import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Post } from '@/entities/Post';
import { SavedPost } from '@/entities/SavedPost';
import { Like } from '@/entities/Like';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, Users, Heart, Bookmark, Eye } from 'lucide-react';

type StatCardProps = {
  icon: any;
  title: string;
  value: any;
  note?: string;
};

const StatCard = ({ icon: Icon, title, value, note }: StatCardProps) => (
  <Card className="bg-white/60 backdrop-blur-md shadow-xl rounded-2xl">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      <Icon className="h-5 w-5 text-slate-500" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      {note && <p className="text-xs text-slate-500 mt-1">{note}</p>}
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
        const postIds = posts.map((p) => p.id);
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
        <p>Statistieken laden...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
        <BarChart2 className="w-8 h-8" /> Jouw Statistieken
      </h1>
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
      <Card className="mt-8 bg-white/60 backdrop-blur-md shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle>Binnenkort meer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            We werken aan gedetailleerde grafieken en analyses om je nog meer inzicht te geven in de
            prestaties van je account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsPage;
