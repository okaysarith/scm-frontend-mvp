import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, X, Check } from 'lucide-react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxItems?: number;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  maxItems = 10
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter(item => item !== value));
  };

  const selectedLabels = selected.map(value => 
    options.find(option => option.value === value)?.label || value
  );

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal h-10"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center w-full">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
              {selectedLabels.slice(0, maxItems).map((label, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {label}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(selected[index]);
                    }}
                  />
                </Badge>
              ))}
              {selected.length > maxItems && (
                <Badge variant="secondary" className="text-xs">
                  +{selected.length - maxItems} more
                </Badge>
              )}
            </div>
          )}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </div>
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg">
          <div className="max-h-64 overflow-y-auto p-2">
            {options.map((option, index) => (
              <div
                key={`${option.value}-${index}`}
                className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer"
                onClick={() => handleSelect(option.value)}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  selected.includes(option.value) 
                    ? 'bg-primary border-primary' 
                    : 'border-primary'
                }`}>
                  {selected.includes(option.value) && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
