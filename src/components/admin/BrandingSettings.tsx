import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Image as ImageIcon, Palette } from "lucide-react";

const BrandingSettings = () => {
  const [settings, setSettings] = useState({
    website_logo: "",
    coc_logo: "",
    home_primary_color: "#3B82F6",
    home_secondary_color: "#F59E0B",
    home_accent_color: "#8B5CF6",
    home_bg_start: "#0F172A",
    home_bg_end: "#1E293B",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('election_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (data) {
      setSettings({
        website_logo: data.website_logo || "",
        coc_logo: data.coc_logo || "",
        home_primary_color: data.home_primary_color || "#3B82F6",
        home_secondary_color: data.home_secondary_color || "#F59E0B",
        home_accent_color: data.home_accent_color || "#8B5CF6",
        home_bg_start: data.home_bg_start || "#0F172A",
        home_bg_end: data.home_bg_end || "#1E293B",
      });
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('election_settings')
        .update({
          website_logo: settings.website_logo,
          coc_logo: settings.coc_logo,
          home_primary_color: settings.home_primary_color,
          home_secondary_color: settings.home_secondary_color,
          home_accent_color: settings.home_accent_color,
          home_bg_start: settings.home_bg_start,
          home_bg_end: settings.home_bg_end,
        })
        .eq('id', 1);

      if (error) throw error;

      await supabase.from('audit_log').insert({
        actor_label: 'admin',
        action: 'UPDATE_BRANDING',
        payload_json: settings,
      });

      toast({
        title: "Success",
        description: "Branding settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Branding & Theme</h2>
        <p className="text-muted-foreground">Customize logos and home page colors</p>
      </div>

      {/* Logos Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Logo Settings</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Website Logo URL</Label>
            <Input
              value={settings.website_logo}
              onChange={(e) => setSettings({ ...settings, website_logo: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Main website logo displayed in header
            </p>
            {settings.website_logo && (
              <div className="mt-2 p-4 bg-muted rounded-lg">
                <img 
                  src={settings.website_logo} 
                  alt="Website logo preview"
                  className="h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <Label>Clash of Clans Logo URL</Label>
            <Input
              value={settings.coc_logo}
              onChange={(e) => setSettings({ ...settings, coc_logo: e.target.value })}
              placeholder="https://example.com/coc-logo.png"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Clash of Clans logo displayed on home page
            </p>
            {settings.coc_logo && (
              <div className="mt-2 p-4 bg-muted rounded-lg">
                <img 
                  src={settings.coc_logo} 
                  alt="CoC logo preview"
                  className="h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Color Theme Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Home Page Colors</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.home_primary_color}
                onChange={(e) => setSettings({ ...settings, home_primary_color: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={settings.home_primary_color}
                onChange={(e) => setSettings({ ...settings, home_primary_color: e.target.value })}
                placeholder="#3B82F6"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Main brand color for buttons and accents
            </p>
          </div>

          <div>
            <Label>Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.home_secondary_color}
                onChange={(e) => setSettings({ ...settings, home_secondary_color: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={settings.home_secondary_color}
                onChange={(e) => setSettings({ ...settings, home_secondary_color: e.target.value })}
                placeholder="#F59E0B"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Secondary accent color
            </p>
          </div>

          <div>
            <Label>Accent Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.home_accent_color}
                onChange={(e) => setSettings({ ...settings, home_accent_color: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={settings.home_accent_color}
                onChange={(e) => setSettings({ ...settings, home_accent_color: e.target.value })}
                placeholder="#8B5CF6"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Third accent color for variety
            </p>
          </div>

          <div>
            <Label>Background Start</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.home_bg_start}
                onChange={(e) => setSettings({ ...settings, home_bg_start: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={settings.home_bg_start}
                onChange={(e) => setSettings({ ...settings, home_bg_start: e.target.value })}
                placeholder="#0F172A"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gradient background start color
            </p>
          </div>

          <div>
            <Label>Background End</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.home_bg_end}
                onChange={(e) => setSettings({ ...settings, home_bg_end: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={settings.home_bg_end}
                onChange={(e) => setSettings({ ...settings, home_bg_end: e.target.value })}
                placeholder="#1E293B"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gradient background end color
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6">
          <Label className="mb-2 block">Color Preview</Label>
          <div 
            className="h-32 rounded-lg p-6 flex items-center justify-center gap-4"
            style={{
              background: `linear-gradient(135deg, ${settings.home_bg_start}, ${settings.home_bg_end})`
            }}
          >
            <div 
              className="px-6 py-3 rounded-lg text-white font-semibold"
              style={{ backgroundColor: settings.home_primary_color }}
            >
              Primary
            </div>
            <div 
              className="px-6 py-3 rounded-lg text-white font-semibold"
              style={{ backgroundColor: settings.home_secondary_color }}
            >
              Secondary
            </div>
            <div 
              className="px-6 py-3 rounded-lg text-white font-semibold"
              style={{ backgroundColor: settings.home_accent_color }}
            >
              Accent
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-4 w-4" />
          Save Branding Settings
        </Button>
      </div>

      {/* Instructions */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">Guidelines</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• <strong>Logos:</strong> Use publicly accessible URLs (PNG or SVG recommended)</li>
          <li>• <strong>Website Logo:</strong> Best at 200-300px width, transparent background</li>
          <li>• <strong>CoC Logo:</strong> Official Clash of Clans logo for branding</li>
          <li>• <strong>Colors:</strong> Use hex color codes (#RRGGBB format)</li>
          <li>• <strong>Contrast:</strong> Ensure text is readable on chosen backgrounds</li>
          <li>• <strong>Consistency:</strong> Choose colors that work well together</li>
        </ul>
      </Card>
    </div>
  );
};

export default BrandingSettings;
