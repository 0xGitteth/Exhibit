import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Post } from "../entities/Post.js";
import { User } from "../entities/User.js";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User as UserIcon, Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "../Components/PostCard";
import { samplePosts, sampleUsers } from "../utils/dummyData";
import { DUMMY_DATA_ENABLED } from "../utils/featureFlags";
import { getStylePillClasses, photographyStyles } from "../utils/photographyStyles";

const styleIcons = {
  portrait: "👤",
  fashion: "👗",
  boudoir: "🌹",
  art_nude: "🎨",
  street: "🏙️",
  landscape: "🏔️",
  nature: "🌿",
  conceptual: "💡",
  editorial: "📰",
  fine_art: "🎨",
  wedding: "💒",
  sport: "⚽",
  advertising: "📢",
  beauty: "💄",
  lifestyle: "☀️",
  documentary: "📹",
  travel: "✈️",
  architecture: "🏛️",
  macro: "🔬",
  wildlife: "🦁",
  food: "🍽️",
  product: "📦",
  automotive: "🚗",
  event: "🎉",
  corporate: "💼",
  maternity: "🤱",
  family: "👨‍👩‍👧‍👦",
  children: "👶",
  pet: "🐕",
  black_white: "⚫",
  abstract: "🌀",
  surreal: "🌙",
  vintage: "📷",
  minimalist: "⭕",
  candid: "📸",
  glamour: "💎",
};

const userRoles = [
  { id: "all", label: "Alle" },
  { id: "photographer", label: "Fotografen" },
  { id: "model", label: "Modellen" },
  { id: "artist", label: "Artists" },
  { id: "makeup_artist", label: "MUA" },
  { id: "stylist", label: "Stylisten" },
  { id: "assistant", label: "Assistenten" }
];

