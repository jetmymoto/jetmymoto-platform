import React from 'react';
import { CheckCircle, Truck } from 'lucide-react';

const JetTransportFeature = () => (
  <section className="bg-[#0A0A0A] py-24">
    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8"><Truck className="text-amber-500" size={32}/></div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Premium Bike Transport</h2>
        <p className="text-gray-400 text-lg leading-relaxed mb-8">The core of our service. Secure, fully-insured, white-glove transport for your motorcycle. We handle the logistics from your garage to the starting line.</p>
        <ul className="space-y-4 mb-8">
          {["Door-to-Destination Service", "Comprehensive Insurance Coverage", "Real-time Satellite Tracking"].map(item => (
            <li key={item} className="flex items-center gap-3 text-white"><CheckCircle className="text-green-500" size={20} /> {item}</li>
          ))}
        </ul>
        <button className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded font-bold">Get a Transport Quote</button>
      </div>
      <div className="h-[600px] rounded-3xl overflow-hidden relative">
        <img src="https://images.unsplash.com/photo-1625902377855-4424354c4146?q=80&w=1974&auto=format&fit=crop" className="w-full h-full object-cover" alt="Transport" />
      </div>
    </div>
  </section>
);
export default JetTransportFeature;
