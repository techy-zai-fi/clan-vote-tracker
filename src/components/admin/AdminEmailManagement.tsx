import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Mail } from "lucide-react";

interface AdminEmail {
  id: string;
  email: string;
  created_at: string;
}

const AdminEmailManagement = () => {
  const [adminEmails, setAdminEmails] = useState<AdminEmail[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAdminEmails();
  }, []);

  const loadAdminEmails = async () => {
    const { data } = await supabase
      .from('admin_emails')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setAdminEmails(data);
  };

  const handleAddEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('admin_emails')
        .insert({
          email: newEmail.toLowerCase().trim(),
          added_by: user?.id,
        });

      if (error) throw error;

      await supabase.from('audit_log').insert({
        actor_label: user?.email || 'admin',
        action: 'ADD_ADMIN_EMAIL',
        payload_json: { email: newEmail },
      });

      toast({
        title: "Email added",
        description: "Admin email added successfully",
      });

      setNewEmail("");
      loadAdminEmails();
    } catch (error: any) {
      console.error('Add email error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add admin email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmail = async (id: string, email: string) => {
    if (email === 'balaji.g2027d@iimbg.ac.in') {
      toast({
        title: "Cannot delete",
        description: "Primary admin email cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('admin_emails')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await supabase.from('audit_log').insert({
        actor_label: user?.email || 'admin',
        action: 'DELETE_ADMIN_EMAIL',
        payload_json: { email },
      });

      toast({
        title: "Email removed",
        description: "Admin email removed successfully",
      });

      loadAdminEmails();
    } catch (error: any) {
      console.error('Delete email error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin email",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Admin Email Management</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Add New Admin Email</Label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="admin@iimbg.ac.in"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
            />
            <Button onClick={handleAddEmail} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Only emails added here will be able to sign in as admin
          </p>
        </div>

        <div className="space-y-3">
          <Label>Current Admin Emails</Label>
          <div className="space-y-2">
            {adminEmails.map((adminEmail) => (
              <div
                key={adminEmail.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{adminEmail.email}</span>
                  {adminEmail.email === 'balaji.g2027d@iimbg.ac.in' && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Primary
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteEmail(adminEmail.id, adminEmail.email)}
                  disabled={adminEmail.email === 'balaji.g2027d@iimbg.ac.in'}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdminEmailManagement;
