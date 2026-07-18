"use client"

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface SearchableItemDropdownProps {
  items: any[];
  selectedId: number | null;
  onChange: (id: number) => void;
  placeholder?: string;
}


const SearchableItemDropdown: React.FC<SearchableItemDropdownProps> = ({
  items,
  selectedId,
  onChange,
  placeholder = "Select item...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedItem = items.find((item) => item.id === selectedId);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative flex-1 min-w-50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-left transition-all"
      >
        {selectedItem ? (
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedItem.imageUrl ? (
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                className="w-5 h-5 rounded object-cover shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 shrink-0 font-bold">
                ?
              </div>
            )}
            <span className="font-medium text-gray-700 truncate">{selectedItem.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDown size={14} className="text-gray-500 ml-1 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex flex-col max-h-64">
          <div className="p-2 border-b border-gray-100 bg-gray-50 rounded-t-lg sticky top-0">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            {filteredItems.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400 font-medium">
                No items found
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors ${
                    item.id === selectedId ? "bg-blue-50/50" : ""
                  }`}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-7 h-7 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 shrink-0 font-bold">
                      ?
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${
                      item.id === selectedId ? "text-blue-700" : "text-gray-700"
                    }`}>
                      {item.name}
                    </p>
                    <p className="text-[10px] text-gray-500">${item.price}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableItemDropdown;