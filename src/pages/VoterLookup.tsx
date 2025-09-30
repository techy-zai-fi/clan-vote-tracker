import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VoterLookup = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voter, setVoter] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [showAdHocForm, setShowAdHocForm] = useState(false);
  
  // Ad-hoc form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [regNum, setRegNum] = useState("");
  const [gender, setGender] = useState("");
  const [clan, setClan] = useState("");
  const [batch, setBatch] = useState("");
  const [year, setYear] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotFound(false);
    setVoter(null);
    
    try {
      // Check if settings allow ad-hoc voters
      const { data: settings } = await supabase
        .from('election_settings')
        .select('allow_adhoc_voters')
        .eq('id', 1)
        .single();
      
      // Search by email or reg_num
      const { data, error } = await supabase
        .from('voter_registry')
        .select('*')
        .or(`email.ilike.%${searchTerm}%,reg_num.ilike.%${searchTerm}%`)
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setVoter(data);
        // Set form fields with voter data
        setName(data.name);
        setEmail(data.email);
        setRegNum(data.reg_num);
        setGender(data.gender);
        setClan(data.clan);
        setBatch(data.batch);
        setYear(data.year.toString());
      } else {
        setNotFound(true);
        if (settings?.allow_adhoc_voters) {
          setShowAdHocForm(true);
          // Pre-fill search term if it looks like email or reg_num
          if (searchTerm.includes('@')) {
            setEmail(searchTerm);
          } else {
            setRegNum(searchTerm);
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to search for voter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVoter = async () => {
    try {
      const voterData: any = {
        email,
        reg_num: regNum,
        name,
        gender,
        clan,
        batch,
        year: parseInt(year),
      };

      const { error } = await supabase
        .from('voter_registry')
        .upsert([voterData]);

      if (error) throw error;

      // Log audit trail
      await supabase.from('audit_log').insert({
        actor_label: email,
        action: voter ? 'UPDATE_VOTER' : 'CREATE_VOTER',
        payload_json: voterData,
      });

      toast({
        title: "Success",
        description: voter ? "Voter details updated" : "New voter registered",
      });

      setVoter(voterData);
      setShowAdHocForm(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save voter details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProceedToVote = () => {
    if (voter || (email && regNum)) {
      // Store voter info in session
      sessionStorage.setItem('voter', JSON.stringify({ email: email || voter?.email, reg_num: regNum || voter?.reg_num, name: name || voter?.name, batch: batch || voter?.batch }));
      navigate('/vote');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-primary">
      <header className="border-b border-white/10 bg-primary/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="text-xl font-bold text-primary-foreground hover:text-secondary">
            ← IIMBG Elections
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block p-3 bg-secondary rounded-full mb-4">
              <User className="h-10 w-10 text-secondary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">Find Your Voter Profile</h1>
            <p className="text-lg text-primary-foreground/80">
              Enter your email or registration number to begin voting
            </p>
          </div>

          {!voter && !showAdHocForm && (
            <Card className="p-8 bg-white/95 backdrop-blur-sm animate-scale-in">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-base font-semibold">
                    Email or Registration Number
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="e.g., student@iimbg.ac.in or REG12345"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11 h-12 text-lg"
                      required
                    />
                  </div>
                </div>

                {notFound && (
                  <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-destructive">Not found in voter registry</p>
                      <p className="text-muted-foreground">
                        {showAdHocForm ? "You can register below" : "Please contact the election administrator"}
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90 text-lg h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "Searching..." : "Find Me"}
                </Button>
              </form>
            </Card>
          )}

          {(voter || showAdHocForm) && (
            <Card className="p-8 bg-white/95 backdrop-blur-sm animate-scale-in">
              <h2 className="text-2xl font-bold mb-6">
                {voter ? "Your Details" : "Register to Vote"}
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Registration Number</Label>
                    <Input value={regNum} onChange={(e) => setRegNum(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
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
                    <Input value={clan} onChange={(e) => setClan(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Batch</Label>
                    <Select value={batch} onValueChange={setBatch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="MBA">MBA</SelectItem>
                        <SelectItem value="HHM">HHM</SelectItem>
                        <SelectItem value="DBM">DBM</SelectItem>
                        <SelectItem value="IPM">IPM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {(showAdHocForm || voter) && (
                    <Button onClick={handleSaveVoter} variant="outline" className="flex-1">
                      Save Details
                    </Button>
                  )}
                  <Button onClick={handleProceedToVote} className="flex-1 bg-primary hover:bg-primary/90">
                    Proceed to Vote
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="mt-8 text-center">
            <Link to="/clans">
              <Button variant="ghost" className="text-primary-foreground hover:bg-white/10">
                View All Clans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterLookup;
