import HeaderJetMyMoto from "@/components/layout/HeaderJetMyMoto.jsx";
import FooterJetMyMoto from "@/components/layout/FooterJetMyMoto.jsx";

export default function BrandLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderJetMyMoto />

      <main className="flex-1 pt-20">
        {children}
      </main>

      <FooterJetMyMoto />

    </div>
  );
}
