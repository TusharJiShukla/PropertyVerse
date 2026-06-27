import Footer from "./components/footer/page";
import HeroSection from "./hero/page";
export default function Home() {
  return (
    <div className="min-h-screen bg-[#f9f1dd]">
      <HeroSection />
      <Footer/>
    </div>
  );
}
