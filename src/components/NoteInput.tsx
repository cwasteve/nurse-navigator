import { useState } from 'react';
import Button from './Button';
import Textarea from './Textarea';

interface NoteInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
}

export default function NoteInput({ onSubmit, placeholder = 'Add a note...' }: NoteInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  };

  return (
    <div className="flex gap-2 items-end">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="flex-1"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!text.trim()}>
        Add Note
      </Button>
    </div>
  );
}
