import { profile } from "@/content/site";

export default function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} {profile.name}</span>
      <span>Designed &amp; built in New Delhi with Next.js</span>
      <a href="#top" className="link">
        Back to top ↑
      </a>
    </footer>
  );
}
