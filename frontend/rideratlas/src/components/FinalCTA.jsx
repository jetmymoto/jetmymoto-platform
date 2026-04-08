import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
const FinalCTA = () => {
  const {
    toast
  } = useToast();
  const handleBeginStory = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };
  return <section className="relative py-32 px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-[#050505]/30 z-10" />
        <img className="w-full h-full object-cover" alt="Luxury motorcycle in front of Monte Carlo casino at night" src="https://images.unsplash.com/photo-1617329092870-ca99b7fa5f23" />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto text-center">
        <motion.h2 initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.8
      }} className="font-serif text-5xl md:text-7xl font-bold text-white mb-6">
          Your Next Chapter Awaits
        </motion.h2>

        <motion.p initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.8,
        delay: 0.2
      }} className="text-xl md:text-2xl text-zinc-300 mb-12 font-light">
          Stop dreaming of the perfect ride. Start living it.
        </motion.p>

        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.8,
        delay: 0.4
      }}>
          <Button onClick={handleBeginStory} size="lg" className="bg-amber-700 hover:bg-amber-600 text-white px-12 py-7 text-xl font-medium transition-all duration-300 hover:scale-105 shadow-2xl">Begin Your Story with Rider Atlas</Button>
        </motion.div>
      </div>
    </section>;
};
export default FinalCTA;