import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-heading text-2xl font-bold text-ink">
              Vote<span className="italic text-teal">Flow</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Secure online election management for organizations that take
              democracy seriously.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Product
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="/elections" className="text-ink hover:text-teal">
                    Elections
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="text-ink hover:text-teal">
                    How it Works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Account
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="/auth/login" className="text-ink hover:text-teal">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="text-ink hover:text-teal">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Legal
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-12 border-t border-border pt-8 text-center text-xs text-muted">
          © {new Date().getFullYear()} VoteFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
