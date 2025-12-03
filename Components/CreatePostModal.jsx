import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UploadFile, InvokeLLM } from '../src/integrations/Core';
import { User } from '../entities/User.js';
import { Camera, X, Shield, Loader2, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import PropTypes from 'prop-types';
import { getStylePillClasses, photographyStyles } from '../utils/photographyStyles';

const triggerWarnings = [
  { id: 'artistic_nudity', label: 'Naakt' },
  { id: 'blood', label: 'Bloed' },
  { id: 'violence', label: 'Geweld' },
  { id: 'drugs', label: 'Drugs' },
  { id: 'medical', label: 'Ziekte / medisch' },
  { id: 'self_harm', label: 'Zelfbeschadiging' },
];

const roleLabels = {
  model: 'Model',
  photographer: 'Fotograaf',
  makeup_artist: 'MUA',
  stylist: 'Stylist',
  assistant: 'Assistent',
  other: 'Overig',
  artist: 'Artist',
  agency: 'Agency',
  company: 'Bedrijf',
};

export default function CreatePostModal({ open, onOpenChange, onPostCreated }) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [contentError, setContentError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [autoTagUser, setAutoTagUser] = useState(true);
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    caption: '',
    photography_style: '',
    tags: [],
    trigger_warnings: [],
    tagged_people: [],
    location: '',
    image_url: '',
  });
  const [newPersonTag, setNewPersonTag] = useState({ name: '', role: 'model', instagram: '' });

  const isFanOnly =
    Array.isArray(currentUser?.roles) &&
    currentUser.roles.length > 0 &&
    currentUser.roles.every((role) => role === 'fan');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setCurrentUser(userData);
      } catch (error) {
        console.error('User not logged in:', error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    let autoTriggers = [];
    [...newPost.tags, newPost.photography_style].forEach((tag) => {
      const styleInfo = photographyStyles.find((s) => s.id === tag);
      if (styleInfo?.autoTrigger) autoTriggers.push(...styleInfo.autoTrigger);
    });

    // Ensure unique autoTriggers to avoid redundant checks and prevent adding the same warning multiple times
    const uniqueAutoTriggers = [...new Set(autoTriggers)];

    const currentWarnings = newPost.trigger_warnings;
    const newWarnings = uniqueAutoTriggers.filter((trigger) => !currentWarnings.includes(trigger));

    if (newWarnings.length > 0) {
      setNewPost((prev) => ({
        ...prev,
        trigger_warnings: [...prev.trigger_warnings, ...newWarnings],
      }));
    }
  }, [newPost.tags, newPost.photography_style, newPost.trigger_warnings]); // Added newPost.trigger_warnings to dependencies to fix warning and ensure current state is used.

  useEffect(() => {
    if (newPost.title && newPost.image_url && newPost.photography_style && validationMessage) {
      setValidationMessage('');
    }
  }, [newPost.title, newPost.image_url, newPost.photography_style, validationMessage]);

  const analyzeImageContent = async (imageUrl) => {
    setAnalyzing(true);
    setContentError(null);
    try {
      const analysis = await InvokeLLM({
        prompt: `Analyseer deze afbeelding op ongepaste seksuele inhoud. BELANGRIJK: Exhibit is een platform voor artistieke fotografie. Artistiek naakt en Boudoir fotografie zijn toegestaan als het artistiek van aard is. VERBODEN INHOUD: Expliciete seksuele handelingen, Genitaliën in niet-artistieke context, Pornografische poses of situaties, Seksspeeltjes of -attributen, Suggestieve handelingen van seksuele aard. TOEGESTAAN: Artistiek naakt (zoals fine art nude fotografie), Boudoir fotografie (smaakvolle lingerie fotografie), Censuur via handen, objecten of strategische positionering. Beoordeel of deze afbeelding toegestaan is op het platform.`,
        file_urls: [imageUrl],
        response_json_schema: {
          type: 'object',
          properties: {
            is_appropriate: { type: 'boolean' },
            reason: { type: 'string' },
            suggested_warnings: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      if (!analysis.is_appropriate) {
        setContentError(analysis.reason);
        setNewPost((prev) => ({ ...prev, image_url: '' }));
      } else if (analysis.suggested_warnings?.length > 0) {
        setNewPost((prev) => ({
          ...prev,
          trigger_warnings: [
            ...new Set([...prev.trigger_warnings, ...analysis.suggested_warnings]),
          ],
        }));
      }
    } catch (error) {
      console.error('Content analysis error:', error);
    }
    setAnalyzing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setContentError(null);
    try {
      const { file_url } = await UploadFile({ file });
      setNewPost((prev) => ({ ...prev, image_url: file_url }));
      await analyzeImageContent(file_url);
    } catch (error) {
      console.error('Upload error:', error);
    }
    setUploading(false);
  };

  const handleTriggerClick = (triggerId) =>
    setNewPost((prev) => ({
      ...prev,
      trigger_warnings: prev.trigger_warnings.includes(triggerId)
        ? prev.trigger_warnings.filter((t) => t !== triggerId)
        : [...prev.trigger_warnings, triggerId],
    }));

  const addPersonTag = () => {
    if (!newPersonTag.name.trim()) return;
    setNewPost((prev) => ({
      ...prev,
      tagged_people: [...prev.tagged_people, { ...newPersonTag }],
    }));
    setNewPersonTag({ name: '', role: 'model', instagram: '' });
  };

  const removePersonTag = (index) =>
    setNewPost((prev) => ({
      ...prev,
      tagged_people: prev.tagged_people.filter((_, i) => i !== index),
    }));

  const handleCreatePost = async () => {
    if (isFanOnly) {
      setValidationMessage('Alleen makers kunnen foto’s plaatsen. Fan-accounts kunnen niet posten.');
      return;
    }

    if (!newPost.title || !newPost.image_url || !newPost.photography_style) {
      const missing = [
        !newPost.image_url && 'een foto',
        !newPost.title && 'een titel',
        !newPost.photography_style && 'een hoofdstijl',
      ]
        .filter(Boolean)
        .join(', ');
      setValidationMessage(`Plaatsen kan pas nadat je ${missing} hebt gekozen.`);
      return;
    }

    setValidationMessage('');

    let finalTaggedPeople = [...newPost.tagged_people];

    if (autoTagUser && currentUser?.roles && currentUser.roles.length > 0) {
      currentUser.roles.forEach((role) => {
        if (
          !finalTaggedPeople.some((p) => p.name === currentUser.display_name && p.role === role)
        ) {
          finalTaggedPeople.push({
            name: currentUser.display_name,
            role: role,
            instagram: currentUser.instagram || '',
          });
        }
      });
    }

    await onPostCreated({
      ...newPost,
      tagged_people: finalTaggedPeople,
      photographer_name: currentUser?.display_name || 'Onbekend',
      is_approved: true,
    });

    setNewPost({
      title: '',
      caption: '',
      photography_style: '',
      tags: [],
      trigger_warnings: [],
      tagged_people: [],
      location: '',
      image_url: '',
    });
    setAutoTagUser(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-2xl font-bold text-blue-900 flex items-center">
              <Camera className="w-6 h-6 mr-2" />
              Nieuwe foto delen
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Sluit de modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>
        <div className="space-y-6">
          {contentError && (
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Content niet toegestaan:</strong> {contentError}
              </AlertDescription>
            </Alert>
          )}

          {isFanOnly && (
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Fan-accounts kunnen geen posts plaatsen. Voeg een maker-rol toe aan je profiel om foto’s te delen.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 lg:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="image" className="text-lg font-semibold">
                  Foto uploaden
                </Label>
                  <p className="text-sm text-slate-500">Selecteer of vervang de hoofdfoto.</p>
                </div>
                {newPost.image_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image')?.click()}
                    disabled={analyzing}
                  >
                    {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Wijzig
                  </Button>
                )}
              </div>
              <div className="mt-1">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isFanOnly}
                />
                {!newPost.image_url ? (
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    className="w-full h-48 border-dashed border-2 border-slate-300 hover:border-blue-400 bg-slate-50"
                    disabled={uploading || analyzing || isFanOnly}
                  >
                    <div className="text-center" aria-hidden>
                      {analyzing ? (
                        <Loader2 className="w-12 h-12 mx-auto mb-3 text-blue-500 animate-spin" />
                      ) : uploading ? (
                        <Loader2 className="w-12 h-12 mx-auto mb-3 text-blue-500 animate-spin" />
                      ) : (
                        <Camera className="w-12 h-12 mx-auto text-slate-400" />
                      )}
                    </div>
                    <span className="sr-only">Kies een foto</span>
                  </Button>
                ) : (
                  <div className="relative overflow-hidden rounded-xl border bg-slate-50">
                    <img
                      src={newPost.image_url}
                      alt="Preview"
                      className="w-full max-h-72 object-cover"
                    />
                    {newPost.trigger_warnings.length > 0 && (
                      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm text-white flex flex-col items-center justify-center gap-2">
                        <EyeOff className="w-8 h-8" />
                        <p className="text-sm font-semibold">Sensitive cover actief</p>
                      </div>
                    )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => document.getElementById('image')?.click()}
                    className="absolute top-3 right-3 shadow"
                    disabled={analyzing || isFanOnly}
                  >
                    {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Wijzig foto
                  </Button>
                </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-lg p-4 lg:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Stijlen</h3>
                <span className="text-xs uppercase tracking-wide text-slate-400">Match</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-700">Hoofdstijl</p>
                  {newPost.photography_style ? (
                    <span className="text-xs text-slate-500">{newPost.photography_style}</span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                  {(showAllStyles ? photographyStyles : photographyStyles.slice(0, 10)).map(
                    (style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() =>
                          setNewPost((prev) => ({ ...prev, photography_style: style.id }))
                        }
                        className={`${getStylePillClasses(style.id, {
                          active: newPost.photography_style === style.id,
                        })} whitespace-nowrap px-4 py-2 text-sm font-semibold`}
                      >
                        {style.label}
                      </button>
                    ),
                  )}
                </div>
                {photographyStyles.length > 10 && (
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setShowAllStyles((p) => !p)}>
                      {showAllStyles ? 'Minder' : 'Meer'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-lg p-4 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Waarschuwingen</h3>
                <span className="text-xs uppercase tracking-wide text-slate-400">Content</span>
              </div>
              <p className="text-sm text-slate-600">
                Kies passende waarschuwingen; bij een gevoelige keuze wordt automatisch een cover over de foto geplaatst.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {triggerWarnings.map((warning) => (
                  <Button
                    key={warning.id}
                    variant={
                      newPost.trigger_warnings.includes(warning.id) ? 'destructive' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleTriggerClick(warning.id)}
                    className="text-xs"
                  >
                    {warning.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Titel & beschrijving</h3>
                <span className="text-xs uppercase tracking-wide text-slate-400">Details</span>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Titel</Label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Geef je post een titel"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Beschrijving</Label>
                <Textarea
                  value={newPost.caption}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, caption: e.target.value }))}
                  placeholder="Vertel iets over deze foto"
                  className="min-h-[140px]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Credits & tagging</h3>
                <span className="text-xs uppercase tracking-wide text-slate-400">Team</span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Checkbox
                  id="autoTag"
                  checked={autoTagUser}
                  onCheckedChange={setAutoTagUser}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="autoTag" className="text-sm font-medium cursor-pointer">
                    Voeg mij automatisch toe (model, jij)
                  </label>
                  {currentUser &&
                    autoTagUser &&
                    currentUser.roles &&
                    currentUser.roles.length > 0 && (
                      <div className="mt-2 text-xs text-slate-600">
                        Je wordt toegevoegd als:{' '}
                        {currentUser.roles.map((r) => roleLabels[r] || r).join(', ')}
                      </div>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Naam (model)"
                  value={newPersonTag.name}
                  onChange={(e) => setNewPersonTag((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Select
                  value={newPersonTag.role}
                  onValueChange={(value) => setNewPersonTag((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photographer">Fotograaf</SelectItem>
                    <SelectItem value="model">Model</SelectItem>
                    <SelectItem value="artist">Artist</SelectItem>
                    <SelectItem value="makeup_artist">MUA</SelectItem>
                    <SelectItem value="stylist">Stylist</SelectItem>
                    <SelectItem value="assistant">Assistent</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="company">Bedrijf</SelectItem>
                    <SelectItem value="other">Overig</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="(Optioneel) link/portfolio"
                  value={newPersonTag.instagram}
                  onChange={(e) => setNewPersonTag((prev) => ({ ...prev, instagram: e.target.value }))}
                />
              </div>
              <Button onClick={addPersonTag} size="sm" variant="secondary" className="w-full">
                Toevoegen
              </Button>

              {newPost.tagged_people.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newPost.tagged_people.map((person, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-2">
                      {person.name} ({roleLabels[person.role]})
                      <button onClick={() => removePersonTag(index)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-slate-200 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:min-w-[140px]">
              Annuleren
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={analyzing || !!contentError || isFanOnly}
              className="bg-blue-800 hover:bg-blue-900 sm:min-w-[160px]"
            >
              {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Foto delen
            </Button>
          </div>
          {validationMessage && (
            <p className="text-sm text-red-600 text-right">{validationMessage}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

CreatePostModal.propTypes = {
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  onPostCreated: PropTypes.func,
};
