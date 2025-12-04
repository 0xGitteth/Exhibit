
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
import { Edit, Bookmark, Camera, Grid, LogOut, Eye, EyeOff, Shield, BarChart2, SunMedium, Moon, Star, Users, Settings } from "lucide-react";
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
import { sampleMoodboardPosts, sampleProfile, sampleProfilePosts, sampleUsers } from "../utils/dummyData";
import { getMoodboardPosts } from "../utils/moodboardStorage";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getStyleTone } from "../utils/photographyStyles";

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
  { id: "photographer", label: "Fotograaf" },
  { id: "model", label: "Model" },
  { id: "makeup_artist", label: "Make-up Artist" },
  { id: "stylist", label: "Stylist" },
  { id: "artist", label: "Artist" },
  { id: "assistant", label: "Assistent" },
  { id: "agency", label: "Agency" },
  { id: "company", label: "Bedrijf" },
  { id: "other", label: "Overig" }
];

const defaultAgencyAccounts = sampleUsers.filter((u) => u.roles?.includes("agency"));
const defaultCompanyAccounts = sampleUsers.filter((u) => u.roles?.includes("company"));


const EditProfileDialog = ({ open, onOpenChange, user, onProfileUpdate, agencyAccounts = [], companyAccounts = [] }) => {
  const [editData, setEditData] = useState(user);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setEditData(user);
  }, [user]);

  const toArray = (value) => (Array.isArray(value) ? value : []);
  const addUnique = (list, value) => {
    if (!value) return toArray(list);
    const arr = toArray(list);
    return arr.includes(value) ? arr : [...arr, value];
  };
  const removeValue = (list, value) => toArray(list).filter((item) => item !== value);

  const findAccountMatch = (value, accounts) => {
    if (!value) return null;
    const normalized = value.toLowerCase().trim();
    return accounts.find((account) => {
      const label = account.display_name || account.full_name || account.email;
      return label?.toLowerCase().trim() === normalized;
    });
  };

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
      const agencyMatch = findAccountMatch(editData.agency_affiliation, agencyAccounts);
      const companyMatch = findAccountMatch(editData.company_affiliation, companyAccounts);
      const previousAgencyMatch = findAccountMatch(user?.agency_affiliation, agencyAccounts);
      const previousCompanyMatch = findAccountMatch(user?.company_affiliation, companyAccounts);

      const linkedAgencies = removeValue(
        addUnique(editData.linked_agencies ?? user?.linked_agencies, agencyMatch?.email),
        previousAgencyMatch && (!agencyMatch || previousAgencyMatch.email !== agencyMatch.email)
          ? previousAgencyMatch.email
          : null,
      );
      const linkedCompanies = removeValue(
        addUnique(editData.linked_companies ?? user?.linked_companies, companyMatch?.email),
        previousCompanyMatch && (!companyMatch || previousCompanyMatch.email !== companyMatch.email)
          ? previousCompanyMatch.email
          : null,
      );

      const payload = {
        ...editData,
        linked_agencies: linkedAgencies,
        linked_companies: linkedCompanies,
        linked_models: toArray(editData.linked_models ?? user?.linked_models),
      };

      const savedUser = await User.updateMyUserData(payload);
      onProfileUpdate(savedUser);

      const currentEmail = savedUser?.email || user?.email;

      const syncLinkedModels = async (account, shouldLink) => {
        if (!account?.email || !currentEmail) return;
        const baseLinks = shouldLink
          ? addUnique(account.linked_models, currentEmail)
          : removeValue(account.linked_models, currentEmail);
        await User.updateByEmail(account.email, { linked_models: baseLinks });
      };

      if (previousAgencyMatch && previousAgencyMatch.email !== agencyMatch?.email) {
        await syncLinkedModels(previousAgencyMatch, false);
      }
      if (previousCompanyMatch && previousCompanyMatch.email !== companyMatch?.email) {
        await syncLinkedModels(previousCompanyMatch, false);
      }
      if (agencyMatch) {
        await syncLinkedModels(agencyMatch, true);
      }
      if (companyMatch) {
        await syncLinkedModels(companyMatch, true);
      }

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
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="agency_affiliation">Agency affiliatie</Label>
                <Input
                  id="agency_affiliation"
                  list="agency-affiliations"
                  value={editData.agency_affiliation || ""}
                  onChange={(e) => setEditData(prev => ({ ...prev, agency_affiliation: e.target.value }))}
                  placeholder="Bijv. Studio Aurora"
                />
                <datalist id="agency-affiliations">
                  {agencyAccounts.map((agency) => (
                    <option
                      key={agency.id || agency.email || agency.display_name}
                      value={agency.display_name || agency.full_name || agency.email}
                    />
                  ))}
                </datalist>
                <p className="text-xs text-slate-500 mt-1">Kies een bestaande agency of vul vrij in.</p>
              </div>
              <div>
                <Label htmlFor="company_affiliation">Bedrijf affiliatie</Label>
                <Input
                  id="company_affiliation"
                  list="company-affiliations"
                  value={editData.company_affiliation || ""}
                  onChange={(e) => setEditData(prev => ({ ...prev, company_affiliation: e.target.value }))}
                  placeholder="Bijv. Northwind Media"
                />
                <datalist id="company-affiliations">
                  {companyAccounts.map((company) => (
                    <option
                      key={company.id || company.email || company.display_name}
                      value={company.display_name || company.full_name || company.email}
                    />
                  ))}
                </datalist>
                <p className="text-xs text-slate-500 mt-1">Optioneel: selecteer een bestaand bedrijf of typ zelf.</p>
              </div>
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
    agency_affiliation: PropTypes.string,
    company_affiliation: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string),
    primary_role: PropTypes.string,
    styles: PropTypes.arrayOf(PropTypes.string),
    email: PropTypes.string,
    show_sensitive_content: PropTypes.bool,
    linked_agencies: PropTypes.arrayOf(PropTypes.string),
    linked_companies: PropTypes.arrayOf(PropTypes.string),
    linked_models: PropTypes.arrayOf(PropTypes.string),
  }),
  onProfileUpdate: PropTypes.func,
  agencyAccounts: PropTypes.arrayOf(PropTypes.object),
  companyAccounts: PropTypes.arrayOf(PropTypes.object),
};


