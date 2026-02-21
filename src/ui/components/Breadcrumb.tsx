import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm mb-3">
      <Home size={14} className="text-on-surface-muted flex-shrink-0" />
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={12} className="text-on-surface-muted flex-shrink-0" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-on-surface-muted hover:text-on-surface transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-on-surface font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
