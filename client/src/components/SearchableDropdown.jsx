import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  // Filter options based on Name OR Dial Code
  const filtered = options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.dial_code.includes(searchTerm)
  );

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative w-32" ref={wrapperRef}>
      {/* The Trigger Button / Display */}
      <div
        className="p-2 border rounded-l-lg text-sm bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 h-full border-r-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-mono font-bold truncate">
          {value || placeholder}
        </span>
        <ChevronDown size={14} className="opacity-50 ml-1" />
      </div>

      {/* The Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b sticky top-0 bg-white rounded-t-lg">
            <div className="flex items-center gap-2 bg-gray-100 p-1 px-2 rounded-md">
              <Search size={12} className="opacity-50" />
              <input
                autoFocus
                type="text"
                className="bg-transparent outline-none text-xs w-full"
                placeholder="Search name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* List Items */}
          <div className="overflow-y-auto flex-1 p-1">
            {filtered.length > 0 ? (
              filtered.map((opt, i) => (
                <div
                  key={i}
                  className="p-2 hover:bg-blue-50 cursor-pointer rounded text-xs flex justify-between items-center"
                  onClick={() => {
                    onChange(opt.dial_code);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <span>{opt.name}</span>
                  <span className="font-mono text-gray-500 font-bold">
                    {opt.dial_code}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-gray-400">
                No match found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
