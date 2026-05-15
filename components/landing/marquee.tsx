const ITEMS = [
  "Email Verification",
  "Secret Voter IDs",
  "Anonymous Voting",
  "Live Results",
  "Audit Logs",
  "Row Level Security",
];

export function Marquee() {
  const text = ITEMS.map((item) => `${item} ✦`).join(" ");

  return (
    <div className="overflow-hidden bg-ink py-4">
      <div className="marquee-track flex whitespace-nowrap">
        <span className="marquee-content px-4 text-sm font-medium tracking-wide text-paper/90">
          {text}
        </span>
        <span className="marquee-content px-4 text-sm font-medium tracking-wide text-paper/90" aria-hidden>
          {text}
        </span>
      </div>
    </div>
  );
}
