import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ExperienceSection from "@/components/Experience";
import Projects from "@/components/Projects";
import Numbers from "@/components/Numbers";
import Stack from "@/components/Stack";
import GitHubActivity from "@/components/GitHubActivity";
import OffClock from "@/components/OffClock";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

// Re-render at most hourly so the live Chess.com stats stay fresh.
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Loader />
      <Nav />
      <main id="top">
        <Hero />
        <ExperienceSection />
        <Projects />
        <Numbers />
        <Stack />
        <GitHubActivity />
        <OffClock />
        <Contact />
      </main>
      <Footer />
      <Reveal />
    </>
  );
}
