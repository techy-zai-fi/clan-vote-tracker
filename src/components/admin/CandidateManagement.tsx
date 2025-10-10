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
import { ImageUpload } from "./ImageUpload";

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);
  const [bulkRegNums, setBulkRegNums] = useState("");
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [clans, setClans] = useState<Array<{ id: string; name: string }>>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
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
    loadClans();
    loadOptions();
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

  const loadClans = async () => {
    const { data } = await supabase
      .from('clans')
      .select('id, name')
      .order('display_order');
    
    if (data) {
      setClans(data);
    }
  };

  const loadOptions = async () => {
    const { data: voterData } = await supabase
      .from('voter_registry')
      .select('batch, year');
    
    if (voterData) {
      const uniqueBatches = [...new Set(voterData.map(v => v.batch))].sort();
      const uniqueYears = [...new Set(voterData.map(v => v.year.toString()))].sort();
      setBatches(uniqueBatches);
      setYears(uniqueYears);
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

  const handleBulkImport = async () => {
    try {
      const regNums = bulkRegNums
        .split(',')
        .map(num => num.trim())
        .filter(num => num.length > 0);

      if (regNums.length === 0) {
        toast({
          title: "Error",
          description: "Please enter at least one registration number",
          variant: "destructive",
        });
        return;
      }

      const { data: voters, error } = await supabase
        .from('voter_registry')
        .select('*')
        .in('reg_num', regNums);

      if (error) throw error;

      if (!voters || voters.length === 0) {
        toast({
          title: "Error",
          description: "No voters found with the provided registration numbers",
          variant: "destructive",
        });
        return;
      }

      const candidateData = voters.map(voter => ({
        name: voter.name,
        email: voter.email,
        clan_id: voter.clan,
        gender: voter.gender,
        batch: voter.batch,
        year: voter.year,
        is_active: true,
      }));

      const { error: insertError } = await supabase
        .from('candidates')
        .insert(candidateData);

      if (insertError) throw insertError;

      await supabase.from('audit_log').insert({
        actor_label: 'admin',
        action: 'BULK_IMPORT_CANDIDATES',
        payload_json: { count: voters.length, reg_nums: regNums },
      });

      toast({
        title: "Success",
        description: `${voters.length} candidate(s) imported successfully`,
      });

      setShowBulkImportDialog(false);
      setBulkRegNums("");
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkImportDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        </div>
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
                    {clans.map((clan) => (
                      <SelectItem key={clan.id} value={clan.id}>
                        {clan.id} - {clan.name}
                      </SelectItem>
                    ))}
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
                    {batches.map((batch) => (
                      <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Batch *</Label>
                <Select value={formData.year} onValueChange={(v) => setFormData({ ...formData, year: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ImageUpload
              label="Photo"
              value={formData.photo_url}
              onChange={(url) => setFormData({...formData, photo_url: url})}
              folder="candidates"
            />

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

      <Dialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Import Candidates</DialogTitle>
            <DialogDescription>
              Enter registration numbers separated by commas to import candidates from the voter registry
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Registration Numbers</Label>
              <Textarea
                rows={6}
                placeholder="e.g., 2027001, 2027002, 2027003"
                value={bulkRegNums}
                onChange={(e) => setBulkRegNums(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Separate multiple registration numbers with commas
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkImport}>
              Import Candidates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateManagement;
