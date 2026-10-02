"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PUBLIC_NAVIGATION, isPublicRouteCurrent } from "@/lib/public-journey";

export default function PublicFooter() {
  const pathname = usePathname();
  return (
    <footer className="pf-footer">
      <div className="pf-wrap">
        <div className="pf-footer-inner">
          <div>
            <Link href="/about" className="pf-footer-name">
              Abe Reyes
            </Link>
            <p>
              Independent development. Technical support.
              <br />A practical approach to connected problems.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            {PUBLIC_NAVIGATION.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={
                  isPublicRouteCurrent(pathname, link.href) ? "page" : undefined
                }
              >
                {link.label}
              </Link>
            ))}
            <Link href="/contact">Contact Abe</Link>
          </nav>
        </div>
        <div className="pf-footer-bottom">
          <span>NeedThisDone / The developer portfolio of Abe Reyes</span>
          <div>
            <a
              href="https://github.com/AbeJitsu/Need_This_Done"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a href="mailto:hello@needthisdone.com">Email</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/ada-compliance">Accessibility</Link>
            <Link href="/login">Account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
