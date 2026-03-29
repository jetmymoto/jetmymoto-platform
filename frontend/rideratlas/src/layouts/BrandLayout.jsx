import HeaderJetMyMoto from "@/components/layout/HeaderJetMyMoto.jsx";
import FooterJetMyMoto from "@/components/layout/FooterJetMyMoto.jsx";
import { useLocation } from "react-router-dom";
import { getSiteConfig } from "@/utils/siteConfig";

export default function BrandLayout({ children }) {
  const location = useLocation();
  const site = getSiteConfig();
  const brandCtx = new URLSearchParams(location.search).get("ctx");
  const isJetMyMoto =
    site.id === "jmm" ||
    location.pathname === "/jetmymoto" ||
    location.pathname.startsWith("/moto-airlift") ||
    location.pathname.startsWith("/pool/") ||
    brandCtx === "jet";

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-700 ${
        isJetMyMoto ? "bg-[#F8F8F8] text-[#574C43]" : "bg-[#050505] text-white"
      }`}
    >
      <HeaderJetMyMoto isJetMyMoto={isJetMyMoto} />

      <main className="flex-1 pt-20 transition-colors duration-700">
        {children}
      </main>

      <FooterJetMyMoto isJetMyMoto={isJetMyMoto} />

    </div>
  );
}
