"use client";

import { useState, useEffect, useRef } from "react";

interface DateTimeRangePickerProps {
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  required?: boolean;
}

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
}

function TimeInput({ value, onChange, onCommit, options, placeholder, required }: TimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    onCommit(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="flex">
        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          onBlur={(e) => onCommit(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full px-2 py-2 pr-7 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-center"
          required={required}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-40 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full px-3 py-1.5 text-center text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 ${
                option === value ? "bg-blue-50 dark:bg-blue-900/30 font-medium" : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DateTimeRangePicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  required = false,
}: DateTimeRangePickerProps) {
  // Parse values
  const [startDatePart, startTimePart] = startValue ? startValue.split("T") : ["", ""];
  const [parsedStartHours, parsedStartMinutes] = startTimePart ? startTimePart.split(":") : ["", ""];
  
  const [, endTimePart] = endValue ? endValue.split("T") : ["", ""];
  const [parsedEndHours, parsedEndMinutes] = endTimePart ? endTimePart.split(":") : ["", ""];

  // Local state for inputs to allow free typing
  const [startHoursInput, setStartHoursInput] = useState(parsedStartHours);
  const [startMinutesInput, setStartMinutesInput] = useState(parsedStartMinutes);
  const [endHoursInput, setEndHoursInput] = useState(parsedEndHours);
  const [endMinutesInput, setEndMinutesInput] = useState(parsedEndMinutes);

  // Sync local state with props
  useEffect(() => {
    setStartHoursInput(parsedStartHours);
    setStartMinutesInput(parsedStartMinutes);
  }, [parsedStartHours, parsedStartMinutes]);

  useEffect(() => {
    setEndHoursInput(parsedEndHours);
    setEndMinutesInput(parsedEndMinutes);
  }, [parsedEndHours, parsedEndMinutes]);

  const validateAndFormatHour = (value: string): string | null => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0 || num > 23) return null;
    return num.toString().padStart(2, "0");
  };

  const validateAndFormatMinute = (value: string): string | null => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0 || num > 59) return null;
    return num.toString().padStart(2, "0");
  };

  const handleDateChange = (newDate: string) => {
    const startTime = startTimePart || "09:00";
    const endTime = endTimePart || "10:00";
    onStartChange(`${newDate}T${startTime}`);
    onEndChange(`${newDate}T${endTime}`);
  };

  const commitStartHour = (value: string) => {
    const validated = validateAndFormatHour(value);
    if (validated !== null) {
      const date = startDatePart || new Date().toISOString().split("T")[0];
      const mins = parsedStartMinutes || "00";
      onStartChange(`${date}T${validated}:${mins}`);
    } else if (value) {
      setStartHoursInput(parsedStartHours || "09");
    }
  };

  const commitStartMinute = (value: string) => {
    const validated = validateAndFormatMinute(value);
    if (validated !== null) {
      const date = startDatePart || new Date().toISOString().split("T")[0];
      const hrs = parsedStartHours || "09";
      onStartChange(`${date}T${hrs}:${validated}`);
    } else if (value) {
      setStartMinutesInput(parsedStartMinutes || "00");
    }
  };

  const commitEndHour = (value: string) => {
    const validated = validateAndFormatHour(value);
    if (validated !== null) {
      const date = startDatePart || new Date().toISOString().split("T")[0];
      const mins = parsedEndMinutes || "00";
      onEndChange(`${date}T${validated}:${mins}`);
    } else if (value) {
      setEndHoursInput(parsedEndHours || "10");
    }
  };

  const commitEndMinute = (value: string) => {
    const validated = validateAndFormatMinute(value);
    if (validated !== null) {
      const date = startDatePart || new Date().toISOString().split("T")[0];
      const hrs = parsedEndHours || "10";
      onEndChange(`${date}T${hrs}:${validated}`);
    } else if (value) {
      setEndMinutesInput(parsedEndMinutes || "00");
    }
  };

  // Generate hours 0-23
  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  // Generate minutes in steps of 5
  const minuteOptions = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, "0")
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fecha
        </label>
        <input
          type="date"
          value={startDatePart}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          style={{ colorScheme: "light dark" }}
          required={required}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hora inicio
          </label>
          <div className="flex gap-2 items-center">
            <TimeInput
              value={startHoursInput}
              onChange={setStartHoursInput}
              onCommit={commitStartHour}
              options={hourOptions}
              placeholder="HH"
              required={required}
            />
            <span className="text-gray-500 dark:text-gray-400 font-bold">:</span>
            <TimeInput
              value={startMinutesInput}
              onChange={setStartMinutesInput}
              onCommit={commitStartMinute}
              options={minuteOptions}
              placeholder="MM"
              required={required}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hora fin
          </label>
          <div className="flex gap-2 items-center">
            <TimeInput
              value={endHoursInput}
              onChange={setEndHoursInput}
              onCommit={commitEndHour}
              options={hourOptions}
              placeholder="HH"
              required={required}
            />
            <span className="text-gray-500 dark:text-gray-400 font-bold">:</span>
            <TimeInput
              value={endMinutesInput}
              onChange={setEndMinutesInput}
              onCommit={commitEndMinute}
              options={minuteOptions}
              placeholder="MM"
              required={required}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
