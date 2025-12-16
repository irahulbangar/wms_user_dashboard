import React, { useRef } from "react";

interface SelectionDropdownProps<T> {
  items: T[];
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  getItemId: (item: T) => number;
  getItemName: (item: T) => string;
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
}

export function SelectionDropdown<T>({
  items,
  selectedIds,
  onSelectionChange,
  isOpen,
  getItemId,
  getItemName,
  dropdownRef,
}: Omit<SelectionDropdownProps<T>, "onToggle">) {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = dropdownRef || internalRef;

  if (!items || items.length === 0 || !isOpen) return null;

  const allSelected = selectedIds.size === items.length;

  return (
    <div
      ref={ref}
      className="ml-6 mt-1 mb-2 flex flex-col space-y-1 border-l-2 border-border-secondary pl-2 w-full"
    >
      <div className="flex items-center justify-between px-2 py-1 mb-1">
        <button
          type="button"
          onClick={() => {
            onSelectionChange(
              allSelected ? new Set() : new Set(items.map(getItemId))
            );
          }}
          className="text-xs font-roboto text-text-secondary hover:underline cursor-pointer"
        >
          {allSelected ? "Deselect All" : "Select All"}
        </button>
      </div>
      <div className="flex flex-col space-y-1 w-full">
        {items.map((item) => {
          const id = getItemId(item);
          return (
            <label
              key={id}
              className="flex items-center gap-2 px-2 py-1.5 bg-primary border-b border-border-secondary hover:shadow-sm cursor-pointer w-full"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(id)}
                onChange={(e) => {
                  const newSet = new Set(selectedIds);
                  if (e.target.checked) {
                    newSet.add(id);
                  } else {
                    newSet.delete(id);
                  }
                  onSelectionChange(newSet);
                }}
                className="w-4 h-4 text-primary bg-input-bg border-border-primary rounded focus:ring-primary focus:ring-2 shrink-0"
              />
              <span className="text-xs font-roboto text-text-secondary truncate">
                {getItemName(item)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
