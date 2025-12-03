
import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { User } from "../entities/User.js";
import { SavedPost } from "../entities/SavedPost.js";
import { Post } from "../entities/Post.js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Bookmark, Camera, Grid, LogOut, Eye, EyeOff, Shield, BarChart2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UploadFile } from "../src/integrations/Core";
import { motion } from "framer-motion";
import HouseRulesModal from "@/components/HouseRulesModal";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { DUMMY_DATA_ENABLED } from "../utils/featureFlags";
import { sampleMoodboardPosts, sampleProfile, sampleProfilePosts } from "../utils/dummyData";
import { getMoodboardPosts } from "../utils/moodboardStorage";

const photographyStyles = [
  { id: "portrait", label: "Portrait" }, { id: "fashion", label: "Fashion" }, { id: "boudoir", label: "Boudoir" },
  { id: "art_nude", label: "Art Nude" }, { id: "street", label: "Street" }, { id: "landscape", label: "Landscape" },
  { id: "nature", label: "Nature" }, { id: "conceptual", label: "Conceptual" }, { id: "editorial", label: "Editorial" },
  { id: "fine_art", label: "Fine Art" }, { id: "wedding", label: "Wedding" }, { id: "sport", label: "Sport" },
  { id: "advertising", label: "Advertising" }, { id: "beauty", label: "Beauty" }, { id: "lifestyle", label: "Lifestyle" },
  { id: "documentary", label: "Documentary" }, { id: "travel", label: "Travel" }, { id: "architecture", label: "Architecture" },
  { id: "macro", label: "Macro" }, { id: "wildlife", label: "Wildlife" }, { id: "food", label: "Food" },
  { id: "product", label: "Product" }, { id: "automotive", label: "Automotive" }, { id: "event", label: "Event" },
  { id: "corporate", label: "Corporate" }, { id: "maternity", label: "Maternity" }, { id: "family", label: "Family" },
  { id: "children", label: "Children" }, { id: "pet", label: "Pet" }, { id: "black_white", label: "Black & White" },
  { id: "abstract", label: "Abstract" }, { id: "surreal", label: "Surreal" }, { id: "vintage", label: "Vintage" },
  { id: "minimalist", label: "Minimalist" }, { id: "candid", label: "Candid" }, { id: "glamour", label: "Glamour" }
];

const userRoles = [
  { id: "photographer", label: "Fotograaf" }, { id: "model", label: "Model" }, { id: "makeup_artist", label: "Make-up Artist" },
  { id: "stylist", label: "Stylist" }, { id: "artist", label: "Artist" }, { id: "assistant", label: "Assistent" }, { id: "other", label: "Overig" }
];


