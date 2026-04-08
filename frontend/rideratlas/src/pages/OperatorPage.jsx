
import React, { useEffect, useReducer } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { 
  ShieldCheck, 
  MapPin, 
  Globe, 
  CheckCircle2, 
  ArrowRight,
  Info
} from "lucide-react";
import { 
  readGraphSnapshot, 
  readGraphShard, 
  getGraphShardStatus, 
  loadGraphShard 
} from "@/core/network/networkGraph";
import RelatedEntityLinks from "@/components/seo/RelatedEntityLinks";
import EntityIntroBlock from "@/components/seo/EntityIntroBlock";
import EntityFitSummary from "@/components/seo/EntityFitSummary";
import FaqBlock from "@/components/seo/FaqBlock";
import { getLinksForOperatorPage } from "@/utils/seoLinkGraph";
import { getFaqsForOperator, getFaqSchema } from "@/utils/seoFaqEngine";
import JsonLd from "@/components/seo/JsonLd";
import { getOperatorSchema, getBreadcrumbSchema } from "@/utils/seoSchema";
import { withBrandContext } from "@/utils/navigationTargets";

export default function OperatorPage() {
  const { id } = useParams();
  const location = useLocation();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const graph = readGraphSnapshot();
  const withCtx = (path) => withBrandContext(path, location.search);

  useEffect(() => {
    if (getGraphShardStatus("rentals") !== "loaded") {
      loadGraphShard("rentals").then(forceUpdate);
    }
  }, []);

  const rentalShard = readGraphShard("rentals");
  const operator = rentalShard?.operators?.[id];

  if (!operator) {
    return (
      <div className="min-h-screen bg-[#050606] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-[32px] border border-white/10 bg-[#121212] p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Info className="text-[#CDA755]" />
          </div>
          <h1 className="text-2xl font-black uppercase text-white mb-4">Operator Not Found</h1>
          <p className="text-white/60 mb-8">
            The operator "{id}" is not currently indexed in the RiderAtlas graph.
          </p>
          <Link to={withCtx("/")} className="text-[#CDA755] uppercase tracking-widest text-xs font-bold hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const linkGraph = getLinksForOperatorPage(operator, { ...graph, ...rentalShard }, location.pathname);
  const operatorSchema = getOperatorSchema(operator);
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Operators", url: "/operators" },
    { name: operator.name || id, url: `/operators/${id}` }
  ]);

  const rentalsByOperator = rentalShard?.rentalIndexes?.rentalsByOperator?.[operator.id || operator.slug] || [];
  const operatorRentals = rentalsByOperator.map(rentalId => rentalShard?.rentals?.[rentalId]).filter(Boolean);
  const faqs = getFaqsForOperator(operator, operatorRentals);
  const faqSchema = getFaqSchema(faqs);

  return (
    <div className="min-h-screen bg-[#050606] text-white pb-24">
      <JsonLd schema={operatorSchema} />
      <JsonLd schema={breadcrumbs} />
      <JsonLd schema={faqSchema} />

      <header className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(205,167,85,0.1),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#CDA755]/30 bg-[#CDA755]/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#CDA755] mb-8">
            <ShieldCheck size={14} />
            Verified B2B Partner
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-[-0.04em] leading-[0.9] text-white max-w-4xl">
            {operator.name}
          </h1>
          
          <div className="mt-12 flex flex-wrap gap-8">
            {operator.city && (
              <div className="flex items-start gap-3">
                <MapPin className="text-[#CDA755] shrink-0" size={18} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Base of Operations</div>
                  <div className="text-base font-bold">{operator.city}, {operator.country}</div>
                </div>
              </div>
            )}
            
            {operator.website_url && (
              <div className="flex items-start gap-3">
                <Globe className="text-[#CDA755] shrink-0" size={18} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Official Website</div>
                  <a href={operator.website_url} target="_blank" rel="noopener noreferrer" className="text-base font-bold hover:text-[#CDA755] transition-colors">
                    Visit Site
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-16 lg:grid-cols-[1fr_380px]">
          <section className="space-y-12">
            <div>
              <EntityIntroBlock entityType="operator" entityData={operator} graphData={{}} />
              <EntityFitSummary entityType="operator" entityData={operator} graphData={{}} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-[#121212] p-6">
                <CheckCircle2 className="text-[#CDA755] mb-4" size={24} />
                <h4 className="text-lg font-bold text-white mb-2 uppercase">Verified Fleet</h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  Every machine in this fleet is indexed and verified against our global graph for accuracy and availability.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#121212] p-6">
                <Globe className="text-[#CDA755] mb-4" size={24} />
                <h4 className="text-lg font-bold text-white mb-2 uppercase">Logistics Ready</h4>
                <p className="text-sm text-white/50 leading-relaxed">
                  Staged at major international hubs for instant deployment upon mission arrival.
                </p>
              </div>
            </div>

            {/* Link Blocks */}
            <RelatedEntityLinks linkGraph={linkGraph} />
            <FaqBlock faqs={faqs} />
          </section>

          <aside className="space-y-8">
            <div className="rounded-[32px] border border-[#CDA755]/20 bg-[#CDA755]/5 p-8">
              <h3 className="text-xl font-black uppercase text-white mb-6">Service Summary</h3>
              <ul className="space-y-4">
                <li className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-[10px] uppercase tracking-widest text-white/40">Status</span>
                  <span className="text-xs font-bold text-[#CDA755] uppercase">Verified</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-[10px] uppercase tracking-widest text-white/40">Type</span>
                  <span className="text-xs font-bold text-white uppercase">{operator.type || 'Standard'}</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-[10px] uppercase tracking-widest text-white/40">Airports</span>
                  <span className="text-xs font-bold text-white uppercase">{(operator.airports || []).length} Hubs</span>
                </li>
              </ul>
              
              <Link 
                to={withCtx("/moto-airlift#booking")}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-[#050606] transition-transform hover:scale-[1.02] active:scale-95"
              >
                Inquire With Operator
                <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
