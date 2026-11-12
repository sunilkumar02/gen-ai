import { Sparkles } from "lucide-react";

type BrandMarkProps = {
  size?: number;
};

export function BrandMark({ size = 15 }: BrandMarkProps) {
  return (
    <span className="brand-mark" aria-hidden="true">
      <Sparkles size={size} strokeWidth={2.2} />
    </span>
  );
}
