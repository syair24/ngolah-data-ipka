'use client';

import { useEffect, useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import Datepicker from 'flowbite-datepicker/Datepicker';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function formatDisplayDate(value: string): string {
  if (!value) return '';

  const [year, month, day] = value.split('-');

  if (!year || !month || !day) {
    return '';
  }

  return `${day}-${month}-${year}`;
}

function formatISODate(value: string): string {
  const [day, month, year] = value.split('-');

  if (!day || !month || !year || day.length !== 2 || month.length !== 2 || year.length !== 4) {
    return '';
  }

  return `${year}-${month}-${day}`;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<Datepicker | null>(null);

  useEffect(() => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    const picker = new Datepicker(input, {
      format: 'dd-mm-yyyy',
      autohide: true,
      orientation: 'bottom',
    });

    pickerRef.current = picker;

    const handleChange = () => {
      const displayDate = input.value.trim();

      // Kalau tanggal dikosongkan
      if (!displayDate) {
        console.log('DATE PICKER DIKOSONGKAN');

        onChange('');

        return;
      }

      const isoDate = formatISODate(displayDate);

      console.log('DATE PICKER:', displayDate, '=>', isoDate);

      if (isoDate) {
        onChange(isoDate);
      }
    };

    input.addEventListener('changeDate', handleChange as EventListener);

    // Tangani juga kalau user menghapus isi input secara manual
    const handleInput = () => {
      const displayDate = input.value.trim();

      if (!displayDate) {
        console.log('INPUT DATE DIHAPUS');

        onChange('');
      }
    };

    input.addEventListener('input', handleInput);

    return () => {
      input.removeEventListener('changeDate', handleChange as EventListener);

      input.removeEventListener('input', handleInput);

      picker.destroy();

      pickerRef.current = null;
    };
  }, [onChange]);

  useEffect(() => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.value = formatDisplayDate(value);

    if (!value || !pickerRef.current) {
      return;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (year && month && day) {
      pickerRef.current.setDate(new Date(year, month - 1, day));
    }
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 start-0 z-10 flex items-center ps-3">
        <CalendarDays size={16} className="text-gray-400" />
      </div>

      <input
        ref={inputRef}
        type="text"
        defaultValue={formatDisplayDate(value)}
        placeholder={placeholder}
        autoComplete="off"
        className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 ps-10 pe-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
      />
    </div>
  );
}
