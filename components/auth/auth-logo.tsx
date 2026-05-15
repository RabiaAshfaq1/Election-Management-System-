import Link from "next/link";

export function AuthLogo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal text-paper shadow-card">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          aria-hidden
        >
          <path
            d="M12 3L4 9v12h16V9l-8-6z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M9 14l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-heading text-xl font-bold tracking-tight text-ink">
        Vote<span className="text-teal">Flow</span>
      </span>
    </Link>
  );
}
