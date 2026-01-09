"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MultiSelectDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  allowOther?: boolean;
  otherPlaceholder?: string;
}

export default function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  label,
  required = false,
  allowOther = true,
  otherPlaceholder = "Enter other option",
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [otherValue, setOtherValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Initialize otherValue from selected items that aren't in options
    const otherSelected = selected.filter((item) => !options.includes(item));
    if (otherSelected.length > 0) {
      setOtherValue(otherSelected[0]);
    }
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleOtherChange = (value: string) => {
    setOtherValue(value);
    const standardSelected = selected.filter((item) => options.includes(item));
    if (value.trim()) {
      onChange([...standardSelected, value.trim()]);
    } else {
      onChange(standardSelected);
    }
  };

  const removeOption = (option: string) => {
    onChange(selected.filter((item) => item !== option));
    if (!options.includes(option)) {
      setOtherValue("");
    }
  };

  const hasOtherSelected = selected.some((item) => !options.includes(item));

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
          {label} {required && "*"}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left border rounded focus:outline-none focus:ring-2 flex items-center justify-between"
          style={{ 
            borderColor: '#D1D5DB', 
            borderRadius: '6px', 
            color: selected.length > 0 ? '#111827' : '#9CA3AF',
            backgroundColor: '#FFFFFF'
          }}
        >
          <span className="truncate">
            {selected.length === 0
              ? placeholder
              : selected.length === 1
              ? selected[0]
              : `${selected.length} selected`}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto"
              style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
            >
              {options.map((option) => (
                <label
                  key={option}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => toggleOption(option)}
                    className="h-4 w-4 border-gray-300 rounded"
                    style={{ accentColor: '#2563EB' }}
                  />
                  <span className="ml-3 text-sm" style={{ color: '#111827' }}>
                    {option}
                  </span>
                </label>
              ))}
              {allowOther && (
                <div className="border-t px-4 py-2" style={{ borderColor: '#E5E7EB' }}>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={hasOtherSelected}
                      readOnly
                      className="h-4 w-4 border-gray-300 rounded"
                      style={{ accentColor: '#2563EB' }}
                    />
                    <span className="ml-3 text-sm font-medium" style={{ color: '#111827' }}>
                      Other
                    </span>
                  </label>
                  <motion.input
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="text"
                    value={otherValue}
                    onChange={(e) => handleOtherChange(e.target.value)}
                    placeholder={otherPlaceholder}
                    className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: '#D1D5DB', 
                      borderRadius: '6px', 
                      color: '#111827' 
                    }}
                    onFocus={() => {
                      if (!hasOtherSelected) {
                        handleOtherChange(" ");
                      }
                    }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((option) => (
            <span
              key={option}
              className="inline-flex items-center px-2 py-1 rounded text-sm"
              style={{ backgroundColor: '#F3F4F6', color: '#374151' }}
            >
              {option}
              <button
                type="button"
                onClick={() => removeOption(option)}
                className="ml-2 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

