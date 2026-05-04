import type { MatchStatus } from '../types';
import type { TabKey } from '../constants';
import { TABS } from '../constants';

interface TabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  counts: Record<MatchStatus, number>;
}

export default function Tabs({ activeTab, onTabChange, counts }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-neutral-200">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer
              border-b-2 -mb-px
              ${isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs font-normal ${isActive ? 'text-primary/70' : 'text-neutral-400'}`}>
              {counts[tab.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
