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
import { Camera, X, Shield, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import PropTypes from 'prop-types';

const photographyStyles = [
  { id: 'portrait', label: 'Portrait' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'boudoir', label: 'Boudoir', autoTrigger: ['artistic_nudity'] },
  { id: 'art_nude', label: 'Art Nude', autoTrigger: ['artistic_nudity'] },
  { id: 'street', label: 'Street' },
  { id: 'landscape', label: 'Landscape' },
  { id: 'nature', label: 'Nature' },
  { id: 'conceptual', label: 'Conceptual' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'fine_art', label: 'Fine Art' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'sport', label: 'Sport' },
  { id: 'advertising', label: 'Advertising' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'documentary', label: 'Documentary' },
  { id: 'travel', label: 'Travel' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'macro', label: 'Macro' },
  { id: 'wildlife', label: 'Wildlife' },
  { id: 'food', label: 'Food' },
  { id: 'product', label: 'Product' },
  { id: 'automotive', label: 'Automotive' },
  { id: 'event', label: 'Event' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'maternity', label: 'Maternity' },
  { id: 'family', label: 'Family' },
  { id: 'children', label: 'Children' },
  { id: 'pet', label: 'Pet' },
  { id: 'black_white', label: 'Black & White' },
  { id: 'abstract', label: 'Abstract' },
  { id: 'surreal', label: 'Surreal' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'candid', label: 'Candid' },
  { id: 'glamour', label: 'Glamour' },
];

const triggerWarnings = [
  { id: 'artistic_nudity', label: 'Artistiek naakt' },
  { id: 'blood', label: 'Bloed' },
  { id: 'violence', label: 'Geweld' },
  { id: 'drugs', label: 'Drugs' },
  { id: 'alcohol', label: 'Alcohol' },
  { id: 'smoking', label: 'Roken' },
];

const roleLabels = {
  model: 'Model',
  photographer: 'Fotograaf',
  makeup_artist: 'MUA',
  stylist: 'Stylist',
  assistant: 'Assistent',
  other: 'Overig',
  artist: 'Artist',
};

export default function CreatePostModal({ open, onOpenChange, onPostCreated }) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [contentError, setContentError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [autoTagUser, setAutoTagUser] = useState(true);
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

  const handleTagClick = (tagId) =>
    setNewPost((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));
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
    if (!newPost.title || !newPost.image_url || !newPost.photography_style) return;

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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-900 flex items-center">
            <Camera className="w-6 h-6 mr-2" />
            Nieuwe foto delen
          </DialogTitle>
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

          <div>
            <Label htmlFor="image" className="text-lg font-semibold">
              Foto uploaden *
            </Label>
            <div className="mt-2">
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {!newPost.image_url ? (
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                  className="w-full h-40 border-dashed border-2 border-slate-300 hover:border-blue-400 bg-slate-50"
                  disabled={uploading || analyzing}
                >
                  <div className="text-center">
                    {analyzing ? (
                      <>
                        <Loader2 className="w-12 h-12 mx-auto mb-3 text-blue-500 animate-spin" />
                        <p className="text-lg font-medium">Analyseren van inhoud...</p>
                      </>
                    ) : uploading ? (
                      <>
                        <Loader2 className="w-12 h-12 mx-auto mb-3 text-blue-500 animate-spin" />
                        <p className="text-lg font-medium">Uploaden...</p>
                      </>
                    ) : (
                      <>
                        <Camera className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                        <p className="text-lg font-medium">Selecteer een foto</p>
                      </>
                    )}
                  </div>
                </Button>
              ) : (
                <div className="relative">
                  <img
                    src={newPost.image_url}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg border"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => document.getElementById('image')?.click()}
                    className="absolute top-2 right-2"
                    disabled={analyzing}
                  >
                    {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Wijzig
                    foto
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Input
              value={newPost.title}
              onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Geef je post een titel *"
            />
            <Textarea
              value={newPost.caption}
              onChange={(e) => setNewPost((prev) => ({ ...prev, caption: e.target.value }))}
              placeholder="Beschrijving"
              className="min-h-[100px]"
            />
          </div>

          <div className="border rounded-lg p-4 bg-slate-50">
            <h3 className="font-semibold text-base mb-3">Credits automatiseren</h3>

            <div className="flex items-start space-x-3 mb-4">
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

            <Label className="text-sm mb-2 block">Tag</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
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
                  <SelectItem value="other">Overig</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="(Optioneel) link/portfolio"
                value={newPersonTag.instagram}
                onChange={(e) =>
                  setNewPersonTag((prev) => ({ ...prev, instagram: e.target.value }))
                }
              />
            </div>
            <Button onClick={addPersonTag} size="sm" variant="secondary" className="w-full">
              Toevoegen
            </Button>

            {newPost.tagged_people.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
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

          <div>
            <Label className="text-base font-semibold mb-3 block">Fotografiestijlen</Label>
            <Select
              value={newPost.photography_style}
              onValueChange={(value) =>
                setNewPost((prev) => ({ ...prev, photography_style: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Hoofdstijl *" />
              </SelectTrigger>
              <SelectContent>
                {photographyStyles.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {photographyStyles.slice(0, 12).map((style) => (
                <Button
                  key={style.id}
                  variant={newPost.tags.includes(style.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTagClick(style.id)}
                  className="text-xs"
                >
                  {style.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Waarschuwingen</Label>
            <div className="grid grid-cols-3 gap-2">
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

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={
                !newPost.title ||
                !newPost.image_url ||
                !newPost.photography_style ||
                analyzing ||
                !!contentError
              }
              className="bg-blue-800 hover:bg-blue-900 min-w-[120px]"
            >
              {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Foto delen
            </Button>
          </div>
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
