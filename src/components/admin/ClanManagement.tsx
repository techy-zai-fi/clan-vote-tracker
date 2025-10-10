import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Save, X, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "./ImageUpload";

const ClanManagement = () => {
  const [clans, setClans] = useState<any[]>([]);
  const [editingClan, setEditingClan] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    quote: "",
    logo_url: "",
    bg_image: "",
    display_order: 0,
    main_color: "#3B82F6",
    sub_color: "#1E40AF",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadClans();
  }, []);

  const loadClans = async () => {
    const { data } = await supabase
      .from('clans')
      .select('*')
      .order('display_order');
    
    if (data) setClans(data);
  };

  const handleEdit = (clan: any) => {
    setEditingClan(clan);
    setFormData({
      id: clan.id,
      name: clan.name,
      quote: clan.quote || "",
      logo_url: clan.logo_url || "",
      bg_image: clan.bg_image || "",
      display_order: clan.display_order,
      main_color: clan.main_color || "#3B82F6",
      sub_color: clan.sub_color || "#1E40AF",
    });
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('clans')
        .update({
          name: formData.name,
          quote: formData.quote,
          logo_url: formData.logo_url,
          bg_image: formData.bg_image,
          display_order: formData.display_order,
          main_color: formData.main_color,
          sub_color: formData.sub_color,
        })
        .eq('id', formData.id);

      if (error) throw error;

      await supabase.from('audit_log').insert({
        actor_label: 'admin',
        action: 'UPDATE_CLAN',
        payload_json: formData,
      });

      toast({
        title: "Success",
        description: "Clan updated successfully",
      });

      setShowEditDialog(false);
      setEditingClan(null);
      loadClans();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getClanGradient = (clanId: string) => {
    const gradients: Record<string, string> = {
      MM: 'from-blue-600 to-blue-700',
      SS: 'from-gray-600 to-gray-700',
      WW: 'from-sky-600 to-sky-700',
      YY: 'from-yellow-600 to-yellow-700',
      AA: 'from-amber-600 to-amber-700',
      NN: 'from-indigo-600 to-indigo-700',
    };
    return gradients[clanId] || 'from-primary to-accent';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Clan Management</h2>
        <p className="text-muted-foreground">Configure the 6 clans and their visual identity</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clans.map((clan) => (
          <Card key={clan.id} className="overflow-hidden">
            {/* Clan Header */}
            <div className={`h-32 bg-gradient-to-br ${getClanGradient(clan.id)} relative`}>
              {clan.bg_image ? (
                <img 
                  src={clan.bg_image} 
                  alt={clan.name}
                  className="w-full h-full object-cover opacity-50"
                />
              ) : (
                <div className="absolute inset-0 bg-black/10" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  {clan.logo_url ? (
                    <img 
                      src={clan.logo_url} 
                      alt={clan.name}
                      className="h-24 w-24 mx-auto mb-2 object-contain drop-shadow-lg"
                    />
                  ) : (
                    <div className="text-5xl font-bold mb-1">{clan.id}</div>
                  )}
                  <div className="text-base font-bold drop-shadow-md">{clan.name}</div>
                </div>
              </div>
            </div>

            {/* Clan Details */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-muted-foreground">ID:</span>
                  <span className="font-bold">{clan.id}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Order:</span>
                  <span>{clan.display_order}</span>
                </div>
                {clan.quote && (
                  <p className="text-sm italic text-muted-foreground mt-3">
                    "{clan.quote}"
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  <span>Logo: {clan.logo_url ? '✓' : '✗'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  <span>Background: {clan.bg_image ? '✓' : '✗'}</span>
                </div>
              </div>

              <Button 
                onClick={() => handleEdit(clan)}
                className="w-full mt-4"
                variant="outline"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Clan
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Clan: {formData.id}</DialogTitle>
            <DialogDescription>
              Update clan information and visual assets
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Clan ID (2 letters)</Label>
                <Input
                  value={formData.id}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ID cannot be changed
                </p>
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Clan Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bodhi"
              />
            </div>

            <div>
              <Label>Quote / Tagline</Label>
              <Textarea
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                placeholder="e.g., Wisdom and Enlightenment"
                rows={2}
              />
            </div>

            <ImageUpload
              label="Logo"
              value={formData.logo_url}
              onChange={(url) => setFormData({...formData, logo_url: url})}
              folder="logos"
            />
            <ImageUpload
              label="Background Image"
              value={formData.bg_image}
              onChange={(url) => setFormData({...formData, bg_image: url})}
              folder="backgrounds"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Main Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.main_color}
                    onChange={(e) => setFormData({ ...formData, main_color: e.target.value })}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    value={formData.main_color}
                    onChange={(e) => setFormData({ ...formData, main_color: e.target.value })}
                    placeholder="#3B82F6"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Primary clan color for graphics
                </p>
              </div>
              <div>
                <Label>Sub Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.sub_color}
                    onChange={(e) => setFormData({ ...formData, sub_color: e.target.value })}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    value={formData.sub_color}
                    onChange={(e) => setFormData({ ...formData, sub_color: e.target.value })}
                    placeholder="#1E40AF"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Secondary clan color for accents
                </p>
              </div>
            </div>

            {/* Preview */}
            {(formData.logo_url || formData.bg_image) && (
              <div>
                <Label>Preview</Label>
                <div className={`h-32 bg-gradient-to-br ${getClanGradient(formData.id)} rounded-lg overflow-hidden relative`}>
                  {formData.bg_image && (
                    <img 
                      src={formData.bg_image} 
                      alt="Background preview"
                      className="w-full h-full object-cover opacity-50"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {formData.logo_url ? (
                      <img 
                        src={formData.logo_url} 
                        alt="Logo preview"
                        className="h-16 w-16 object-contain drop-shadow-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-4xl font-bold text-white">{formData.id}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Instructions Card */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">Image Guidelines</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• <strong>Logo:</strong> Should be square (1:1 ratio), transparent PNG recommended, minimum 256x256px</li>
          <li>• <strong>Background:</strong> Should be landscape (16:9 or similar), minimum 1920x1080px for best quality</li>
          <li>• <strong>Hosting:</strong> Images must be publicly accessible URLs (e.g., from Imgur, Cloudinary, or your CDN)</li>
          <li>• <strong>Performance:</strong> Keep file sizes under 500KB for faster loading</li>
          <li>• <strong>Fallback:</strong> If no images are provided, clan ID and gradient colors will be used</li>
        </ul>
      </Card>
    </div>
  );
};

export default ClanManagement;
