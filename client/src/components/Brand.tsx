import { useState } from "react";
export function Brand({ large = false }: { large?: boolean }) {
  const [missing, setMissing] = useState(false);
  return (
    <span className={`brand ${large ? "brand-large" : ""}`}>
      {missing ? (
        <span className="wordmark" aria-label="TSI text mark">
          TS<span>I</span>
          <i />
        </span>
      ) : (
        <img
          src="/assets/tsi-logo.png"
          alt="TSI"
          onError={() => setMissing(true)}
        />
      )}
      <span className="brand-name">
        TECHO SPARK<span>INDUSTRIES</span>
      </span>
    </span>
  );
}
