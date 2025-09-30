import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Upload, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    clan_id: "",
    gender: "",
    batch: "",
    year: "",
    manifesto: "",
    photo_url: "",
    is_active: true,
  });

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = candidates.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clan_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCandidates(filtered);
    } else {
      setFilteredCandidates(candidates);
    }
  }, [searchTerm, candidates]);

  const loadCandidates = async () => {
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .order('name');
    
    if (data) {
      setCandidates(data);
      setFilteredCandidates(data);
    }
  };

  const handleSaveCandidate = async () => {
    try {
      const candidateData: any = {
        ...formData,
        year: parseInt(formData.year),
      };

      if (editingCandidate) {
        const { error } = await supabase
          .from('candidates')
          .update(candidateData)
          .eq('id', editingCandidate.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('candidates')
          .insert([candidateData]);
        
        if (error) throw error;
      }

      await supabase.from('audit_log').insert({
        actor_label: 'admin',
        action: editingCandidate ? 'UPDATE_CANDIDATE' : 'ADD_CANDIDATE',
        payload_json: candidateData,
      });

      toast({
        title: "Success",
        description: editingCandidate ? "Candidate updated" : "Candidate added",
      });

      setShowAddDialog(false);
      setEditingCandidate(null);
      setFormData({ name: "", email: "", clan_id: "", gender: "", batch: "", year: "", manifesto: "", photo_url: "", is_active: true });
      loadCandidates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (candidate: any) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      email: candidate.email || "",
      clan_id: candidate.clan_id,
      gender: candidate.gender,
      batch: candidate.batch,
      year: candidate.year.toString(),
      manifesto: candidate.manifesto || "",
      photo_url: candidate.photo_url || "",
      is_active: candidate.is_active,
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;

    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Success", description: "Candidate deleted" });
      loadCandidates();
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
          <h2 className="text-2xl font-bold">Candidate Management</h2>
          <p className="text-muted-foreground">{candidates.length} candidates registered</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or clan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Clan</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell className="text-muted-foreground">{candidate.email || '-'}</TableCell>
                  <TableCell>{candidate.clan_id}</TableCell>
                  <TableCell>{candidate.gender}</TableCell>
                  <TableCell>{candidate.batch}</TableCell>
                  <TableCell>{candidate.year}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${candidate.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {candidate.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(candidate)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(candidate.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm ? "No candidates match your search" : "No candidates registered yet"}
          </div>
        )}
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCandidate ? "Edit Candidate" : "Add New Candidate"}</DialogTitle>
            <DialogDescription>
              {editingCandidate ? "Update candidate details" : "Enter candidate information"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Clan *</Label>
                <Select value={formData.clan_id} onValueChange={(v) => setFormData({ ...formData, clan_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select clan" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="MM">MM - Mahanadi</SelectItem>
                    <SelectItem value="SS">SS - Shivalik</SelectItem>
                    <SelectItem value="WW">WW - Windward</SelectItem>
                    <SelectItem value="YY">YY - Yamuna</SelectItem>
                    <SelectItem value="AA">AA - Aravali</SelectItem>
                    <SelectItem value="NN">NN - Nilgiri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Gender *</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <span className="text-sm">{formData.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Section *</Label>
                <Select value={formData.batch} onValueChange={(v) => setFormData({ ...formData, batch: v })}>
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
                <Label>Batch *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 3, 11"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Photo URL</Label>
              <Input
                type="url"
                placeholder="https://..."
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              />
            </div>

            <div>
              <Label>Manifesto</Label>
              <Textarea
                rows={4}
                placeholder="Candidate's manifesto and goals..."
                value={formData.manifesto}
                onChange={(e) => setFormData({ ...formData, manifesto: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCandidate}>
              {editingCandidate ? "Update" : "Add"} Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateManagement;
