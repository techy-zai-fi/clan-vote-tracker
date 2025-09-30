import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Vote, Users, Shield, Clock } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-primary">
      {/* Header */}
      <header className="border-b border-white/10 bg-primary/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary-foreground">IIMBG Elections</h1>
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10">
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="mb-6">
            <div className="inline-block p-3 bg-secondary rounded-full mb-4">
              <Vote className="h-12 w-12 text-secondary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            IIMBG Panch Elections
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4">
            Offline Voting System
          </p>
          <p className="text-lg text-primary-foreground/80 mb-12 max-w-2xl mx-auto">
            Cast your vote for Panch representatives across all six clans. 
            One vote per clan, for candidates from your batch.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/clans">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6">
                View Clans
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
              <div className="text-secondary text-3xl font-bold mb-2">6</div>
              <div className="text-primary-foreground/90">Clans</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
              <div className="text-secondary text-3xl font-bold mb-2">4</div>
              <div className="text-primary-foreground/90">Batches per Clan</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
              <div className="text-secondary text-3xl font-bold mb-2">24</div>
              <div className="text-primary-foreground/90">Panch Positions</div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="font-semibold mb-2">Find Yourself</h3>
              <p className="text-sm text-muted-foreground">Enter your email or registration number</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="font-semibold mb-2">Verify Details</h3>
              <p className="text-sm text-muted-foreground">Confirm or update your information</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="font-semibold mb-2">Cast Votes</h3>
              <p className="text-sm text-muted-foreground">Vote for one candidate per clan</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">4</span>
              </div>
              <h3 className="font-semibold mb-2">Get Receipt</h3>
              <p className="text-sm text-muted-foreground">Receive confirmation of your votes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Voting Rules</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <Clock className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">One Vote Per Clan</h3>
              <p className="text-sm text-muted-foreground">
                You can cast exactly one vote in each of the six clans for your batch's candidate.
              </p>
            </Card>
            <Card className="p-6">
              <Users className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Batch-Specific</h3>
              <p className="text-sm text-muted-foreground">
                Vote only for candidates from your batch (MBA, HHM, DBM, or IPM).
              </p>
            </Card>
            <Card className="p-6">
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Anonymous & Secure</h3>
              <p className="text-sm text-muted-foreground">
                Your votes are recorded securely with full anonymity protection.
              </p>
            </Card>
            <Card className="p-6">
              <Vote className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Final Decision</h3>
              <p className="text-sm text-muted-foreground">
                Once cast, votes cannot be changed unless explicitly allowed by admin.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-primary-foreground/70 text-sm">
          <p>© 2025 IIMBG Elections. All rights reserved.</p>
          <p className="mt-2">Offline voting system for campus elections</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
