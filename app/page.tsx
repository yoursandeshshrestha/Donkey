import { Hero } from "./components/landing/Hero";
import { FAQ } from "./components/landing/FAQ";
import { Footer } from "./components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f5f3]">
      <Hero />
      <FAQ />
      <Footer />
    </div>
  );
}
