"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "usehooks-ts";
import { useState, useEffect, ChangeEvent } from "react";
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [term, setTerm] = useState(searchParams.get('search')?.toString() || '');
  const debouncedTerm = useDebounce(term, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedTerm) {
      params.set('search', debouncedTerm);
    } else {
      params.delete('search');
    }
    replace(`${pathname}?${params.toString()}`);
  }, [debouncedTerm, pathname, replace, searchParams]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-foreground/40 pointer-events-none">
        <Search className="w-4 h-4 group-focus-within:text-primary transition-colors" />
        <div className="hidden sm:block text-xs font-medium px-1.5 py-0.5 rounded-md bg-secondary/60 text-foreground/50 group-focus-within:bg-primary/10 group-focus-within:text-primary transition-colors">
          Search
        </div>
      </div>
      <input
        type="text"
        value={term}
        onChange={handleChange}
        placeholder="Find a player..."
        className="w-full pl-10 sm:pl-24 pr-4 py-2.5 text-sm rounded-lg 
                 bg-white border border-gray-200
                 placeholder:text-foreground/40 
                 focus:outline-none focus:border-primary 
                 focus:ring-4 focus:ring-primary/5
                 hover:border-gray-300
                 transition-all duration-200"
      />
    </div>
  );
} 