const PeopleTab = ({ searchTerm }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState("all");

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const apiUsers = typeof User.list === "function" ? await User.list() : [];
        if (DUMMY_DATA_ENABLED && (!apiUsers || apiUsers.length === 0)) {
          setUsers(sampleUsers);
        } else {
          setUsers(apiUsers || []);
        }
      } catch (error) {
        setUsers(DUMMY_DATA_ENABLED ? sampleUsers : []);
      }
      setLoading(false);
    };
    loadUsers();
  }, []);

  useEffect(() => {
    let results = users;
    if (activeRole !== "all") {
      results = results.filter(u => u.roles && u.roles.includes(activeRole));
    }
    if (searchTerm) {
      results = results.filter(u => u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredUsers(results);
  }, [users, activeRole, searchTerm]);

  return (
    <div className="px-4">
      {/* Role Filter Pills */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {userRoles.map(role => (
          <Button
            key={role.id}
            variant={activeRole === role.id ? 'default' : 'outline'}
            onClick={() => setActiveRole(role.id)}
            className={`shrink-0 ${
              activeRole === role.id
                ? 'bg-serenity-600 text-white shadow-soft'
                : 'bg-white/80 text-midnight-900 dark:text-serenity-50 border-serenity-200/70'
            } rounded-full px-4 py-2`}
          >
            {role.label}
          </Button>
        ))}
      </div>
      
      {/* Users Grid */}
      {loading ? (
        <p className="text-center text-slate-600">Gebruikers laden...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredUsers.map(user => (
            <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Link
                to={`/profile/${user.id}`}
                aria-label={`Bekijk profiel van ${user.display_name || 'de gebruiker'}`}
                className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-serenity-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-midnight-900 rounded-xl"
              >
                <Card className="text-center glass-panel overflow-hidden group-hover:shadow-floating hover:shadow-floating transition-all flex flex-col bg-white/80 dark:bg-midnight-900/80 rounded-xl">
                  <Avatar className="w-full h-32 sm:h-40 rounded-none shrink-0">
                    <AvatarImage src={user.avatar_url} className="object-cover" />
                    <AvatarFallback className="rounded-none">
                      {user.display_name?.[0] || <UserIcon className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <CardContent className="p-3 bg-white/90 dark:bg-midnight-950/80 text-midnight-900 dark:text-serenity-50">
                    <h4 className="font-semibold truncate">{user.display_name || "Gebruiker"}</h4>
                  </CardContent>
                  <CardContent className="pt-0 pb-3 px-3 bg-white/95 dark:bg-midnight-950/80 text-midnight-800 dark:text-slate-200 overflow-hidden">
                    <p className="text-xs truncate">{user.roles?.join(', ') || "Creatief"}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const StylesTab = ({ searchTerm }) => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [showAllStyles, setShowAllStyles] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const allPosts = typeof Post.list === "function" ? await Post.list("-created_date", 100) : [];
        if (DUMMY_DATA_ENABLED && (!allPosts || allPosts.length === 0)) {
          setPosts(samplePosts);
        } else {
          setPosts(allPosts || []);
        }
      } catch (error) {
        setPosts(DUMMY_DATA_ENABLED ? samplePosts : []);
      }
      setLoading(false);
    };
    loadPosts();
  }, []);

  useEffect(() => {
    let results = posts;
    if (selectedStyle) {
      results = results.filter(p => p.photography_style === selectedStyle || p.tags?.includes(selectedStyle));
    }
    if (searchTerm) {
       results = results.filter(p => p.title?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredPosts(results);
  }, [posts, selectedStyle, searchTerm]);

  const visibleStyles = showAllStyles ? photographyStyles : photographyStyles.slice(0, 5);

  return (
    <div className="px-4">
      {/* Style Filter Pills */}
      <div className="flex flex-wrap gap-3 mb-6 overflow-x-auto pb-2">
        <Button
          variant={!selectedStyle ? 'default' : 'outline'}
          onClick={() => setSelectedStyle(null)}
          className={`rounded-full px-4 py-2 shrink-0 ${
            !selectedStyle
              ? 'bg-serenity-600 text-white shadow-soft'
              : 'bg-white/80 text-midnight-900 dark:text-serenity-50 border-serenity-200/70'
          }`}
        >
          Alles
        </Button>
        {visibleStyles.map(style => (
          <button
            key={style.id}
            type="button"
            onClick={() => setSelectedStyle(style.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold ${getStylePillClasses(style.id, {
              active: selectedStyle === style.id,
            })}`}
          >
            <span className="mr-1">{styleIcons[style.id]}</span>
            {style.label}
          </button>
        ))}
        {!showAllStyles && photographyStyles.length > 5 && (
          <Button
            variant="outline"
            onClick={() => setShowAllStyles(true)}
            className="rounded-full bg-white/80 text-serenity-700 border-serenity-300 hover:bg-serenity-100 shadow-soft"
          >
            Toon meer...
          </Button>
        )}
      </div>
      
      {/* Posts Grid */}
      {loading ? (
        <p className="text-center text-slate-600">Posts laden...</p>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Discover() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="max-w-6xl mx-auto px-3 pt-4 space-y-6">
      {/* Search Bar - direct starten */}
      <div className="relative px-4">
        <div className="glass-panel rounded-2xl shadow-floating p-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-serenity-500 dark:text-serenity-200 w-5 h-5" />
            <Input
              placeholder="Zoek naar mensen, stijlen, of titels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 text-lg bg-transparent border-none focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="people" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/70 dark:bg-midnight-100/60 backdrop-blur-sm rounded-2xl mx-4 border border-serenity-200/70 dark:border-midnight-50/30 shadow-soft">
          <TabsTrigger value="people" className="flex items-center space-x-2 data-[state=active]:bg-serenity-600 data-[state=active]:text-white rounded-xl">
            <UserIcon className="w-4 h-4" />
            <span>Mensen</span>
          </TabsTrigger>
          <TabsTrigger value="styles" className="flex items-center space-x-2 data-[state=active]:bg-serenity-600 data-[state=active]:text-white rounded-xl">
            <Palette className="w-4 h-4" />
            <span>Stijlen</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="people">
          <PeopleTab searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="styles">
          <StylesTab searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

PeopleTab.propTypes = {
  searchTerm: PropTypes.string,
};

StylesTab.propTypes = {
  searchTerm: PropTypes.string,
};