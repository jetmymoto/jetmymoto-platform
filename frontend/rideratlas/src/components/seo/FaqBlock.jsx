
import React from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * FaqBlock Component
 * Renders the visible FAQ section corresponding to the FAQPage JSON-LD schema.
 */
const FaqBlock = ({ faqs }) => {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mt-16 w-full max-w-4xl border-t border-white/5 pt-12">
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.34em] text-[#CDA755] mb-6">
        <HelpCircle size={16} />
        Frequently Asked Questions
      </div>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-[#121212] p-6 transition-colors hover:border-[#CDA755]/30">
            <h4 className="text-lg font-bold text-white mb-3 tracking-tight">
              {faq.question}
            </h4>
            <p className="text-sm leading-relaxed text-zinc-400">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqBlock;
