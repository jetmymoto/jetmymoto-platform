import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { getCanonicalPaths } from "@/utils/navigationTargets";

const AirliftClassCard = ({ title, label, features, price, buttonText, buttonVariant, isPremium, delay }) => {
  const { toast } = useToast();
  const location = useLocation();
  const paths = getCanonicalPaths(location.search);

  const handleButtonClick = (e) => {
    // If it's a link to another page, let it navigate.
    // If it's intended to be a scroll action, we'll toast for now.
    const isExternalLink = buttonText.toLowerCase().includes('explore');
    if (!isExternalLink) {
        e.preventDefault();
        toast({
            title: "Feature Not Implemented",
            description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
            variant: "default",
        });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-gradient-to-b p-8 shadow-2xl ${isPremium ? 'border-gold-accent/30 from-slate-900/90 to-navy-deep/70' : 'border-slate-700/80 from-slate-900/60 to-navy-deep/50'}`}
    >
        {isPremium && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,185,60,0.1),transparent_70%)]"></div>}

        <div className="relative z-10 flex h-full flex-col">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">{title}</h3>
                <p className={`mt-1 text-sm font-semibold tracking-wider uppercase ${isPremium ? 'text-gold-accent' : 'text-slate-400'}`}>{label}</p>
            </div>
            
            <ul className="mb-8 space-y-3 text-slate-300">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <CheckCircle className={`mt-1 h-4 w-4 flex-shrink-0 ${isPremium ? 'text-gold-accent' : 'text-slate-500'}`} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            
            <div className="mt-auto">
                <p className={`mb-6 text-sm font-semibold ${isPremium ? 'text-gold-accent' : 'text-slate-400'}`}>
                    {price}
                </p>
                <Link to={paths.logistics} onClick={handleButtonClick} className="w-full">
                    <Button
                        variant={buttonVariant}
                        className={`w-full h-12 text-base font-bold ${isPremium ? 'bg-gold-accent text-navy-deep hover:bg-amber-400 shadow-[0_0_20px_rgba(255,185,60,0.2)]' : 'text-slate-300 border-slate-600 hover:bg-slate-800 hover:text-white'}`}
                    >
                        {buttonText}
                    </Button>
                </Link>
            </div>
        </div>
    </motion.div>
  );
};


const AirliftClassSection = () => {
  return (
    <section className="bg-navy-deep py-20 sm:py-28 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-white sm:text-5xl"
          >
            Choose Your <span className="text-gold-accent">Airlift Class</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-lg text-slate-400"
          >
            Same destination, two different experiences. Pick the service that matches your mission.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <AirliftClassCard
            title="Airlift Economy"
            label="GROUP TRANSPORT · BUDGET FRIENDLY"
            features={[
              "Open trailers and shared carriers with trusted partners.",
              "Delivery to partner hubs near major airports.",
              "Fixed routes and shared schedules.",
              "Best choice for solo riders watching the budget."
            ]}
            price="From ~€399 one-way / €749 return (sample routes)"
            buttonText="View Economy Examples"
            buttonVariant="outline"
            isPremium={false}
            delay={0.1}
          />
          <AirliftClassCard
            title="Airlift Premium"
            label="DOOR-TO-DOOR · AIRCRAFT-GRADE SERVICE"
            features={[
              "Enclosed vans and aircraft-grade strapping for your bike.",
              "Direct delivery to hotels, villas or private garages.",
              "Flexible dates, custom routing and concierge updates.",
              "Best choice for high-value bikes, couples and groups."
            ]}
            price="From ~€999 one-way / €1,999+ return (sample routes)"
            buttonText="Explore Premium Airlift"
            buttonVariant="default"
            isPremium={true}
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
};

export default AirliftClassSection;
