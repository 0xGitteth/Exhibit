import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Community as CommunityEntity } from "../entities/Community.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  CalendarClock,
  MessagesSquare,
  PlusCircle,
  RefreshCcw,
  Search,
  Send,
  Shield,
  Tag,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { PAGE_ROUTES } from "@/utils";
import { samplePosts } from "@/utils/dummyData";

const communityHighlights = {
  safety_consent: {
    label: "Veiligheid & Consent",
    description: "Checklists, best practices en ondersteuning rond consent en boundaries.",
  },
  networking: {
    label: "Netwerk & Samenwerkingen",
    description: "Vind nieuwe matches en bouw aan langdurige creatieve relaties.",
  },
  techniques: {
    label: "Licht & Techniek",
    description: "Experimenteer met lichtopstellingen, camera-instellingen en workflows.",
  },
  equipment: {
    label: "Gear Talk NL",
    description: "Deel je favoriete gear, hacks en onderhoudstips.",
  },
  inspiration: {
    label: "Moodboard & Inspiratie",
    description: "Dagelijkse referenties, color palettes en poses.",
  },
};

const fallbackTopics = [
  {
    id: "topic-1",
    title: "Welke boundaries zet jij voor een nieuwe shoot?",
    replies: 18,
    lastActivity: "2u geleden",
    tags: ["checklists", "best practices"],
  },
  {
    id: "topic-2",
    title: "Template: consentformulier in begrijpelijke taal",
    replies: 9,
    lastActivity: "5u geleden",
    tags: ["resources", "templates"],
  },
  {
    id: "topic-3",
    title: "Hoe communiceer je no-go's met een nieuw team?",
    replies: 27,
    lastActivity: "1d geleden",
    tags: ["team", "ervaringen"],
  },
];

