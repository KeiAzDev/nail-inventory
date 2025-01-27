'use client';

interface SelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
    >
      {children}
    </select>
  );
}

export function SelectTrigger({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between">{children}</div>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 w-full">{children}</div>;
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span className="block truncate">{placeholder}</span>;
}