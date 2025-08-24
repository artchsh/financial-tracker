import React from 'react';
import { Sun, Moon, Monitor, LucideSun, LucideMoon, LucideLaptop } from 'lucide-react';
import { Dropdown } from './Dropdown';

interface ThemeToggleProps {
  theme: 'light' | 'dark' | 'system';
  onChange: (theme: 'light' | 'dark' | 'system') => void;
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const themeOptions = [
    {
      value: 'light',
      label: <span className='flex gap-1 align-center'><LucideSun />Light</span>,
    },
    {
      value: 'dark',
      label: <span className='flex gap-1 align-center'><LucideMoon />Dark</span>,
    },
    {
      value: 'system',
      label: <span className='flex gap-1 align-center'><LucideLaptop />System</span>,
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
