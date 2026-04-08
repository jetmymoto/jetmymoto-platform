
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * RelatedEntityLinks Component
 * Renders a structured block of internal links for SEO and discovery.
 * Designed to be visible, crawlable, and aesthetically aligned with the site.
 */
const RelatedEntityLinks = ({ linkGraph }) => {
  if (!linkGraph || !linkGraph.sections || linkGraph.sections.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 space-y-12">
      {linkGraph.sections.map((section) => (
        <div key={section.key} className="space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#CDA755]">
              {section.eyebrow}
            </span>
            <h3 className="text-2xl font-black uppercase tracking-[-0.04em] text-white">
              {section.title}
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.links.map((link, index) => (
              <Link
                key={`${link.to}-${index}`}
                to={link.to}
                className="group flex flex-col justify-between rounded-[24px] border border-white/10 bg-[#121212] p-5 transition-all duration-300 hover:border-[#CDA755]/40 hover:bg-[#121212]/90"
              >
                <div className="space-y-1">
                  <div className="text-base font-bold uppercase tracking-tight text-white group-hover:text-[#CDA755] transition-colors">
                    {link.label}
                  </div>
                  {link.meta && (
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/46">
                      {link.meta}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-end text-[#CDA755]">
                  <span className="text-[9px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                    Explore
                  </span>
                  <ChevronRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default RelatedEntityLinks;
