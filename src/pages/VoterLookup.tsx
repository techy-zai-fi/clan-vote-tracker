import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, User } from "lucide-react";
import { Link } from "react-router-dom";

const VoterLookup = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement voter lookup
    setTimeout(() => setIsLoading(false), 500);
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
                <p className="text-sm text-muted-foreground">
                  Enter either your institutional email or registration number
                </p>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-lg h-12"
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Find Me"}
              </Button>
            </form>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Not in the voter registry?
              </h3>
              <p className="text-sm text-muted-foreground">
                If ad-hoc voter registration is enabled, you'll be able to add your details 
                after the search. Otherwise, please contact the election administrator.
              </p>
            </div>
          </Card>

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
