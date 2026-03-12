import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, Film, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FeatureCard = ({ icon, title, description, expandedContent }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-navy-dark/60 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-amber-500/20"
        >
            <div className="absolute inset-0 border border-gold-accent/20 rounded-xl transition-all duration-300 group-hover:border-gold-accent/40"></div>
            
            <motion.div layout="position" className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                    {React.cloneElement(icon, { className: "w-8 h-8 text-gold-accent transition-transform duration-300 group-hover:scale-110" })}
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                </div>
                <p className="text-slate-300 mb-4 flex-grow">{description}</p>
                
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 border-t border-gold-accent/20 pt-4 space-y-4">
                                {expandedContent}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div layout className="mt-auto pt-4 flex items-center justify-end text-xs font-semibold text-gold-accent/80 group-hover:text-gold-accent">
                    <span>{isExpanded ? 'Show Less' : 'Learn More'}</span>
                    <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform duration-300", isExpanded && "rotate-180")} />
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

const RiderAtlasTourPlanner = () => {
    return (
        <div className="bg-[#0a0a0a] py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Sparkles />}
                        title="How It Works (AI Route Creation)"
                        description="Our AI analyzes thousands of legendary routes to craft personalized missions. Input your preferences and watch the algorithm design a journey tailored to your style."
                        expandedContent={
                            <ul className="list-disc list-inside space-y-2 text-slate-400 text-sm">
                                <li><strong>Input DNA:</strong> Specify your desired ride tempo, duration, and scenery type.</li>
                                <li><strong>Algorithm Magic:</strong> Our system processes millions of data points on road quality, curvature, and elevation.</li>
                                <li><strong>Route Generation:</strong> A unique, multi-day route is built with optimized waypoints and overnight stays.</li>
                                <li><strong>Itinerary Output:</strong> Receive a full mission briefing, ready for your GPS.</li>
                            </ul>
                        }
                    />
                    <FeatureCard
                        icon={<Play />}
                        title="Mission Preview Engine"
                        description="Before you ride, experience your mission through cinematic previews. Our engine renders stunning visualizations of every curve, pass, and scenic vista."
                        expandedContent={
                             <ul className="list-disc list-inside space-y-2 text-slate-400 text-sm">
                                <li><strong>Data-Driven Visuals:</strong> We combine satellite imagery with elevation data to create a 3D environment.</li>
                                <li><strong>Cinematic Fly-Throughs:</strong> Experience key sections of your route from a rider's-eye view or a dramatic drone perspective.</li>
                                <li><strong>Highlight Reels:</strong> Automatically identifies and showcases the most technical twisties and breathtaking viewpoints.</li>
                            </ul>
                        }
                    />
                    <FeatureCard
                        icon={<Film />}
                        title="Scene-Builder Movie Factory"
                        description="Transform your ride into a cinematic masterpiece. Our Movie Factory captures your journey and crafts professional-grade films with dynamic editing and effects."
                        expandedContent={
                             <ul className="list-disc list-inside space-y-2 text-slate-400 text-sm">
                                <li><strong>Automated Capture:</strong> Sync your GoPro or smartphone footage with your logged telemetrics.</li>
                                <li><strong>AI-Powered Editing:</strong> The system automatically cuts scenes to music, highlighting moments of high G-force or speed.</li>
                                <li><strong>Professional Polish:</strong> Adds title cards, map overlays, and color grading for a studio-quality finish.</li>
                                <li><strong>Instant Sharing:</strong> Export your film and share your legend with the world.</li>
                            </ul>
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default RiderAtlasTourPlanner;