export default function CommunityDetail() {
  const { communityId } = useParams();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await CommunityEntity.list();
        setCommunities(result || []);
      } catch (err) {
        setError("Kon communitydetails niet ophalen. Probeer het later opnieuw.");
      }
      setLoading(false);
    };

    fetchCommunities();
  }, []);

  const community = useMemo(
    () => communities.find((item) => item.id === communityId),
    [communities, communityId]
  );

  const highlightedInfo = communityHighlights[community?.category] ?? null;
  const topics = highlightedInfo ? fallbackTopics : fallbackTopics.slice(0, 2);
  const featuredPosts = samplePosts.slice(0, 3);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <Card className="glass-panel animate-pulse">
          <CardHeader>
            <div className="h-6 w-1/3 bg-serenity-100 rounded mb-2" />
            <div className="h-4 w-1/4 bg-serenity-100 rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-24 w-full bg-serenity-100 rounded" />
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-2 gap-4">
          {Array(2)
            .fill(0)
            .map((_, idx) => (
              <Card key={idx} className="glass-panel animate-pulse">
                <CardHeader>
                  <div className="h-5 w-2/3 bg-serenity-100 rounded" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-4 w-full bg-serenity-100 rounded" />
                  <div className="h-4 w-3/4 bg-serenity-100 rounded" />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center space-y-4">
        <Users className="w-12 h-12 mx-auto text-serenity-400" />
        <p className="text-lg font-semibold text-midnight-900 dark:text-white">{error}</p>
        <Button onClick={() => window.location.reload()} className="rounded-full inline-flex items-center gap-2">
          <RefreshCcw className="w-4 h-4" />
          Opnieuw proberen
        </Button>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center space-y-4">
        <Users className="w-12 h-12 mx-auto text-serenity-400" />
        <p className="text-lg font-semibold text-midnight-900 dark:text-white">
          Community niet gevonden. Kies een andere community.
        </p>
        <Link to={PAGE_ROUTES.community}>
          <Button variant="outline" className="rounded-full inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Terug naar overzicht
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to={PAGE_ROUTES.community} className="inline-flex items-center text-serenity-700 dark:text-serenity-200">
          <ArrowLeft className="w-4 h-4 mr-2" /> Terug naar communities
        </Link>
        <Badge variant="outline" className="rounded-full border-serenity-200 text-serenity-800 bg-serenity-50">
          {community.member_count} leden
        </Badge>
      </div>

      <Card className="glass-panel border border-serenity-200/60 dark:border-midnight-50/30 shadow-soft">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full text-xs border-serenity-300 text-serenity-800 bg-white">
                  {community.category?.replace(/_/g, " ") || "Community"}
                </Badge>
              </div>
              <CardTitle className="text-2xl text-midnight-900 dark:text-white">{community.name}</CardTitle>
              <p className="text-slate-700 dark:text-slate-200 max-w-3xl">{community.description}</p>
              {highlightedInfo && (
                <p className="text-sm text-serenity-700 dark:text-serenity-100 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> {highlightedInfo.description}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-full inline-flex items-center gap-2 bg-serenity-500 text-white hover:bg-serenity-600">
                <Users className="w-4 h-4" />
                Word lid
              </Button>
              <Button variant="outline" className="rounded-full inline-flex items-center gap-2 border-serenity-300 text-serenity-800">
                <BellIcon />
                Volgen
              </Button>
              <Button variant="secondary" className="rounded-full inline-flex items-center gap-2">
                <ShareIcon />
                Deel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass-panel lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl text-midnight-900 dark:text-white">Actieve topics</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300">Praat mee of start een nieuw gesprek.</p>
            </div>
            <Button className="rounded-full inline-flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Nieuw topic
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {topics.map((topic) => (
              <motion.div
                key={topic.id}
                className="border border-serenity-100/80 dark:border-midnight-50/20 rounded-2xl p-4 hover:shadow-soft"
                whileHover={{ y: -2 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-midnight-900 dark:text-white">{topic.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {topic.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-serenity-200 text-serenity-800 rounded-full text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-200">
                    <div className="inline-flex items-center gap-1">
                      <MessagesSquare className="w-4 h-4" /> {topic.replies} reacties
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <CalendarClock className="w-4 h-4" /> {topic.lastActivity}
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full border-serenity-300 text-serenity-800">
                      Meedoen
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-lg text-midnight-900 dark:text-white">Deel een update</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300">Start een vraag of deel een snelle tip.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className="w-full rounded-2xl border border-serenity-200/60 dark:border-midnight-50/30 bg-white/80 dark:bg-midnight-900 p-3 focus:outline-none focus:ring-2 focus:ring-serenity-300"
                rows={3}
                placeholder="Waar wil je het over hebben?"
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="rounded-full inline-flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Plaatsen
                </Button>
                <Button size="sm" variant="outline" className="rounded-full inline-flex items-center gap-2 border-serenity-300">
                  <Search className="w-4 h-4" />
                  Zoek vergelijkbaar topic
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-lg text-midnight-900 dark:text-white">Recente posts</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300">Wat makers hier hebben gedeeld.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 rounded-xl">
                    <AvatarFallback className="bg-serenity-100 text-serenity-800">
                      {post.photographer_name?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="font-semibold text-midnight-900 dark:text-white">{post.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-200">{post.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-serenity-700">
                      <Badge variant="outline" className="rounded-full border-serenity-200">
                        {post.photography_style}
                      </Badge>
                      <Badge variant="outline" className="rounded-full border-serenity-200">
                        {post.comments_count} reacties
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BellIcon() {
  return <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.75.64 3.56 1.085 5.454 1.31m5.715 0a24.255 24.255 0 0 1-5.715 0m5.715 0a3 3 0 1 1-5.715 0"
      />
    </svg>;
}

function ShareIcon() {
  return <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25A4.5 4.5 0 1 0 3 12a4.5 4.5 0 0 0 4.5-3.75Zm0 0V18a4.5 4.5 0 0 0 4.5 4.5v0a4.5 4.5 0 0 0 4.5-4.5v-2.25"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.5 4.5 4.5 4.5-4.5 4.5" />
    </svg>;
}
