import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Post } from "../entities/Post.js";
import { User } from "../entities/User.js";
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
  { id: "stylist", label: "Stylisten" }
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
    <div className="px-4 sm:px-6 space-y-6">
      {/* Role Filter Pills */}
      <div className="flex space-x-3 mb-2 overflow-x-auto pb-3 no-scrollbar">
        {userRoles.map(role => (
          <Button
            key={role.id}
            variant="outline"
            onClick={() => setActiveRole(role.id)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold border-serenity-200/70 dark:border-midnight-200/50 shadow-soft transition-all ${
              activeRole === role.id
                ? 'bg-gradient-to-r from-serenity-600 to-serenity-500 text-white'
                : 'bg-white/70 dark:bg-midnight-700/60 text-midnight-900 dark:text-serenity-50 hover:bg-serenity-100/60'
            }`}
          >
            {role.label}
          </Button>
        ))}
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="glass-panel p-6 text-center shadow-floating">
          <p className="text-slate-600 dark:text-slate-200">Gebruikers laden...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filteredUsers.map(user => (
            <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="text-center glass-panel overflow-hidden hover:shadow-floating transition-all flex flex-col">
                <Avatar className="w-full h-32 sm:h-40 rounded-none shrink-0">
                  <AvatarImage src={user.avatar_url} className="object-cover" />
                  <AvatarFallback className="rounded-none">
                    {user.display_name?.[0] || <UserIcon className="w-8 h-8" />}
                  </AvatarFallback>
                </Avatar>
                <CardContent className="p-4 pb-2 text-midnight-900 dark:text-serenity-50">
                  <h4 className="font-semibold truncate">{user.display_name || "Gebruiker"}</h4>
                  <p className="text-xs truncate text-slate-600 dark:text-slate-200 mt-1">{user.roles?.join(', ') || "Creatief"}</p>
                </CardContent>
              </Card>
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
    <div className="px-4 sm:px-6 space-y-6">
      {/* Style Filter Pills */}
      <div className="flex flex-wrap gap-3 mb-2 overflow-x-auto pb-3 no-scrollbar">
        <Button
          variant="outline"
          onClick={() => setSelectedStyle(null)}
          className={`rounded-full px-5 py-2.5 shrink-0 font-semibold border-serenity-200/70 dark:border-midnight-200/50 shadow-soft ${
            !selectedStyle
              ? 'bg-gradient-to-r from-serenity-600 to-serenity-500 text-white'
              : 'bg-white/70 dark:bg-midnight-700/60 text-midnight-900 dark:text-serenity-50 hover:bg-serenity-100/60'
          }`}
        >
          Alles
        </Button>
        {visibleStyles.map(style => (
          <button
            key={style.id}
            type="button"
            onClick={() => setSelectedStyle(style.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full border border-serenity-200/70 dark:border-midnight-200/40 shadow-soft ${getStylePillClasses(style.id, {
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
            className="rounded-full px-5 py-2.5 bg-white/70 dark:bg-midnight-700/60 text-midnight-900 dark:text-serenity-50 border-serenity-300/80 dark:border-midnight-200/60 hover:bg-serenity-100 shadow-soft"
          >
            Toon meer...
          </Button>
        )}
      </div>
      
      {/* Posts Grid */}
      {loading ? (
        <p className="text-center text-slate-600 dark:text-slate-200">Posts laden...</p>
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
    <div className="max-w-6xl mx-auto px-3 pt-6 space-y-8">
      {/* Search Bar - direct starten */}
      <div className="relative px-4">
        <div className="glass-panel rounded-full shadow-floating p-1.5">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-serenity-600 dark:text-serenity-200 w-5 h-5" />
            <Input
              placeholder="Zoek naar mensen, stijlen, of titels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-5 py-3 text-lg bg-transparent border-none focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="people" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/60 dark:bg-midnight-800/50 backdrop-blur-lg rounded-full mx-4 border border-serenity-200/60 dark:border-midnight-200/50 shadow-floating p-1">
          <TabsTrigger value="people" className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-serenity-600 data-[state=active]:to-serenity-500 data-[state=active]:text-white rounded-full py-3 px-4 text-midnight-800 dark:text-serenity-100">
            <UserIcon className="w-4 h-4" />
            <span>Mensen</span>
          </TabsTrigger>
          <TabsTrigger value="styles" className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-serenity-600 data-[state=active]:to-serenity-500 data-[state=active]:text-white rounded-full py-3 px-4 text-midnight-800 dark:text-serenity-100">
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