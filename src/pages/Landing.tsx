import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Trophy, Swords, Shield, Target, Users, Zap, Crown, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const [branding, setBranding] = useState({
    website_logo: "",
    coc_logo: "",
    home_primary_color: "#3B82F6",
    home_secondary_color: "#F59E0B",
    home_accent_color: "#8B5CF6",
    home_bg_start: "#0F172A",
    home_bg_end: "#1E293B",
    hero_title: "CLASH OF CLANS",
    hero_subtitle: "Panch Elections 2025",
    hero_description: "Six legendary clans compete for honor and leadership. Cast your vote for your clan's Panch representative and shape the future of IIMBG's greatest tournament. One vote per clan, choose your champion wisely!",
    hero_cta_text: "Enter the Arena",
    stats_label_1: "Warrior Clans",
    stats_value_1: "6",
    stats_label_2: "Battle Groups",
    stats_value_2: "4",
    stats_label_3: "Champions",
    stats_value_3: "24",
    stats_label_4: "Epic Battle",
    stats_value_4: "1",
  });

  useEffect(() => {
    const loadBranding = async () => {
      const { data } = await supabase
        .from('election_settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (data) {
        setBranding({
          website_logo: data.website_logo || "",
          coc_logo: data.coc_logo || "",
          home_primary_color: data.home_primary_color || "#3B82F6",
          home_secondary_color: data.home_secondary_color || "#F59E0B",
          home_accent_color: data.home_accent_color || "#8B5CF6",
          home_bg_start: data.home_bg_start || "#0F172A",
          home_bg_end: data.home_bg_end || "#1E293B",
          hero_title: data.hero_title || "CLASH OF CLANS",
          hero_subtitle: data.hero_subtitle || "Panch Elections 2025",
          hero_description: data.hero_description || "Six legendary clans compete for honor and leadership. Cast your vote for your clan's Panch representative and shape the future of IIMBG's greatest tournament. One vote per clan, choose your champion wisely!",
          hero_cta_text: data.hero_cta_text || "Enter the Arena",
          stats_label_1: data.stats_label_1 || "Warrior Clans",
          stats_value_1: data.stats_value_1 || "6",
          stats_label_2: data.stats_label_2 || "Battle Groups",
          stats_value_2: data.stats_value_2 || "4",
          stats_label_3: data.stats_label_3 || "Champions",
          stats_value_3: data.stats_value_3 || "24",
          stats_label_4: data.stats_label_4 || "Epic Battle",
          stats_value_4: data.stats_value_4 || "1",
        });
      }
    };
    loadBranding();
  }, []);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${branding.home_bg_start}, ${branding.home_bg_end})` }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: branding.home_secondary_color }}
        ></div>
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse delay-700"
          style={{ backgroundColor: branding.home_accent_color }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-sm" style={{ backgroundColor: `${branding.home_primary_color}80` }}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {branding.website_logo ? (
              <img src={branding.website_logo} alt="Logo" className="h-8 object-contain" />
            ) : (
              <Trophy className="h-8 w-8" style={{ color: branding.home_secondary_color }} />
            )}
            <h1 className="text-xl font-bold text-white">IIMBG COC Elections</h1>
          </div>
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
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
            <div 
              className="absolute inset-0 blur-2xl rounded-full opacity-30"
              style={{ backgroundColor: branding.home_secondary_color }}
            ></div>
            {branding.coc_logo ? (
              <div className="relative inline-flex items-center justify-center mb-4">
                <img src={branding.coc_logo} alt="Clash of Clans" className="h-32 w-auto object-contain drop-shadow-2xl" />
              </div>
            ) : (
              <div 
                className="relative inline-flex items-center justify-center p-4 rounded-full mb-4 shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${branding.home_secondary_color}, ${branding.home_accent_color})` }}
              >
                <Swords className="h-20 w-20 text-white" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
            {branding.hero_title}
          </h1>
          <div 
            className="inline-block px-6 py-2 backdrop-blur-sm rounded-full border mb-6"
            style={{ 
              backgroundColor: `${branding.home_secondary_color}33`,
              borderColor: `${branding.home_secondary_color}66`
            }}
          >
            <p className="text-2xl md:text-3xl font-bold" style={{ color: branding.home_secondary_color }}>
              {branding.hero_subtitle}
            </p>
          </div>
          
          <p className="text-lg text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            {branding.hero_description}
          </p>

          {/* CTA Buttons */}
          <div className="flex justify-center mb-16">
            <Link to="/clans">
              <Button 
                size="lg" 
                className="text-white font-bold hover:shadow-2xl hover:scale-105 transition-all text-lg px-10 py-7 rounded-xl"
                style={{ background: `linear-gradient(to right, ${branding.home_secondary_color}, ${branding.home_accent_color})` }}
              >
                <Swords className="mr-2 h-6 w-6" />
                {branding.hero_cta_text}
              </Button>
            </Link>
          </div>

          {/* Stats Cards with Sport Theme */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover-lift group">
              <Crown className="h-10 w-10 mx-auto mb-3 group-hover:scale-110 transition-transform" style={{ color: branding.home_secondary_color }} />
              <div className="text-4xl font-black mb-2" style={{ color: branding.home_secondary_color }}>{branding.stats_value_1}</div>
              <div className="text-white/90 font-semibold">{branding.stats_label_1}</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover-lift group">
              <Users className="h-10 w-10 mx-auto mb-3 group-hover:scale-110 transition-transform" style={{ color: branding.home_accent_color }} />
              <div className="text-4xl font-black mb-2" style={{ color: branding.home_accent_color }}>{branding.stats_value_2}</div>
              <div className="text-white/90 font-semibold">{branding.stats_label_2}</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover-lift group">
              <Trophy className="h-10 w-10 mx-auto mb-3 group-hover:scale-110 transition-transform" style={{ color: branding.home_secondary_color }} />
              <div className="text-4xl font-black mb-2" style={{ color: branding.home_secondary_color }}>{branding.stats_value_3}</div>
              <div className="text-white/90 font-semibold">{branding.stats_label_3}</div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover-lift group">
              <Zap className="h-10 w-10 mx-auto mb-3 group-hover:scale-110 transition-transform" style={{ color: branding.home_accent_color }} />
              <div className="text-4xl font-black mb-2" style={{ color: branding.home_accent_color }}>{branding.stats_value_4}</div>
              <div className="text-white/90 font-semibold">{branding.stats_label_4}</div>
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
      <footer className="relative py-12 border-t border-white/10" style={{ backgroundColor: branding.home_primary_color }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              {branding.website_logo ? (
                <img src={branding.website_logo} alt="Logo" className="h-8 object-contain" />
              ) : (
                <Trophy className="h-8 w-8" style={{ color: branding.home_secondary_color }} />
              )}
              <span className="text-xl font-bold text-white">IIMBG COC</span>
            </div>
            <p className="text-white/80 text-sm max-w-md">
              May the strongest clan prevail. Vote with honor, compete with pride.
            </p>
            <p className="text-white/60 text-xs">
              © 2025 IIMBG Clash of Clans Elections. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
