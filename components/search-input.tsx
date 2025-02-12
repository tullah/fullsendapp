"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "usehooks-ts";
import { useState, useEffect } from "react";

export function SearchInput() {
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

  return (
    <div className="relative w-full sm:w-[200px]">
      <input
        type="text"
        placeholder="🔍 Search players..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="input-base"
      />
    </div>
  );
} 