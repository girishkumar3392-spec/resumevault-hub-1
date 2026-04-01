import { Menu } from "lucide-react";
import { useOutletContext } from "react-router-dom";

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

interface LayoutContext {
  onMenuToggle: () => void;
}

export default function PageHeader({ title, subtitle, children }: Props) {
  const context = useOutletContext<LayoutContext>();

  return (
    <div className="h-14 md:h-16 border-b border-border px-4 md:px-8 flex items-center justify-between bg-background sticky top-0 z-40 gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={context?.onMenuToggle}
          className="md:hidden w-8 h-8 rounded-md bg-hover border border-border text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-display font-bold text-foreground truncate">{title}</h1>
          {subtitle && <p className="text-[11px] md:text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {children}
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
