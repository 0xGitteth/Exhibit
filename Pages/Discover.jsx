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

const photographyStyles = [
  { id: "portrait", label: "Portrait", icon: "👤" }, 
  { id: "fashion", label: "Fashion", icon: "👗" },
  { id: "boudoir", label: "Boudoir", icon: "🌹" }, 
  { id: "art_nude", label: "Art Nude", icon: "🎨" },
  { id: "street", label: "Street", icon: "🏙️" }, 
  { id: "landscape", label: "Landscape", icon: "🏔️" },
  { id: "nature", label: "Nature", icon: "🌿" }, 
  { id: "conceptual", label: "Conceptual", icon: "💡" },
  { id: "editorial", label: "Editorial", icon: "📰" }, 
  { id: "fine_art", label: "Fine Art", icon: "🎨" },
  { id: "wedding", label: "Wedding", icon: "💒" }, 
  { id: "sport", label: "Sport", icon: "⚽" },
  { id: "advertising", label: "Advertising", icon: "📢" }, 
  { id: "beauty", label: "Beauty", icon: "💄" },
  { id: "lifestyle", label: "Lifestyle", icon: "☀️" }, 
  { id: "documentary", label: "Documentary", icon: "📹" },
  { id: "travel", label: "Travel", icon: "✈️" }, 
  { id: "architecture", label: "Architecture", icon: "🏛️" },
  { id: "macro", label: "Macro", icon: "🔬" }, 
  { id: "wildlife", label: "Wildlife", icon: "🦁" },
  { id: "food", label: "Food", icon: "🍽️" }, 
  { id: "product", label: "Product", icon: "📦" },
  { id: "automotive", label: "Automotive", icon: "🚗" }, 
  { id: "event", label: "Event", icon: "🎉" },
  { id: "corporate", label: "Corporate", icon: "💼" }, 
  { id: "maternity", label: "Maternity", icon: "🤱" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" }, 
  { id: "children", label: "Children", icon: "👶" },
  { id: "pet", label: "Pet", icon: "🐕" }, 
  { id: "black_white", label: "Black & White", icon: "⚫" },
  { id: "abstract", label: "Abstract", icon: "🌀" }, 
  { id: "surreal", label: "Surreal", icon: "🌙" },
  { id: "vintage", label: "Vintage", icon: "📷" }, 
  { id: "minimalist", label: "Minimalist", icon: "⭕" },
  { id: "candid", label: "Candid", icon: "📸" }, 
  { id: "glamour", label: "Glamour", icon: "💎" }
];

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
              <Card className="text-center glass-panel overflow-hidden hover:shadow-floating transition-all">
                <Avatar className="w-full h-32 sm:h-40 rounded-none">
                  <AvatarImage src={user.avatar_url} className="object-cover" />
                  <AvatarFallback className="rounded-none">
                    {user.display_name?.[0] || <UserIcon className="w-8 h-8" />}
                  </AvatarFallback>
                </Avatar>
                <CardContent className="p-3">
                  <h4 className="font-semibold truncate text-midnight-900 dark:text-white">{user.display_name || "Gebruiker"}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-200 truncate">{user.roles?.join(', ') || "Creatief"}</p>
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
    <div className="px-4">
      {/* Style Filter Pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          variant={!selectedStyle ? 'default' : 'outline'}
          onClick={() => setSelectedStyle(null)}
          className={`rounded-full px-4 py-2 ${
            !selectedStyle
              ? 'bg-serenity-600 text-white shadow-soft'
              : 'bg-white/80 text-midnight-900 dark:text-serenity-50 border-serenity-200/70'
          }`}
        >
          Alles
        </Button>
        {visibleStyles.map(style => (
          <Button
            key={style.id}
            variant={selectedStyle === style.id ? 'default' : 'outline'}
            onClick={() => setSelectedStyle(style.id)}
            className={`rounded-full px-4 py-2 ${
              selectedStyle === style.id
                ? 'bg-serenity-600 text-white shadow-soft'
                : 'bg-white/80 text-midnight-900 dark:text-serenity-50 border-serenity-200/70'
            }`}
          >
            <span className="mr-1">{style.icon}</span>
            {style.label}
          </Button>
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