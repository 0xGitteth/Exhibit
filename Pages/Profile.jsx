
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
import { Edit, Bookmark, Camera, Grid, LogOut, Eye, EyeOff, Shield, BarChart2, SunMedium, Moon, Star } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

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
                  <Badge key={role.id} onClick={() => toggleBadge('roles', role.id)} variant={editData.roles?.includes(role.id) ? 'default' : 'outline'} className="cursor-pointer transition-all hover:bg-slate-100 py-1 px-3 text-sm">{role.label}</Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Stijlen</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {photographyStyles.map(style => (
                  <Badge key={style.id} onClick={() => toggleBadge('styles', style.id)} variant={editData.styles?.includes(style.id) ? 'default' : 'outline'} className="cursor-pointer transition-all hover:bg-slate-100 py-1 px-3 text-sm">{style.label}</Badge>
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuleren</Button>
            <Button onClick={handleSaveProfile} className="bg-blue-800 hover:bg-blue-900">Profiel Opslaan</Button>
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
    primary_role: PropTypes.string,
    styles: PropTypes.arrayOf(PropTypes.string),
    email: PropTypes.string,
    show_sensitive_content: PropTypes.bool,
  }),
  onProfileUpdate: PropTypes.func,
};


export default function Profile() {
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [primaryRole, setPrimaryRole] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showHouseRules, setShowHouseRules] = useState(false);
  const [savingPrimaryRole, setSavingPrimaryRole] = useState(false);

  const mergeMoodboardPosts = (posts = [], local = []) => {
    const byId = new Map();
    [...local, ...posts].forEach((item) => {
      if (!item?.id) return;
      byId.set(item.id, item);
    });
    return Array.from(byId.values());
  };

  const loadUserData = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    try {
      const userData = authUser || (await User.me());
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
  }, [authLoading, authUser]);

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
    const resolvedPrimary =
      updatedUser?.primary_role && updatedUser.roles?.includes(updatedUser.primary_role)
        ? updatedUser.primary_role
        : updatedUser?.roles?.[0] || null;

    setUser({ ...updatedUser, primary_role: resolvedPrimary });
    setPrimaryRole(resolvedPrimary);
    setActiveRole((prev) => {
      if (prev && updatedUser?.roles?.includes(prev)) return prev;
      return resolvedPrimary;
    });
  };

  useEffect(() => {
    if (user?.roles?.length) {
      const resolvedPrimary =
        user.primary_role && user.roles.includes(user.primary_role)
          ? user.primary_role
          : user.roles[0];

      setPrimaryRole((prev) => (prev === resolvedPrimary ? prev : resolvedPrimary));
      setActiveRole((prev) => {
        if (prev && user.roles.includes(prev)) return prev;
        return resolvedPrimary;
      });
    } else {
      setPrimaryRole(null);
      setActiveRole(null);
    }
  }, [user]);

  const handlePrimaryRoleChange = async (roleId) => {
    if (!roleId || roleId === primaryRole) return;

    setSavingPrimaryRole(true);
    try {
      await User.updateMyUserData({ primary_role: roleId });
      setUser((prev) => (prev ? { ...prev, primary_role: roleId } : prev));
      setPrimaryRole(roleId);
      setActiveRole(roleId);
    } catch (error) {
      console.error("Primary role update error:", error);
    }
    setSavingPrimaryRole(false);
  };

  const toggleSensitiveContent = async () => {
    const newPreference = !user.show_sensitive_content;
    await User.updateMyUserData({ show_sensitive_content: newPreference });
    setUser(prev => ({ ...prev, show_sensitive_content: newPreference }));
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="animate-pulse space-y-8">
          <div className="bg-serenity-100/70 h-40 rounded-2xl shadow-soft"></div>
          <div className="bg-serenity-100/70 h-12 rounded-2xl shadow-soft"></div>
          <div className="grid grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-serenity-100/70 aspect-square rounded-2xl shadow-soft"></div>
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
                {[...(user.roles || [])]
                  .sort((a, b) => (a === primaryRole ? -1 : b === primaryRole ? 1 : 0))
                  .map(roleId => {
                    const roleInfo = userRoles.find(r => r.id === roleId);
                    const isPrimary = roleId === primaryRole;
                    return (
                      <Badge
                        key={roleId}
                        variant="secondary"
                        className="bg-serenity-100 text-serenity-800 border-serenity-200 flex items-center gap-1"
                      >
                        {roleInfo?.label}
                        {isPrimary && <span className="text-[11px] font-semibold text-amber-700">Primair</span>}
                      </Badge>
                    );
                  })}
                {user.styles?.slice(0, 3).map(styleId => {
                    const styleInfo = photographyStyles.find(s => s.id === styleId);
                    return <Badge key={styleId} variant="outline" className="border-serenity-300 text-serenity-800 dark:text-serenity-100">{styleInfo?.label}</Badge>
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {user.roles?.length > 1 && (
        <Card className="glass-panel shadow-floating">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-midnight-900 dark:text-white">Rolprofielen</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Kies welke rol je nu bekijkt en welke rol als eerste zichtbaar is voor bezoekers.</p>
              </div>
              {primaryRole && (
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-full">
                  <Star className="w-4 h-4" />
                  Primair: {userRoles.find(r => r.id === primaryRole)?.label}
                </div>
              )}
            </div>

            <Tabs value={activeRole || primaryRole} onValueChange={setActiveRole} className="w-full">
              <TabsList className="flex flex-wrap gap-2 bg-white/70 dark:bg-midnight-100/60 backdrop-blur-sm rounded-2xl border border-serenity-200/70 dark:border-midnight-50/30 shadow-soft p-1">
                {[...(user.roles || [])]
                  .sort((a, b) => (a === primaryRole ? -1 : b === primaryRole ? 1 : 0))
                  .map(roleId => {
                    const roleInfo = userRoles.find(r => r.id === roleId);
                    const isPrimary = roleId === primaryRole;
                    return (
                      <TabsTrigger
                        key={roleId}
                        value={roleId}
                        className="data-[state=active]:bg-serenity-600 data-[state=active]:text-white rounded-xl px-3 py-2 flex items-center gap-2"
                      >
                        <span>{roleInfo?.label}</span>
                        {isPrimary && <Star className="w-4 h-4" />}
                      </TabsTrigger>
                    );
                  })}
              </TabsList>

              {[...(user.roles || [])].map(roleId => {
                const roleInfo = userRoles.find(r => r.id === roleId);
                const isPrimary = roleId === primaryRole;
                return (
                  <TabsContent key={roleId} value={roleId} className="mt-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-serenity-50/60 dark:bg-midnight-100/40 rounded-2xl border border-serenity-100 dark:border-midnight-100/40 p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-white text-serenity-800 border-serenity-200 shadow-soft">
                            {roleInfo?.label}
                          </Badge>
                          {isPrimary && <Badge variant="outline" className="border-amber-300 text-amber-700">Primair</Badge>}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-200 max-w-2xl">
                          Deze rol wordt gebruikt om je profielervaring te personaliseren. Je primaire rol komt als eerste in je badges en is leidend op je openbare profiel.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={isPrimary ? "secondary" : "default"}
                          className="whitespace-nowrap"
                          disabled={isPrimary || savingPrimaryRole}
                          onClick={() => handlePrimaryRoleChange(roleId)}
                        >
                          {isPrimary ? "Primair geselecteerd" : savingPrimaryRole ? "Opslaan..." : "Maak deze rol primair"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      )}

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
                <Button variant="ghost" size="icon" className="rounded-full bg-serenity-100 dark:bg-midnight-100/40" onClick={() => setShowEditProfile(true)} title="Profiel bewerken"><Edit className="w-5 h-5" /></Button>
                <Link to={createPageUrl("Analytics")}>
                  <Button variant="ghost" size="icon" className="rounded-full bg-serenity-100 dark:bg-midnight-100/40" title="Statistieken"><BarChart2 className="w-5 h-5" /></Button>
                </Link>
                <Button
                  variant="ghost"
                  className="rounded-full bg-serenity-100 dark:bg-midnight-100/40 px-4 py-2 flex items-center gap-2"
                  onClick={toggleTheme}
                  title="Schakel thema"
                >
                  {theme === 'light' ? <SunMedium className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="text-sm font-semibold">Thema: {theme === 'light' ? 'Licht' : 'Donker'}</span>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-serenity-100 dark:bg-midnight-100/40" onClick={toggleSensitiveContent} title={user.show_sensitive_content ? "Gevoelige content verbergen" : "Gevoelige content tonen"}>
                  {user.show_sensitive_content ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-serenity-100 dark:bg-midnight-100/40" onClick={() => setShowHouseRules(true)} title="Huisregels"><Shield className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-serenity-100 dark:bg-midnight-100/40" onClick={handleLogout} title="Uitloggen"><LogOut className="w-5 h-5 text-red-500" /></Button>
            </div>
        </CardContent>
      </Card>
      
      {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/70 dark:bg-midnight-100/60 backdrop-blur-sm rounded-2xl border border-serenity-200/70 dark:border-midnight-50/30 shadow-soft">
            <TabsTrigger value="posts" className="flex items-center space-x-2 data-[state=active]:bg-serenity-600 data-[state=active]:text-white rounded-xl"><Grid className="w-4 h-4" /><span>Mijn Posts</span></TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center space-x-2 data-[state=active]:bg-serenity-600 data-[state=active]:text-white rounded-xl"><Bookmark className="w-4 h-4" /><span>Moodboard</span></TabsTrigger>
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