export default function Profile() {
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [primaryRole, setPrimaryRole] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [linkedModels, setLinkedModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showHouseRules, setShowHouseRules] = useState(false);
  const [savingPrimaryRole, setSavingPrimaryRole] = useState(false);
  const [agencyAccounts, setAgencyAccounts] = useState(defaultAgencyAccounts);
  const [companyAccounts, setCompanyAccounts] = useState(defaultCompanyAccounts);

  const isOwner = authUser?.email ? authUser.email === user?.email : DUMMY_DATA_ENABLED;

  useEffect(() => {
    const loadAffiliationAccounts = async () => {
      if (DUMMY_DATA_ENABLED) return;
      try {
        const accounts = await User.filter({ roles: ['agency', 'company'] });
        if (accounts.length) {
          setAgencyAccounts(accounts.filter((account) => account.roles?.includes('agency')));
          setCompanyAccounts(accounts.filter((account) => account.roles?.includes('company')));
        }
      } catch (error) {
        console.error('Affiliation fetch error:', error);
      }
    };

    loadAffiliationAccounts();
  }, []);

  const mergeMoodboardPosts = (posts = [], local = []) => {
    const byId = new Map();
    [...local, ...posts].forEach((item) => {
      if (!item?.id) return;
      byId.set(item.id, item);
    });
    return Array.from(byId.values());
  };

  const findAffiliationAccount = useCallback(
    (value, type) => {
      if (!value) return null;
      const normalized = value.toLowerCase().trim();
      const pool = type === 'agency' ? agencyAccounts : companyAccounts;
      return pool.find((account) => {
        const label = account.display_name || account.full_name || account.email;
        return label?.toLowerCase().trim() === normalized;
      });
    },
    [agencyAccounts, companyAccounts],
  );

  const renderAffiliation = (value, type, tone = "default") => {
    if (!value) return null;
    const match = findAffiliationAccount(value, type);
    const linkClasses =
      tone === "dark"
        ? "text-white font-semibold hover:text-white/80 underline-offset-2"
        : "text-serenity-700 dark:text-serenity-200 font-medium hover:underline";
    const textClasses = tone === "dark" ? "text-white/90" : "text-slate-700 dark:text-slate-200";
    if (match) {
      const target = `${createPageUrl('Profile')}?user=${encodeURIComponent(
        match.id || match.email || match.display_name,
      )}`;
      return (
        <Link to={target} className={linkClasses}>
          {match.display_name || match.full_name || match.email}
        </Link>
      );
    }
    return <span className={textClasses}>{value}</span>;
  };

  const fetchLinkedModels = useCallback(
    async (resolvedUser) => {
      const hasTalentRole = resolvedUser?.roles?.some((role) => ["agency", "company"].includes(role));
      if (!hasTalentRole) {
        setLinkedModels([]);
        return;
      }

      const identifiers = resolvedUser?.linked_models?.filter(Boolean) || [];
      if (identifiers.length === 0) {
        setLinkedModels([]);
        return;
      }

      const mapManualEntries = (knownAccounts = []) =>
        identifiers
          .filter((value) => !knownAccounts.some((account) => account.email === value || account.id === value))
          .map((value) => ({ display_name: value, roles: [], avatar_url: null, id: value, is_manual: true }));

      try {
        if (DUMMY_DATA_ENABLED) {
          const matched = sampleUsers.filter((account) => identifiers.includes(account.email || account.id));
          const manual = mapManualEntries(matched);
          setLinkedModels([...matched, ...manual]);
          return;
        }

        const matched = await User.filter({ email: { $in: identifiers } });
        const manual = mapManualEntries(matched);
        setLinkedModels([...(matched || []), ...manual]);
      } catch (error) {
        console.error("Linked models fetch error:", error);
        setLinkedModels(mapManualEntries());
      }
    },
    [],
  );

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
      fetchLinkedModels(resolvedUser);

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
  }, [authLoading, authUser, fetchLinkedModels]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    if (user) {
      fetchLinkedModels(user);
    }
  }, [user, fetchLinkedModels]);

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
    fetchLinkedModels(updatedUser);
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

  const showTalentTab = user.roles?.some((role) => ["agency", "company"].includes(role));
  const heroBackground = user.banner_url || user.avatar_url;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 space-y-6">
      <HouseRulesModal open={showHouseRules} onOpenChange={setShowHouseRules} />
      <EditProfileDialog
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        user={user}
        onProfileUpdate={handleProfileUpdate}
        agencyAccounts={agencyAccounts}
        companyAccounts={companyAccounts}
      />

      {/* Profile Hero */}
      <div className="relative overflow-hidden rounded-3xl shadow-floating border border-white/70 dark:border-midnight-50/30">
        {heroBackground ? (
          <img
            src={heroBackground}
            alt="Profiel achtergrond"
            className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
            aria-hidden
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-serenity-600 via-serenity-500 to-midnight-900" aria-hidden />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" aria-hidden />

        <div className="relative p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              <Avatar className="w-28 h-28 sm:w-32 sm:h-32 ring-4 ring-white shadow-2xl border-4 border-white/80 bg-white/60">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.display_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="text-white space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold drop-shadow-lg">
                  {user.display_name || user.full_name}
                </h1>
                <p className="text-white/80 max-w-2xl">
                  {user.bio || "Deel je verhaal en inspireer anderen..."}
                </p>
              </div>
            </div>
            {isOwner && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowEditProfile(true)}
                className="bg-white/90 text-midnight-900 hover:bg-white"
              >
                <Settings className="w-5 h-5 mr-2" />
                Instellingen
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {[...(user.roles || [])]
              .sort((a, b) => (a === primaryRole ? -1 : b === primaryRole ? 1 : 0))
              .map(roleId => {
                const roleInfo = userRoles.find(r => r.id === roleId);
                const isPrimary = roleId === primaryRole;
                return (
                  <Badge
                    key={roleId}
                    variant="secondary"
                    className="bg-white/20 text-white border-white/40 flex items-center gap-1"
                  >
                    {roleInfo?.label}
                    {isPrimary && <span className="text-[11px] font-semibold text-amber-200">Primair</span>}
                  </Badge>
                );
              })}
            {user.styles?.slice(0, 3).map(styleId => {
              const styleInfo = photographyStyles.find(s => s.id === styleId);
              const tone = getStyleTone(styleId);
              return (
                <Badge
                  key={styleId}
                  className={`bg-gradient-to-r ${tone.gradient} ${tone.text} border ${tone.border} ring-1 ring-white/70 shadow-none px-3 py-1 rounded-full text-sm font-semibold`}
                >
                  {styleInfo?.label}
                </Badge>
              );
            })}
          </div>

          {(user.agency_affiliation || user.company_affiliation) && (
            <div className="flex flex-wrap gap-4 text-sm text-white/90">
              {user.agency_affiliation && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Agency:</span>
                  {renderAffiliation(user.agency_affiliation, 'agency', 'dark')}
                </div>
              )}
              {user.company_affiliation && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Bedrijf:</span>
                  {renderAffiliation(user.company_affiliation, 'company', 'dark')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
        <CardContent className="p-4 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-center px-4 py-2 rounded-xl bg-serenity-50 dark:bg-midnight-100/40 min-w-[120px]">
              <div className="text-3xl font-bold text-midnight-900 dark:text-white">{userPosts.length}</div>
              <div className="text-xs font-semibold tracking-wide text-serenity-700 dark:text-serenity-100 uppercase">Posts</div>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-serenity-50 dark:bg-midnight-100/40 min-w-[120px]">
              <div className="text-3xl font-bold text-midnight-900 dark:text-white">{savedPosts.length}</div>
              <div className="text-xs font-semibold tracking-wide text-serenity-700 dark:text-serenity-100 uppercase">Moodboard</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to={createPageUrl("Analytics")}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-serenity-100 dark:bg-midnight-100/40"
                title="Statistieken"
              >
                <BarChart2 className="w-5 h-5" />
              </Button>
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
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-serenity-100 dark:bg-midnight-100/40"
              onClick={toggleSensitiveContent}
              title={user.show_sensitive_content ? "Gevoelige content verbergen" : "Gevoelige content tonen"}
            >
              {user.show_sensitive_content ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-serenity-100 dark:bg-midnight-100/40"
              onClick={() => setShowHouseRules(true)}
              title="Huisregels"
            >
              <Shield className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-serenity-100 dark:bg-midnight-100/40"
              onClick={handleLogout}
              title="Uitloggen"
            >
              <LogOut className="w-5 h-5 text-red-500" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full glass-panel shadow-floating overflow-hidden">
        <div className="border-b border-serenity-100/80 dark:border-midnight-100/40 bg-white/70 dark:bg-midnight-100/40 px-2 py-1">
          <TabsList
            className={`grid w-full ${showTalentTab ? "grid-cols-3" : "grid-cols-2"} bg-transparent shadow-none gap-2`}
          >
            <TabsTrigger
              value="posts"
              className="flex items-center justify-center space-x-2 rounded-xl data-[state=active]:bg-serenity-600 data-[state=active]:text-white"
            >
              <Grid className="w-4 h-4" />
              <span>Mijn Posts</span>
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="flex items-center justify-center space-x-2 rounded-xl data-[state=active]:bg-serenity-600 data-[state=active]:text-white"
            >
              <Bookmark className="w-4 h-4" />
              <span>Moodboard</span>
            </TabsTrigger>
            {showTalentTab && (
              <TabsTrigger
                value="talent"
                className="flex items-center justify-center space-x-2 rounded-xl data-[state=active]:bg-serenity-600 data-[state=active]:text-white"
              >
                <Users className="w-4 h-4" />
                <span>Talent</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="p-4 sm:p-6">
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
                    className="relative group overflow-hidden rounded-2xl border border-white/70 dark:border-midnight-50/30 bg-white/60 dark:bg-midnight-100/30 shadow-floating aspect-[3/4]"
                  >
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    <div className="relative h-full flex flex-col justify-end p-4">
                      <h4 className="text-white font-semibold drop-shadow-lg">{post.title}</h4>
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
                    className="relative group overflow-hidden rounded-2xl border border-white/70 dark:border-midnight-50/30 bg-white/60 dark:bg-midnight-100/30 shadow-floating aspect-[3/4] cursor-pointer"
                  >
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    <div className="relative h-full flex flex-col justify-end p-4">
                      <h4 className="text-white font-semibold drop-shadow-lg">{post.title}</h4>
                      <p className="text-sm text-white/80">door {post.photographer_name}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

        {showTalentTab && (
          <TabsContent value="talent">
            <div className="glass-panel shadow-floating">
              <div className="p-4 space-y-4 max-h-[520px] overflow-y-auto">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-midnight-900 dark:text-white">Gekoppeld talent</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Overzicht van modellen en creators die aan dit profiel zijn gekoppeld.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-serenity-200 text-serenity-800 dark:text-serenity-100">
                    {linkedModels.length} gekoppeld
                  </Badge>
                </div>

                {linkedModels.length === 0 ? (
                  <div className="text-center py-10 text-slate-700 dark:text-slate-200">
                    <p className="font-medium">Nog geen talent gekoppeld.</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Voeg namen of accounts toe in je profielinstellingen.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {linkedModels.map((talent) => {
                      const profileTarget = talent.email || talent.id
                        ? `${createPageUrl('Profile')}?user=${encodeURIComponent(talent.id || talent.email)}`
                        : null;
                      const talentRoles = Array.isArray(talent.roles) ? talent.roles : [];
                      const isManual = talent.is_manual || (!talent.email && talentRoles.length === 0);

                      return (
                        <Card key={talent.email || talent.id || talent.display_name} className="glass-panel shadow-soft">
                          <CardContent className="p-4 flex gap-3 items-center">
                            <Avatar className="w-12 h-12 ring-2 ring-white/70">
                              {talent.avatar_url ? <AvatarImage src={talent.avatar_url} /> : null}
                              <AvatarFallback>{talent.display_name?.[0] || talent.full_name?.[0] || "T"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              {profileTarget && !isManual ? (
                                <Link
                                  to={profileTarget}
                                  className="text-midnight-900 dark:text-white font-semibold hover:underline line-clamp-1"
                                >
                                  {talent.display_name || talent.full_name || talent.email}
                                </Link>
                              ) : (
                                <p className="text-midnight-900 dark:text-white font-semibold line-clamp-1">
                                  {talent.display_name || talent.full_name || talent.email}
                                </p>
                              )}
                              {talentRoles.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {talentRoles.map((roleId) => {
                                    const roleInfo = userRoles.find((role) => role.id === roleId);
                                    return (
                                      <Badge
                                        key={`${talent.email || talent.id}-${roleId}`}
                                        variant="secondary"
                                        className="bg-serenity-50 text-serenity-800 border-serenity-100"
                                      >
                                        {roleInfo?.label || roleId}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Vrije affiliatie</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        )}
        </div>
      </Tabs>
    </div>
  );
}
