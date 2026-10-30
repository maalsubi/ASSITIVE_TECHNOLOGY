import { Brand } from "./Brand";
import { links } from "./Navigation";
import { ArrowUpRight } from "lucide-react";
export function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <a href="#home" aria-label="Techo Spark Industries home">
            <Brand />
          </a>
          <p>
            Intelligent electronics.
            <br />
            Human-centered possibilities.
          </p>
        </div>
        <div className="footer-links">
          {links.slice(1).map(([id, label]) => (
            <a href={`#${id}`} key={id}>
              {label}
            </a>
          ))}
        </div>
        <a href="#home" className="back-top">
          BACK TO TOP <ArrowUpRight size={17} />
        </a>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Techo Spark Industries. All rights
          reserved.
        </span>
        <span>SEE BEYOND SIGHT.</span>
      </div>
    </footer>
  );
}
