import { CiSearch } from "react-icons/ci";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  iconSize?: number;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder,
  icon,
  iconSize,
}: SearchBarProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-xl gap-2 w-[300px] focus-within:border-[#F295B6] transition-colors duration-200">
      <input
        type="text"
        className="outline-none w-full text-md search-input"
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {icon || <CiSearch fontSize={iconSize || 24} />}
    </div>
  );
};
