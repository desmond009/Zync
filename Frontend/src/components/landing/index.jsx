import { useEffect } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { SocialProofSection } from './SocialProofSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { ProductShowcaseSection } from './ProductShowcaseSection';
import { PricingSection } from './PricingSection';
import { TestimonialsSection } from './TestimonialsSection';
import { CTASection } from './CTASection';
import { LandingFooter } from './LandingFooter';

export const LandingPage = () => {
  useEffect(() => {
    // Force light theme for landing page
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    
    root.classList.remove('dark');
    root.classList.add('light');
    
    // Smooth scroll behavior for anchor links
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      // Restore previous theme when leaving landing page
      document.documentElement.style.scrollBehavior = 'auto';
      root.classList.remove('light');
      if (wasDark) {
        root.classList.add('dark');
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ProductShowcaseSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
};
