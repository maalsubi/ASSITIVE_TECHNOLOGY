import { useState } from "react";
import { ScanLine, Watch, Cpu } from "lucide-react";
const paths = {
  stick: "assistive-stick-front.jpg",
  rear: "assistive-stick-rear.jpg",
  watch: "wearable-watch.jpg",
  board: "circuit-board.jpg",
};
export function ProductVisual({
  type = "stick",
  className = "",
  eager = false,
}: {
  type?: keyof typeof paths;
  className?: string;
  eager?: boolean;
}) {
  const [missing, setMissing] = useState(false);
  const Icon = type === "watch" ? Watch : type === "board" ? Cpu : ScanLine;
  const label =
    type === "watch"
      ? "Wearable watch"
      : type === "board"
        ? "Board & enclosure"
        : type === "rear"
          ? "Assistive stick · rear"
          : "Smart assistive stick";
  return (
    <div className={`product-visual ${type} ${className}`}>
      {missing ? (
        <div className="asset-placeholder">
          <Icon strokeWidth={0.7} aria-hidden="true" />
          <span>{label}</span>
          <small>PRODUCT IMAGE AWAITING UPLOAD</small>
        </div>
      ) : (
        <img
          src={`/assets/${paths[type]}`}
          srcSet={
            type !== "board"
              ? `/assets/${paths[type].replace(".jpg", "-960.jpg")} ${type === "rear" ? 960 : 540}w, /assets/${paths[type]} ${type === "rear" ? 4080 : 2296}w`
              : undefined
          }
          sizes={
            type === "rear"
              ? "(max-width: 700px) 90vw, 50vw"
              : "(max-width: 700px) 70vw, 40vw"
          }
          alt={label}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setMissing(true)}
        />
      )}
    </div>
  );
}
export function Ecosystem({ className = "" }: { className?: string }) {
  return (
    <div className={`ecosystem ${className}`}>
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="signal-line line-one" />
      <div className="signal-line line-two" />
      <div className="floating watch-left">
        <ProductVisual type="watch" />
        <span className="visual-label">01 / WEARABLE</span>
      </div>
      <div className="central-product">
        <ProductVisual eager />
        <span className="visual-label">ASSISTIVE MODULE</span>
      </div>
      <div className="floating watch-right">
        <ProductVisual type="watch" />
        <span className="visual-label">02 / WEARABLE</span>
      </div>
      <span className="composition-note">
        PRODUCT PHOTOGRAPHS · TWO-WATCH CONFIGURATION ILLUSTRATED
      </span>
    </div>
  );
}