const EditProfileDialog = ({ open, onOpenChange, user, onProfileUpdate }) => {
  const [editData, setEditData] = useState(user);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setEditData(user);
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setEditData(prev => ({ ...prev, avatar_url: file_url }));
    } catch (error) {
      console.error("Upload error:", error);
    }
    setUploading(false);
  };

  const handleSaveProfile = async () => {
    try {
      await User.updateMyUserData(editData);
      onProfileUpdate(editData);
      onOpenChange(false);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const toggleBadge = (field, value) => {
    setEditData(prev => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Profielinstellingen</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-slate-100">
              <AvatarImage src={editData.avatar_url} />
              <AvatarFallback>{editData.display_name?.[0]}</AvatarFallback>
            </Avatar>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" id="avatar-upload" />
            <Button variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()} disabled={uploading}>
              <Camera className="w-4 h-4 mr-2" />
              {uploading ? "Uploaden..." : "Wijzig foto"}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="display_name">Weergavenaam</Label>
              <Input id="display_name" value={editData.display_name || ""} onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="bio">Biografie</Label>
              <Textarea id="bio" value={editData.bio || ""} onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))} placeholder="Vertel iets over jezelf..." />
            </div>
            <div>
              <Label htmlFor="website">Website / Shop</Label>
              <Input id="website" value={editData.website || ""} onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))} placeholder="https://..." />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Badges</h3>
            <div>
              <Label>Rollen</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {userRoles.map(role => (
                  <Badge
                    key={role.id}
                    onClick={() => toggleBadge('roles', role.id)}
                    variant={editData.roles?.includes(role.id) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all rounded-full px-4 py-1.5 text-sm border-serenity-200/70 dark:border-midnight-200/60 ${
                      editData.roles?.includes(role.id)
                        ? 'bg-gradient-to-r from-serenity-500 to-serenity-600 text-white shadow-soft'
                        : 'bg-white/70 dark:bg-midnight-800/70 text-midnight-900 dark:text-serenity-50 hover:bg-serenity-100/70'
                    }`}
                  >
                    {role.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Stijlen</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {photographyStyles.map(style => (
                  <Badge
                    key={style.id}
                    onClick={() => toggleBadge('styles', style.id)}
                    variant={editData.styles?.includes(style.id) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all rounded-full px-4 py-1.5 text-sm border-serenity-200/70 dark:border-midnight-200/60 ${
                      editData.styles?.includes(style.id)
                        ? 'bg-gradient-to-r from-serenity-500 to-serenity-600 text-white shadow-soft'
                        : 'bg-white/70 dark:bg-midnight-800/70 text-midnight-900 dark:text-serenity-50 hover:bg-serenity-100/70'
                    }`}
                  >
                    {style.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
             <Link to={createPageUrl("IDVerification")}>
                <Button variant="secondary" className="w-full">
                    <Shield className="w-4 h-4 mr-2"/>
                    Verifieer je leeftijd (18+)
                </Button>
            </Link>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-5 py-2.5 border-serenity-200/80 dark:border-midnight-200/60">
              Annuleren
            </Button>
            <Button onClick={handleSaveProfile} className="rounded-full px-5 py-2.5 bg-gradient-to-r from-serenity-600 to-serenity-500 text-white shadow-soft">
              Profiel Opslaan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

EditProfileDialog.propTypes = {
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  user: PropTypes.shape({
    avatar_url: PropTypes.string,
    display_name: PropTypes.string,
    bio: PropTypes.string,
    website: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string),
    styles: PropTypes.arrayOf(PropTypes.string),
    email: PropTypes.string,
    show_sensitive_content: PropTypes.bool,
  }),
  onProfileUpdate: PropTypes.func,
};


export default function Profile() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showHouseRules, setShowHouseRules] = useState(false);

  const mergeMoodboardPosts = (posts = [], local = []) => {
    const byId = new Map();
    [...local, ...posts].forEach((item) => {
      if (!item?.id) return;
      byId.set(item.id, item);
    });
    return Array.from(byId.values());
  };

  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      const resolvedUser = userData || (DUMMY_DATA_ENABLED ? sampleProfile : null);

      if (!resolvedUser) {
        throw new Error("No user data");
      }

      setUser(resolvedUser);

      try {
        const posts = resolvedUser.email
          ? await Post.filter({ created_by: resolvedUser.email }, "-created_date")
          : [];
        if (DUMMY_DATA_ENABLED && (!posts || posts.length === 0)) {
          setUserPosts(sampleProfilePosts);
        } else {
          setUserPosts(posts || []);
        }
      } catch (error) {
        setUserPosts(DUMMY_DATA_ENABLED ? sampleProfilePosts : []);
      }

      try {
        const localMoodboard = getMoodboardPosts();
        if (resolvedUser.email) {
          const saved = await SavedPost.filter({ user_email: resolvedUser.email });
          const savedPostIds = saved.map(s => s.post_id);
          if (savedPostIds.length > 0) {
            const savedPostsData = await Post.filter({ id: { "$in": savedPostIds }});
            setSavedPosts(mergeMoodboardPosts(savedPostsData, localMoodboard));
          } else if (DUMMY_DATA_ENABLED || localMoodboard.length > 0) {
            setSavedPosts(mergeMoodboardPosts(sampleMoodboardPosts, localMoodboard));
          }
        } else if (DUMMY_DATA_ENABLED || localMoodboard.length > 0) {
          setSavedPosts(mergeMoodboardPosts(sampleMoodboardPosts, localMoodboard));
        }
      } catch (error) {
        const localMoodboard = getMoodboardPosts();
        setSavedPosts(mergeMoodboardPosts(DUMMY_DATA_ENABLED ? sampleMoodboardPosts : [], localMoodboard));
      }
    } catch (error) {
      if (DUMMY_DATA_ENABLED) {
        setUser(sampleProfile);
        setUserPosts(sampleProfilePosts);
        setSavedPosts(mergeMoodboardPosts(sampleMoodboardPosts, getMoodboardPosts()));
      } else {
        await User.loginWithRedirect(window.location.href);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    const handleMoodboardUpdate = (event) => {
      const updated = event?.detail?.posts || getMoodboardPosts();
      setSavedPosts((prev) => mergeMoodboardPosts(prev, updated));
    };

    window.addEventListener('moodboard:updated', handleMoodboardUpdate);
    return () => window.removeEventListener('moodboard:updated', handleMoodboardUpdate);
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const toggleSensitiveContent = async () => {
    const newPreference = !user.show_sensitive_content;
    await User.updateMyUserData({ show_sensitive_content: newPreference });
    setUser(prev => ({ ...prev, show_sensitive_content: newPreference }));
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.href = createPageUrl("Timeline");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="animate-pulse space-y-8">
          <div className="bg-serenity-100/70 dark:bg-midnight-700/60 h-40 rounded-2xl shadow-soft"></div>
          <div className="bg-serenity-100/70 dark:bg-midnight-700/60 h-12 rounded-2xl shadow-soft"></div>
          <div className="grid grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-serenity-100/70 dark:bg-midnight-700/60 aspect-square rounded-2xl shadow-soft"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 space-y-6">
      <HouseRulesModal open={showHouseRules} onOpenChange={setShowHouseRules} />
      <EditProfileDialog open={showEditProfile} onOpenChange={setShowEditProfile} user={user} onProfileUpdate={handleProfileUpdate} />

      {/* Profile Header */}
      <Card className="glass-panel shadow-floating">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-24 h-24 ring-4 ring-white shadow-lg">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>{user.display_name?.[0]}</AvatarFallback>
            </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-midnight-900 dark:text-white">{user.display_name || user.full_name}</h1>
                <p className="text-slate-700 dark:text-slate-200 mt-2">{user.bio || "Deel je verhaal en inspireer anderen..."}</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  {user.roles?.map(roleId => {
                      const roleInfo = userRoles.find(r => r.id === roleId);
                      return <Badge key={roleId} variant="secondary" className="rounded-full px-4 py-1.5 bg-gradient-to-r from-serenity-200 to-serenity-300 text-midnight-900 border-serenity-200/70 shadow-soft">{roleInfo?.label}</Badge>
                  })}
                  {user.styles?.slice(0, 3).map(styleId => {
                      const styleInfo = photographyStyles.find(s => s.id === styleId);
                      return <Badge key={styleId} variant="outline" className="rounded-full px-4 py-1.5 border-serenity-300/80 dark:border-midnight-200/60 text-midnight-900 dark:text-serenity-50 bg-white/70 dark:bg-midnight-800/70">{styleInfo?.label}</Badge>
                  })}
                </div>
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Stats and Settings */}
      <Card className="glass-panel shadow-floating">
        <CardContent className="p-4 flex justify-around items-center flex-wrap gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-midnight-900 dark:text-white">{userPosts.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300 uppercase">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-midnight-900 dark:text-white">{savedPosts.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300 uppercase">Opgeslagen</div>
            </div>
              <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="rounded-full bg-white/70 dark:bg-midnight-700/60 border border-serenity-200/70 dark:border-midnight-200/50 text-midnight-900 dark:text-serenity-50 shadow-soft" onClick={() => setShowEditProfile(true)} title="Profiel bewerken"><Edit className="w-5 h-5" /></Button>
                  <Link to={createPageUrl("Analytics")}>
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/70 dark:bg-midnight-700/60 border border-serenity-200/70 dark:border-midnight-200/50 text-midnight-900 dark:text-serenity-50 shadow-soft" title="Statistieken"><BarChart2 className="w-5 h-5" /></Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="rounded-full bg-white/70 dark:bg-midnight-700/60 border border-serenity-200/70 dark:border-midnight-200/50 text-midnight-900 dark:text-serenity-50 shadow-soft" onClick={toggleSensitiveContent} title={user.show_sensitive_content ? "Gevoelige content verbergen" : "Gevoelige content tonen"}>
                    {user.show_sensitive_content ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full bg-white/70 dark:bg-midnight-700/60 border border-serenity-200/70 dark:border-midnight-200/50 text-midnight-900 dark:text-serenity-50 shadow-soft" onClick={() => setShowHouseRules(true)} title="Huisregels"><Shield className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full bg-white/70 dark:bg-midnight-700/60 border border-serenity-200/70 dark:border-midnight-200/50 text-midnight-900 dark:text-serenity-50 shadow-soft" onClick={handleLogout} title="Uitloggen"><LogOut className="w-5 h-5" /></Button>
              </div>
          </CardContent>
        </Card>
      
      {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/60 dark:bg-midnight-800/50 backdrop-blur-lg rounded-full border border-serenity-200/60 dark:border-midnight-200/50 shadow-floating p-1">
            <TabsTrigger value="posts" className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-serenity-600 data-[state=active]:to-serenity-500 data-[state=active]:text-white rounded-full py-3 px-4 text-midnight-800 dark:text-serenity-100"><Grid className="w-4 h-4" /><span>Mijn Posts</span></TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-serenity-600 data-[state=active]:to-serenity-500 data-[state=active]:text-white rounded-full py-3 px-4 text-midnight-800 dark:text-serenity-100"><Bookmark className="w-4 h-4" /><span>Moodboard</span></TabsTrigger>
          </TabsList>

        <TabsContent value="posts">
            {userPosts.length === 0 ? (
              <div className="text-center py-16 glass-panel shadow-floating">
                <Camera className="w-16 h-16 mx-auto mb-4 text-serenity-500" />
                <h3 className="text-lg font-medium text-midnight-900 dark:text-white mb-2">Nog geen posts gedeeld</h3>
                <p className="text-slate-700 dark:text-slate-200">Begin met het delen van je werk om je portfolio op te bouwen</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {userPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="aspect-square relative rounded-xl overflow-hidden group cursor-pointer shadow-soft"
                  >
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-4">
                      <h4 className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">{post.title}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved">
            {savedPosts.length === 0 ? (
              <div className="text-center py-16 glass-panel shadow-floating">
                <Bookmark className="w-16 h-16 mx-auto mb-4 text-serenity-500" />
                <h3 className="text-lg font-medium text-midnight-900 dark:text-white mb-2">Nog geen foto&apos;s opgeslagen</h3>
                <p className="text-slate-700 dark:text-slate-200">Sla inspirerende foto&apos;s op om je persoonlijke moodboard te maken</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {savedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="aspect-square relative rounded-xl overflow-hidden group cursor-pointer shadow-soft"
                  >
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-4">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h4 className="font-medium">{post.title}</h4>
                        <p className="text-sm opacity-80">door {post.photographer_name}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
