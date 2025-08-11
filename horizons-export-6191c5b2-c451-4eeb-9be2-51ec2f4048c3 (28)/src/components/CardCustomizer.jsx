import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Palette, Save, Upload, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { LoyaltyCard } from '@/components/customer-card/LoyaltyCard';

const CardCustomizer = ({ location, onSave, rewards }) => {
  const [design, setDesign] = useState({
    card_bg_color: '#1c1c22',
    card_text_color: '#ffffff',
    card_stamp_color: '#8b5cf6',
    logo_url: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const currentRewards = Array.isArray(rewards) ? rewards : [];

  useEffect(() => {
    setDesign({
      card_bg_color: location.card_bg_color || '#1c1c22',
      card_text_color: location.card_text_color || '#ffffff',
      card_stamp_color: location.card_stamp_color || '#8b5cf6',
      logo_url: location.logo_url || null,
    });
    setLogoPreview(location.logo_url || null);
    setLogoFile(null);
  }, [location]);

  const handleColorChange = (e) => {
    setDesign({ ...design, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      toast({ title: 'Invalid File', description: 'Please select a PNG or JPG image.', variant: 'destructive' });
    }
  };

  const handleRemoveLogo = async () => {
    setLogoFile(null);
    setLogoPreview(null);
    setDesign({ ...design, logo_url: null });
    
    if (location.logo_url) {
        const oldFilePath = location.logo_url.substring(location.logo_url.indexOf('/store_logos/') + ('/store_logos/').length);
        if (oldFilePath) {
            await supabase.storage.from('store_logos').remove([oldFilePath]);
        }
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    let newLogoUrl = design.logo_url;

    if (logoFile) {
      const fileName = `${uuidv4()}.${logoFile.name.split('.').pop()}`;
      const filePath = `${location.id}/${fileName}`;
      
      if (location.logo_url) {
        const oldFilePath = location.logo_url.substring(location.logo_url.indexOf('/store_logos/') + ('/store_logos/').length);
        if (oldFilePath && oldFilePath !== filePath) {
          await supabase.storage.from('store_logos').remove([oldFilePath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('store_logos')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        toast({ title: 'Upload Error', description: uploadError.message, variant: 'destructive' });
        setIsSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('store_logos')
        .getPublicUrl(filePath);
      
      newLogoUrl = urlData.publicUrl;
    } else if (logoPreview === null && location.logo_url) {
      newLogoUrl = null;
    }

    const { data, error } = await supabase
      .from('locations')
      .update({ 
        card_bg_color: design.card_bg_color,
        card_text_color: design.card_text_color,
        card_stamp_color: design.card_stamp_color,
        logo_url: newLogoUrl,
      })
      .eq('id', location.id)
      .select()
      .single();
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to save changes.', variant: 'destructive' });
    } else {
      toast({ title: 'Saved!', description: 'Your card design has been updated.' });
      onSave(data);
    }
    setIsSaving(false);
  };
  
  const previewCardData = {
    stamps: 3,
    created_at: new Date().toISOString(),
  };

  const previewCustomerData = {
    full_name: 'Jane Doe',
  };

  const previewLocationData = {
    ...location,
    ...design,
    logo_url: logoPreview,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-white flex items-center"><Palette className="w-5 h-5 mr-2" /> Customization Options</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="card_bg_color" className="text-white">Background Color</Label>
            <Input id="card_bg_color" name="card_bg_color" type="color" value={design.card_bg_color} onChange={handleColorChange} className="p-1 h-10 w-full" />
          </div>
          <div>
            <Label htmlFor="card_text_color" className="text-white">Text Color</Label>
            <Input id="card_text_color" name="card_text_color" type="color" value={design.card_text_color} onChange={handleColorChange} className="p-1 h-10 w-full" />
          </div>
          <div>
            <Label htmlFor="card_stamp_color" className="text-white">Stamp & Accent Color</Label>
            <Input id="card_stamp_color" name="card_stamp_color" type="color" value={design.card_stamp_color} onChange={handleColorChange} className="p-1 h-10 w-full" />
          </div>
          <div>
            <Label className="text-white">Store Logo</Label>
            <Input id="logo-upload" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" onClick={() => fileInputRef.current.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
              {logoPreview && (
                <Button variant="destructive" size="icon" onClick={handleRemoveLogo}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Live Preview</h3>
        <div className="p-4" style={{ backgroundColor: '#0d0d12' }}>
          <div className="w-full max-w-sm mx-auto">
            <LoyaltyCard
              cardData={previewCardData}
              locationData={previewLocationData}
              customerData={previewCustomerData}
              rewards={currentRewards}
              isAnimating={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardCustomizer;