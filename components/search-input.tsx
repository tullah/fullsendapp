"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "usehooks-ts";
import { useState, useEffect, ChangeEvent } from "react";

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
    <div className="relative w-full sm:w-[200px]">
      <input
        type="text"
        placeholder="🔍 Search players..."
        value={term}
        onChange={handleChange}
        className="input-base"
      />
    </div>
  );
} 