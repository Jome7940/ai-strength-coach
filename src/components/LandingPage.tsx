import { Dumbbell, Sparkles, Target, TrendingUp, Calendar, Activity, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: Sparkles,
    title: '1-Tap Workouts',
    description: 'AI generates personalized workouts based on your goals, equipment, and readiness.',
  },
  {
    icon: Target,
    title: 'Smart Progression',
    description: 'Auto-adjusts sets, reps, and weight for safe progressive overload.',
  },
  {
    icon: Activity,
    title: 'Muscle Balance',
    description: 'Visual muscle map shows what you\'ve trained and what needs attention.',
  },
  {
    icon: Calendar,
    title: 'Plan Ahead',
    description: 'Schedule workouts for the week. AI adapts when life gets in the way.',
  },
  {
    icon: TrendingUp,
    title: 'Break Plateaus',
    description: 'Detects stalls and applies "unstuck" protocols automatically.',
  },
  {
    icon: Dumbbell,
    title: 'Any Equipment',
    description: 'Full gym, home gym, or bodyweight only. Always get a great workout.',
  },
];

const benefits = [
  'Personalized to your experience level',
  'Progressive overload built in',
  'Human-like autoregulation',
  'Works offline on mobile',
  'Sync across all devices',
  'Explainable recommendations',
];

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        
        {/* Header */}
        <header className="relative z-10 border-b border-border/50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight">AI Strength Coach</span>
            </div>
            <Button onClick={onGetStarted}>
              Get Started
            </Button>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Training
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Your personal strength coach, powered by AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Generate personalized workouts in 1 tap. Track progress on a visual muscle map. 
              Let AI handle progressive overload while you focus on lifting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={onGetStarted} className="text-base h-12 px-8">
                Start Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12 px-8">
                See How It Works
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Everything a coach does, automated
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From workout generation to plateau busting, get intelligent guidance every step of the way.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-border bg-card hover:bg-card/80 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/30 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Training that adapts to you
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                No more generic programs. AI Strength Coach learns your patterns, respects your 
                recovery, and adjusts intensity based on how you feel each day.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-border p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold tracking-tighter mb-2">87%</div>
                  <div className="text-muted-foreground">of users see strength gains in 4 weeks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to transform your training?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join thousands of lifters who trust AI Strength Coach for smarter, more effective workouts.
          </p>
          <Button size="lg" onClick={onGetStarted} className="text-base h-12 px-8">
            Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            <span className="font-semibold">AI Strength Coach</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI Strength Coach. Built with Blink.
          </div>
        </div>
      </footer>
    </div>
  );
}
