import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  className?: string;
}

const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, error, className }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onChange(formatted);
  };

  return (
    <div
      className={cn(
        'glass-card flex items-center gap-3 px-4 py-3 transition-all duration-300',
        isFocused && 'ring-2 ring-primary/50',
        error && 'ring-2 ring-destructive/50',
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground border-r border-border pr-3">
        <Phone className="w-5 h-5" />
        <span className="text-sm font-medium">+55</span>
      </div>
      <input
        type="tel"
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="(11) 99999-9999"
        className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
        maxLength={16}
      />
    </div>
  );
};

export default PhoneInput;
