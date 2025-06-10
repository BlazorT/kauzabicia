import { Input } from "../ui/input";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import clsx from "clsx";

type SearchBarProps = {
  onSearch: (query: string) => void;
  placeholder: string;
  className?: string; // for outer container
  inputClassName?: string; // for the <Input> element
};

export const SearchBar = ({
  onSearch,
  placeholder,
  className,
  inputClassName,
}: SearchBarProps) => {
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className={clsx("relative w-full", className)}>
      <Search className="absolute left-3 top-1.5 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={clsx("pl-10 pr-10 text-lg", inputClassName)}
      />
      {query && (
        <X
          className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
          onClick={handleClear}
        />
      )}
    </div>
  );
};
