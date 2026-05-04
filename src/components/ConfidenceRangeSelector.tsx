import { useState } from 'react';
import Input from './Input';
import Button from './Button';

interface ConfidenceRangeSelectorProps {
  onSelect: (min: number | null, max: number | null) => void;
}

export default function ConfidenceRangeSelector({ onSelect }: ConfidenceRangeSelectorProps) {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  const handleSelect = () => {
    let minVal = min ? parseInt(min, 10) : null;
    let maxVal = max ? parseInt(max, 10) : null;

    // Clamp to 0–100
    if (minVal !== null) minVal = Math.max(0, Math.min(100, minVal));
    if (maxVal !== null) maxVal = Math.max(0, Math.min(100, maxVal));

    // Swap if min > max
    if (minVal !== null && maxVal !== null && minVal > maxVal) {
      [minVal, maxVal] = [maxVal, minVal];
    }

    onSelect(minVal !== null ? minVal / 100 : null, maxVal !== null ? maxVal / 100 : null);
  };

  const handleSelectAll = () => {
    setMin('');
    setMax('');
    onSelect(null, null);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text" // Used so we don't accidentally scroll the mouse or hit the up/down arrow and change it
        inputMode="numeric" // This is better for phones and tablets - tablets are the more possible use case here
        min={0}
        max={100}
        step={1}
        placeholder="Min %"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        inputSize="sm"
        className="w-24 text-center"
      />
      <span className="text-xs text-neutral-400">&ndash;</span>
      <Input
        type="text"
        inputMode="numeric"
        min={0}
        max={100}
        step={1}
        placeholder="Max %"
        value={max}
        onChange={(e) => setMax(e.target.value)}
        inputSize="sm"
        className="w-24 text-center"
      />
      <Button
        variant="primary"
        size="sm"
        onClick={handleSelect}>
        Select
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSelectAll}>
        All
      </Button>
    </div>
  );
}
