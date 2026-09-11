import { FileUp, ScanText, Rows3, ArrowRight } from "lucide-react";

const miniSteps = [
  { icon: FileUp, label: "Upload" },
  { icon: ScanText, label: "AI reads it" },
  { icon: Rows3, label: "Get your reel" },
];

export default function UploadFooter() {
  return (
    <div className="mx-auto mt-14 flex max-w-md items-center justify-center gap-3 sm:gap-5">
      {miniSteps.map(({ icon: Icon, label }, i) => (
        <div key={label} className="flex items-center gap-3 sm:gap-5">
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-soft)]">
              <Icon size={15} className="text-[var(--color-forest)]" />
            </span>
            <span className="text-[11px] text-[var(--color-ink-soft)]">
              {label}
            </span>
          </div>
          {i < miniSteps.length - 1 && (
            <ArrowRight size={14} className="mb-4 text-[var(--color-border)]" />
          )}
        </div>
      ))}
    </div>
  );
}