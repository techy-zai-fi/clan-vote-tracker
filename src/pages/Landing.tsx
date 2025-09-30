import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Trophy, Swords, Shield, Target, Users, Zap, Crown, Award } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-primary relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-primary/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-secondary" />
            <h1 className="text-xl font-bold text-primary-foreground">IIMBG COC Elections</h1>
          </div>
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10">
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          {/* Main Icon with Glow */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 blur-2xl bg-secondary/30 rounded-full"></div>
            <div className="relative inline-flex items-center justify-center p-4 bg-gradient-to-br from-secondary via-accent to-secondary rounded-full mb-4 shadow-2xl">
              <Swords className="h-20 w-20 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-primary-foreground mb-4 tracking-tight">
            CLASH OF CLANS
          </h1>
          <div className="inline-block px-6 py-2 bg-secondary/20 backdrop-blur-sm rounded-full border border-secondary/40 mb-6">
            <p className="text-2xl md:text-3xl font-bold text-secondary">
              Panch Elections 2025
            </p>
          </div>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4 font-semibold">
            Battle for Glory, Vote for Champions
          </p>
          <p className="text-lg text-primary-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Six legendary clans compete for honor and leadership. Cast your vote for your clan's Panch representative 
            and shape the future of IIMBG's greatest tournament. One vote per clan, choose your champion wisely!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/clans">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-secondary to-accent text-primary font-bold hover:shadow-2xl hover:scale-105 transition-all text-lg px-10 py-7 rounded-xl"
              >
                <Swords className="mr-2 h-6 w-6" />
                Enter the Arena
              </Button>
            </Link>
            <Link to="/voters">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-secondary text-primary-foreground hover:bg-secondary/20 text-lg px-10 py-7 rounded-xl backdrop-blur-sm"
              >
                <Target className="mr-2 h-6 w-6" />
                Register to Vote
              </Button>
            </Link>
          </div>

          {/* Stats Cards with Sport Theme */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover-lift group">
              <Crown className="h-10 w-10 mx-auto mb-3 text-secondary group-hover:scale-110 transition-transform" />
              <div className="text-secondary text-4xl font-black mb-2">6</div>
              <div className="text-primary-foreground/90 font-semibold">Warrior Clans</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover-lift group">
              <Users className="h-10 w-10 mx-auto mb-3 text-accent group-hover:scale-110 transition-transform" />
              <div className="text-accent text-4xl font-black mb-2">4</div>
              <div className="text-primary-foreground/90 font-semibold">Battle Groups</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover-lift group">
              <Trophy className="h-10 w-10 mx-auto mb-3 text-secondary group-hover:scale-110 transition-transform" />
              <div className="text-secondary text-4xl font-black mb-2">24</div>
              <div className="text-primary-foreground/90 font-semibold">Champions</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover-lift group">
              <Zap className="h-10 w-10 mx-auto mb-3 text-accent group-hover:scale-110 transition-transform" />
              <div className="text-accent text-4xl font-black mb-2">1</div>
              <div className="text-primary-foreground/90 font-semibold">Epic Battle</div>
            </Card>
          </div>
        </div>
      </section>

      {/* How the Battle Works */}
      <section className="relative bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Award className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-4xl font-black text-foreground mb-3">How the Battle Works</h2>
            <p className="text-muted-foreground text-lg">Your path to championship starts here</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center sport-card p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-black text-primary-foreground">1</span>
              </div>
              <div className="mb-4">
                <Target className="h-8 w-8 mx-auto text-primary" />
              </div>
              <h3 className="font-bold mb-3 text-lg">Register</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enter your credentials and join your clan's roster
              </p>
            </div>
            <div className="text-center sport-card p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-black text-primary-foreground">2</span>
              </div>
              <div className="mb-4">
                <Shield className="h-8 w-8 mx-auto text-primary" />
              </div>
              <h3 className="font-bold mb-3 text-lg">Verify</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Confirm your battle details and clan allegiance
              </p>
            </div>
            <div className="text-center sport-card p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-black text-primary-foreground">3</span>
              </div>
              <div className="mb-4">
                <Swords className="h-8 w-8 mx-auto text-primary" />
              </div>
              <h3 className="font-bold mb-3 text-lg">Choose Champion</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vote for your clan's Panch warrior
              </p>
            </div>
            <div className="text-center sport-card p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-black text-primary-foreground">4</span>
              </div>
              <div className="mb-4">
                <Trophy className="h-8 w-8 mx-auto text-primary" />
              </div>
              <h3 className="font-bold mb-3 text-lg">Victory</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receive battle confirmation and await results
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Battle Rules */}
      <section className="relative py-20 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary/5"></div>
        <div className="container mx-auto px-4 max-w-6xl relative">
          <div className="text-center mb-12">
            <Swords className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-4xl font-black text-foreground mb-3">Arena Rules</h2>
            <p className="text-muted-foreground text-lg">Fight fair, vote wise, honor your clan</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 sport-card group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-lg">One Strike Per Arena</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Cast exactly one vote in your clan arena. Choose your champion wisely - each vote counts toward clan supremacy.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-8 sport-card group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-lg">Squad Loyalty</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Vote only for warriors from your battle group (MBA, HHM, DBM, or IPM). Cross-squad voting is prohibited.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-8 sport-card group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-lg">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your battle decisions are encrypted and anonymous. Vote with confidence - your choice is protected.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-8 sport-card group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-lg">Locked In</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Once your vote is cast, it's permanent unless arena masters grant special permission to change.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-primary py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-secondary" />
              <span className="text-xl font-bold text-primary-foreground">IIMBG COC</span>
            </div>
            <p className="text-primary-foreground/80 text-sm max-w-md">
              May the strongest clan prevail. Vote with honor, compete with pride.
            </p>
            <p className="text-primary-foreground/60 text-xs">
              © 2025 IIMBG Clash of Clans Elections. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
