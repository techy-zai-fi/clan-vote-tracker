import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const VotingRules = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    voter_batch: "",
    voter_section: "",
    can_vote_for_batch: "",
    can_vote_for_section: "",
    same_clan_only: true,
    is_active: true,
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    const { data } = await supabase
      .from('voting_rules')
      .select('*')
      .order('voter_batch');
    
    if (data) {
      setRules(data);
    }
  };

  const handleSaveRule = async () => {
    try {
      const ruleData: any = {
        voter_batch: formData.voter_batch,
        voter_section: formData.voter_section || null,
        can_vote_for_batch: formData.can_vote_for_batch,
        can_vote_for_section: formData.can_vote_for_section || null,
        same_clan_only: formData.same_clan_only,
        is_active: formData.is_active,
      };

      if (editingRule) {
        const { error } = await supabase
          .from('voting_rules')
          .update(ruleData)
          .eq('id', editingRule.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('voting_rules')
          .insert([ruleData]);
        
        if (error) throw error;
      }

      await supabase.from('audit_log').insert({
        actor_label: 'admin',
        action: editingRule ? 'UPDATE_VOTING_RULE' : 'ADD_VOTING_RULE',
        payload_json: ruleData,
      });

      toast({
        title: "Success",
        description: editingRule ? "Voting rule updated" : "Voting rule added",
      });

      setShowAddDialog(false);
      setEditingRule(null);
      setFormData({ voter_batch: "", voter_section: "", can_vote_for_batch: "", can_vote_for_section: "", same_clan_only: true, is_active: true });
      loadRules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setFormData({
      voter_batch: rule.voter_batch,
      voter_section: rule.voter_section || "",
      can_vote_for_batch: rule.can_vote_for_batch,
      can_vote_for_section: rule.can_vote_for_section || "",
      same_clan_only: rule.same_clan_only,
      is_active: rule.is_active,
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this voting rule?')) return;

    try {
      const { error } = await supabase
        .from('voting_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Success", description: "Voting rule deleted" });
      loadRules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleRuleStatus = async (rule: any) => {
    try {
      const { error } = await supabase
        .from('voting_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Rule ${!rule.is_active ? 'enabled' : 'disabled'}`,
      });

      loadRules();
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Voting Rules</h2>
          <p className="text-muted-foreground">Configure which voters can vote for which candidates</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">About Voting Rules</h3>
            <p className="text-sm text-blue-700 mt-1">
              Define eligibility rules for voting. For example, MBA voters can only vote for MBA candidates, 
              and voters can only vote for candidates in their own clan. You can create specific rules for 
              each batch and section combination.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voter Section</TableHead>
                <TableHead>Voter Batch</TableHead>
                <TableHead>Can Vote For Section</TableHead>
                <TableHead>Can Vote For Batch</TableHead>
                <TableHead>Same Clan Only</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.voter_batch}</TableCell>
                  <TableCell>{rule.voter_section || 'All'}</TableCell>
                  <TableCell>{rule.can_vote_for_batch}</TableCell>
                  <TableCell>{rule.can_vote_for_section || 'All'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${rule.same_clan_only ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                      {rule.same_clan_only ? 'Yes' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => toggleRuleStatus(rule)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(rule)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(rule.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {rules.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No voting rules configured yet. Add your first rule to get started.
          </div>
        )}
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Voting Rule" : "Add New Voting Rule"}</DialogTitle>
            <DialogDescription>
              {editingRule ? "Update voting rule details" : "Define a new voting eligibility rule"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Voter Eligibility</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Voter Section *</Label>
                  <Select value={formData.voter_batch} onValueChange={(v) => setFormData({ ...formData, voter_batch: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="MBA">MBA</SelectItem>
                      <SelectItem value="HHM">HHM</SelectItem>
                      <SelectItem value="DBM">DBM</SelectItem>
                      <SelectItem value="IPM">IPM</SelectItem>
                      <SelectItem value="PHD">PHD</SelectItem>
                      <SelectItem value="SEP">SEP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Voter Batch (Optional)</Label>
                  <Select value={formData.voter_section} onValueChange={(v) => setFormData({ ...formData, voter_section: v === 'all' ? '' : v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All batches" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="11">11</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Can Vote For</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Candidate Section *</Label>
                  <Select value={formData.can_vote_for_batch} onValueChange={(v) => setFormData({ ...formData, can_vote_for_batch: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="MBA">MBA</SelectItem>
                      <SelectItem value="HHM">HHM</SelectItem>
                      <SelectItem value="DBM">DBM</SelectItem>
                      <SelectItem value="IPM">IPM</SelectItem>
                      <SelectItem value="PHD">PHD</SelectItem>
                      <SelectItem value="SEP">SEP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Candidate Batch (Optional)</Label>
                  <Select value={formData.can_vote_for_section} onValueChange={(v) => setFormData({ ...formData, can_vote_for_section: v === 'all' ? '' : v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All batches" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="11">11</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Same Clan Only</Label>
                <p className="text-sm text-muted-foreground">Voters can only vote for candidates in their clan</p>
              </div>
              <Switch
                checked={formData.same_clan_only}
                onCheckedChange={(checked) => setFormData({ ...formData, same_clan_only: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Active Rule</Label>
                <p className="text-sm text-muted-foreground">Enable or disable this rule</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRule}>
              {editingRule ? "Update" : "Add"} Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VotingRules;