import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ElectionSettings = () => {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    
    if (data) setSettings(data);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('election_settings')
        .update(settings)
        .eq('id', 1);

      if (error) throw error;

      await supabase.from('audit_log').insert({
        actor_label: 'admin',
        action: 'UPDATE_SETTINGS',
        payload_json: settings,
      });

      toast({
        title: "Settings saved",
        description: "Election settings updated successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!settings) return <div>Loading...</div>;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Election Settings</h2>
      
      <div className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Date & Time</Label>
            <Input
              type="datetime-local"
              value={settings.start_at ? new Date(settings.start_at).toISOString().slice(0, 16) : ''}
              onChange={(e) => setSettings({ ...settings, start_at: e.target.value })}
            />
          </div>
          <div>
            <Label>End Date & Time</Label>
            <Input
              type="datetime-local"
              value={settings.end_at ? new Date(settings.end_at).toISOString().slice(0, 16) : ''}
              onChange={(e) => setSettings({ ...settings, end_at: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-semibold">Election Live</Label>
              <p className="text-sm text-muted-foreground">Enable voting for all users</p>
            </div>
            <Switch
              checked={settings.is_live}
              onCheckedChange={(checked) => setSettings({ ...settings, is_live: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-semibold">Allow Vote Changes</Label>
              <p className="text-sm text-muted-foreground">Let voters modify their votes</p>
            </div>
            <Switch
              checked={settings.allow_vote_changes}
              onCheckedChange={(checked) => setSettings({ ...settings, allow_vote_changes: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-semibold">Show Live Stats</Label>
              <p className="text-sm text-muted-foreground">Display real-time voting statistics</p>
            </div>
            <Switch
              checked={settings.show_live_stats}
              onCheckedChange={(checked) => setSettings({ ...settings, show_live_stats: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-semibold">Allow Ad-hoc Voters</Label>
              <p className="text-sm text-muted-foreground">Let unregistered users create profiles</p>
            </div>
            <Switch
              checked={settings.allow_adhoc_voters}
              onCheckedChange={(checked) => setSettings({ ...settings, allow_adhoc_voters: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-destructive/10">
            <div>
              <Label className="text-base font-semibold">Freeze Results</Label>
              <p className="text-sm text-muted-foreground">Lock all votes (cannot be undone)</p>
            </div>
            <Switch
              checked={settings.frozen}
              onCheckedChange={(checked) => setSettings({ ...settings, frozen: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/10">
            <div>
              <Label className="text-base font-semibold">Publish Results</Label>
              <p className="text-sm text-muted-foreground">Make election results visible to everyone</p>
            </div>
            <Switch
              checked={settings.publish_results}
              onCheckedChange={(checked) => setSettings({ ...settings, publish_results: checked })}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </Card>
  );
};

export default ElectionSettings;
