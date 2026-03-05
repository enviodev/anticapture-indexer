import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border-primary bg-bg-secondary/50 py-3">
      <div className="max-w-[1920px] mx-auto px-4 flex items-center justify-between text-[10px] text-text-muted">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-accent-amber" />
          <span>
            Powered by{" "}
            <a
              href="https://envio.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan hover:underline"
            >
              Envio HyperIndex
            </a>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Polygon Mainnet</span>
          <a
            href="https://github.com/enviodev/hyperindex"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan hover:underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
