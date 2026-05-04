import { useState, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import type { MatchRecord } from '../types';
import { StatusBadge } from './Badge';
import Input from './Input';

export interface SearchSuggestion {
  record: MatchRecord;
  label: string;
  dob?: string;
  confidence?: string;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  onSelectSuggestion?: (record: MatchRecord) => void;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Name or DOB (e.g. "2002", "March 15", "03/15/1990")...',
  suggestions,
  onSelectSuggestion,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);

  const showDropdown = focused && value.trim() && suggestions && suggestions.length > 0;

  const handleSelect = useCallback(
    (record: MatchRecord) => {
      onSelectSuggestion?.(record);
      setActiveIndex(-1);
    },
    [onSelectSuggestion],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || !suggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelect(suggestions[activeIndex].record);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setActiveIndex(-1);
        (e.target as HTMLInputElement).blur();
        break;
    }
  };

  const handleChange = (val: string) => {
    setActiveIndex(-1);
    onChange(val);
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />

      <Input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 text-neutral-800"
        role="combobox"
        aria-expanded={!!showDropdown}
        aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
        aria-autocomplete="list"
        aria-controls="search-listbox"
      />

      {value && (
        <button
          type="button"
          onClick={() => handleChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded
            text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
          aria-label="Clear search">
          <X className="w-4 h-4" />
        </button>
      )}

      {showDropdown && (
        <ul
          ref={listRef}
          id="search-listbox"
          role="listbox"
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((s, index) => (
            <li
              key={s.record.match.ExternalPatientId}
              id={`search-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}>
              <button
                type="button"
                className={`w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer
                  flex items-center justify-between gap-2
                  ${index === activeIndex ? 'bg-primary/7 text-primary' : 'hover:bg-neutral-50'}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(s.record);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                tabIndex={-1}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-neutral-700 font-medium">{s.label}</span>
                    {s.confidence && <span className="text-xs text-neutral-400 flex-shrink-0">{s.confidence}</span>}
                  </div>
                  {s.dob && <span className="block text-xs text-neutral-400 mt-0.5">DOB {s.dob}</span>}
                </div>
                <StatusBadge status={s.record.status} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
