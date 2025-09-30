import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Search, Plus, Edit2, Trash2, Download } from "lucide-react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VoterManagement = () => {
  const [voters, setVoters] = useState<any[]>([]);
  const [filteredVoters, setFilteredVoters] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVoter, setEditingVoter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form fields
  const [formData, setFormData] = useState({
    email: "",
    reg_num: "",
    name: "",
    gender: "",
    clan: "",
    batch: "",
    year: "",
  });

  useEffect(() => {
    loadVoters();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = voters.filter(v => 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.reg_num.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVoters(filtered);
    } else {
      setFilteredVoters(voters);
    }
  }, [searchTerm, voters]);

  const loadVoters = async () => {
    const { data } = await supabase
      .from('voter_registry')
      .select('*')
      .order('name');
    
    if (data) {
      setVoters(data);
      setFilteredVoters(data);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          setIsLoading(true);
          const votersData = results.data
            .filter((row: any) => row.email && row.reg_no)
            .map((row: any) => ({
              email: row.email.trim(),
              reg_num: row.reg_no.trim(),
              name: row.name.trim(),
              gender: row.gender.trim(),
              clan: row.clan_id.trim(),
              batch: row.section.trim(),
              year: parseInt(row.batch) || 0,
            }));

          const { error } = await supabase
            .from('voter_registry')
            .upsert(votersData, { onConflict: 'email' });

          if (error) throw error;

          await supabase.from('audit_log').insert({
            actor_label: 'admin',
            action: 'BULK_UPLOAD_VOTERS',
            payload_json: { count: votersData.length },
          });

          toast({
            title: "Success",
            description: `${votersData.length} voters uploaded successfully`,
          });

          loadVoters();
        } catch (error: any) {
          console.error('Upload error:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to upload voters",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
      error: (error) => {
        toast({
          title: "Parse Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleSaveVoter = async () => {
    try {
      const voterData: any = {
        ...formData,
        year: parseInt(formData.year),
      };

      const { error } = await supabase
        .from('voter_registry')
        .upsert([voterData]);

      if (error) throw error;

      await supabase.from('audit_log').insert({
        actor_label: 'admin',
        action: editingVoter ? 'UPDATE_VOTER' : 'ADD_VOTER',
        payload_json: voterData,
      });

      toast({
        title: "Success",
        description: editingVoter ? "Voter updated" : "Voter added",
      });

      setShowAddDialog(false);
      setEditingVoter(null);
      setFormData({ email: "", reg_num: "", name: "", gender: "", clan: "", batch: "", year: "" });
      loadVoters();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (voter: any) => {
    setEditingVoter(voter);
    setFormData({
      email: voter.email,
      reg_num: voter.reg_num,
      name: voter.name,
      gender: voter.gender,
      clan: voter.clan,
      batch: voter.batch,
      year: voter.year.toString(),
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (email: string) => {
    if (!confirm('Are you sure you want to delete this voter?')) return;

    try {
      const { error } = await supabase
        .from('voter_registry')
        .delete()
        .eq('email', email);

      if (error) throw error;

      toast({ title: "Success", description: "Voter deleted" });
      loadVoters();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(voters);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voters.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Voter Management</h2>
          <p className="text-muted-foreground">{voters.length} voters registered</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Voter
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or reg number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={isLoading}
            />
            <Label htmlFor="csv-upload">
              <Button asChild variant="outline" disabled={isLoading}>
                <span className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  {isLoading ? "Uploading..." : "Upload CSV"}
                </span>
              </Button>
            </Label>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Reg #</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Clan</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVoters.map((voter) => (
                <TableRow key={voter.email}>
                  <TableCell className="font-medium">{voter.name}</TableCell>
                  <TableCell className="text-muted-foreground">{voter.email}</TableCell>
                  <TableCell>{voter.reg_num}</TableCell>
                  <TableCell>{voter.gender}</TableCell>
                  <TableCell>{voter.clan}</TableCell>
                  <TableCell>{voter.batch}</TableCell>
                  <TableCell>{voter.year}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(voter)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(voter.email)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredVoters.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm ? "No voters match your search" : "No voters registered yet"}
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVoter ? "Edit Voter" : "Add New Voter"}</DialogTitle>
            <DialogDescription>
              {editingVoter ? "Update voter details" : "Enter voter information"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
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
                  disabled={!!editingVoter}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Registration Number</Label>
                <Input
                  value={formData.reg_num}
                  onChange={(e) => setFormData({ ...formData, reg_num: e.target.value })}
                />
              </div>
              <div>
                <Label>Gender</Label>
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Clan</Label>
                <Select value={formData.clan} onValueChange={(v) => setFormData({ ...formData, clan: v })}>
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
                <Label>Section</Label>
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
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Batch</Label>
                <Input
                  type="number"
                  placeholder="e.g., 3, 11"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVoter}>
              {editingVoter ? "Update" : "Add"} Voter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoterManagement;
