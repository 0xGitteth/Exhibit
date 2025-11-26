import React, { useState, useEffect } from "react";
import { Post } from "../entities/Post.js";
import { User } from "../entities/User.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User as UserIcon, Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "../Components/PostCard";

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
      const allUsers = await User.list();
      setUsers(allUsers);
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
            className="shrink-0 bg-white/80"
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
              <Card className="text-center shadow-lg bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                <Avatar className="w-full h-32 sm:h-40 rounded-none">
                  <AvatarImage src={user.avatar_url} className="object-cover" />
                  <AvatarFallback className="rounded-none">
                    {user.display_name?.[0] || <UserIcon className="w-8 h-8" />}
                  </AvatarFallback>
                </Avatar>
                <CardContent className="p-3">
                  <h4 className="font-semibold truncate text-slate-800">{user.display_name || "Gebruiker"}</h4>
                  <p className="text-xs text-slate-500 truncate">{user.roles?.join(', ') || "Creatief"}</p>
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
      const allPosts = await Post.list("-created_date", 100);
      setPosts(allPosts);
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
          className="bg-white/80"
        >
          Alles
        </Button>
        {visibleStyles.map(style => (
          <Button 
            key={style.id} 
            variant={selectedStyle === style.id ? 'default' : 'outline'} 
            onClick={() => setSelectedStyle(style.id)}
            className="bg-white/80"
          >
            <span className="mr-1">{style.icon}</span>
            {style.label}
          </Button>
        ))}
        {!showAllStyles && photographyStyles.length > 5 && (
          <Button 
            variant="outline" 
            onClick={() => setShowAllStyles(true)}
            className="bg-white/80 text-blue-600 border-blue-300"
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
    <div className="max-w-6xl mx-auto px-2 pt-2">
      {/* Search Bar - direct starten */}
      <div className="relative mb-6 px-4">
        <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Zoek naar mensen, stijlen, of titels..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 py-3 text-lg bg-white/70 backdrop-blur-md rounded-full shadow-lg border-slate-200/50"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="people" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/50 backdrop-blur-sm rounded-xl mx-4">
          <TabsTrigger value="people" className="flex items-center space-x-2">
            <UserIcon className="w-4 h-4" />
            <span>Mensen</span>
          </TabsTrigger>
          <TabsTrigger value="styles" className="flex items-center space-x-2">
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