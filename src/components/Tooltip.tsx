import * as RadixTooltip from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
}

export default function Tooltip({ content }: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center
            text-neutral-400 hover:text-neutral-600
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-full
            transition-colors cursor-help"
          aria-label={content}
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          sideOffset={5}
          className="z-50 px-3 py-2 text-xs leading-relaxed text-white bg-neutral-800
            rounded-md shadow-lg max-w-xs
            animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        >
          {content}
          <RadixTooltip.Arrow className="fill-neutral-800" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
