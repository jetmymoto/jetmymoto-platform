import React from 'react';
import { motion } from 'framer-motion';
import { Ship, Route, Plane } from 'lucide-react';
import RiderAtlasHero from '@/components/RiderAtlasHero';
import RiderAtlasTourPlanner from '@/components/RiderAtlasTourPlanner';

const SectionHeader = ({ icon, title, subtitle }) => (
    <div className="text-center mb-16 max-w-3xl mx-auto">
        <div className="flex justify-center mb-4">
            {React.cloneElement(icon, { className: "w-12 h-12 text-gold-accent" })}
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
        <p className="text-lg text-slate-400">{subtitle}</p>
    </div>
);

const FeatureCard = ({ icon, title, description, delay = 0 }) => (
    <motion.div 
        className="bg-navy-dark/50 border border-slate-800 rounded-lg p-8 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay }}
    >
        <div className="flex items-center gap-4 mb-4">
            {React.cloneElement(icon, { className: "w-8 h-8 text-gold-accent" })}
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-slate-400">{description}</p>
    </motion.div>
);

const Protocol = () => {
    return (
        <div className="bg-navy-deep text-slate-300">
            {/* --- CINEMATIC RIDER ATLAS HERO SECTION --- */}
            <RiderAtlasHero />

            {/* --- AI TOUR PLANNER FEATURES --- */}
            <RiderAtlasTourPlanner />

            {/* --- AIRCRAFT-GRADE LOGISTICS SECTION --- */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeader 
                        icon={<Ship />}
                        title="Aircraft-Grade Logistics"
                        subtitle="We treat your motorcycle like a priceless artifact. Our white-glove service ensures your machine arrives ready for the mission."
                    />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<Ship />}
                            title="The Air-Crate System"
                            description="Your bike is secured in a custom-built, fully enclosed air-transportable crate, providing maximum protection from pickup to destination."
                        />
                        <FeatureCard 
                            icon={<Route />}
                            title="End-to-End Handling"
                            description="We manage every step: from collecting your bike at your doorstep to delivering it to the mission's starting point hotel, fully insured."
                            delay={0.2}
                        />
                        <FeatureCard 
                            icon={<Plane />}
                            title="Fly In & Ride Out"
                            description="Forget the long, tedious highway miles. You fly in, relaxed and ready. Your bike will be waiting, prepped for the world's best roads."
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Protocol;