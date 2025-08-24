import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Dropdown } from './Dropdown';

interface ThemeToggleProps {
  theme: 'light' | 'dark' | 'system';
  onChange: (theme: 'light' | 'dark' | 'system') => void;
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const themeOptions = [
    {
      value: 'light',
      label: '☀️ Light',
    },
    {
      value: 'dark',
      label: '🌙 Dark',
    },
    {
      value: 'system',
      label: '💻 System',
    },
  ];

  return (
    <Dropdown
      options={themeOptions}
      value={theme}
      onChange={(value) => onChange(value as 'light' | 'dark' | 'system')}
    />
  );
}
