import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";

interface DateSelectionProps {
  dateSelectionType: "daily" | "monthly" | "yearly" | "custom";
  setDateSelectionType: (
    type: "daily" | "monthly" | "yearly" | "custom"
  ) => void;
  dailyDate: string;
  setDailyDate: (date: string) => void;
  monthYear: string;
  setMonthYear: (date: string) => void;
  yearlyDate: string;
  setYearlyDate: (year: string) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
  durationType: "min" | "hour" | "day" | "month";
  setDurationType: (type: "min" | "hour" | "day" | "month") => void;
}

const DateSelection: React.FC<DateSelectionProps> = ({
  dateSelectionType,
  setDateSelectionType,
  dailyDate,
  setDailyDate,
  monthYear,
  setMonthYear,
  yearlyDate,
  setYearlyDate,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  durationType,
  setDurationType,
}) => {
  const [isDateTypeDropdownOpen, setIsDateTypeDropdownOpen] = useState(false);
  const [isDurationTypeDropdownOpen, setIsDurationTypeDropdownOpen] =
    useState(false);
  const dateTypeDropdownRef = useRef<HTMLDivElement>(null);
  const dateTypeButtonRef = useRef<HTMLButtonElement>(null);
  const durationTypeDropdownRef = useRef<HTMLDivElement>(null);
  const durationTypeButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  const getAvailableDurationOptions = useCallback(() => {
    switch (dateSelectionType) {
      case "daily":
        return [
          { value: "min", label: "Every 15 min" },
          { value: "hour", label: "Every hour" },
        ];
      case "monthly":
        return [
          { value: "hour", label: "Every hour" },
          { value: "day", label: "Every day" },
        ];
      case "yearly":
        return [
          { value: "day", label: "Every day" },
          { value: "month", label: "Every month" },
        ];
      case "custom":
        return [{ value: "day", label: "Every day" }];
      default:
        return [];
    }
  }, [dateSelectionType]);

  useEffect(() => {
    const availableOptions = getAvailableDurationOptions();
    const isValidDuration = availableOptions.some(
      (opt) => opt.value === durationType
    );

    if (!isValidDuration && availableOptions.length > 0) {
      setDurationType(
        availableOptions[0].value as "min" | "hour" | "day" | "month"
      );
    }
  }, [
    dateSelectionType,
    durationType,
    getAvailableDurationOptions,
    setDurationType,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dateTypeDropdownRef.current &&
        !dateTypeDropdownRef.current.contains(event.target as Node) &&
        dateTypeButtonRef.current &&
        !dateTypeButtonRef.current.contains(event.target as Node)
      ) {
        setIsDateTypeDropdownOpen(false);
      }
    };

    if (isDateTypeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDateTypeDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        durationTypeDropdownRef.current &&
        !durationTypeDropdownRef.current.contains(event.target as Node) &&
        durationTypeButtonRef.current &&
        !durationTypeButtonRef.current.contains(event.target as Node)
      ) {
        setIsDurationTypeDropdownOpen(false);
      }
    };

    if (isDurationTypeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDurationTypeDropdownOpen]);

  return (
    <div
      className={`flex items-center flex-col sm:flex-row gap-3 w-full sm:w-auto ${
        location.pathname.includes("plant-layout") ? "flex-nowrap" : "flex-wrap"
      }`}
    >
      <div className="relative">
        <button
          ref={dateTypeButtonRef}
          type="button"
          onClick={() => setIsDateTypeDropdownOpen(!isDateTypeDropdownOpen)}
          className="w-40 px-3 py-1.5 border border-border-primary bg-primary font-roboto text-text-primary rounded-md focus:outline-none flex items-center justify-between"
        >
          <span className="capitalize">{dateSelectionType}</span>
          <ChevronDown
            className={`w-4 h-4 text-text-secondary transition-transform ${
              isDateTypeDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isDateTypeDropdownOpen && (
          <div
            ref={dateTypeDropdownRef}
            className="absolute top-full left-0 mt-1 w-40 bg-secondary border border-border-primary rounded-md shadow-lg z-21"
          >
            <button
              type="button"
              onClick={() => {
                setDateSelectionType("daily");
                setIsDateTypeDropdownOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-text-primary hover:bg-input-bg capitalize ${
                dateSelectionType === "daily" ? "bg-input-bg" : ""
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => {
                setDateSelectionType("monthly");
                setIsDateTypeDropdownOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-text-primary hover:bg-input-bg capitalize ${
                dateSelectionType === "monthly" ? "bg-input-bg" : ""
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => {
                setDateSelectionType("yearly");
                setIsDateTypeDropdownOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-text-primary hover:bg-input-bg capitalize ${
                dateSelectionType === "yearly" ? "bg-input-bg" : ""
              }`}
            >
              Yearly
            </button>
            <button
              type="button"
              onClick={() => {
                setDateSelectionType("custom");
                setIsDateTypeDropdownOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-text-primary hover:bg-input-bg capitalize ${
                dateSelectionType === "custom" ? "bg-input-bg" : ""
              }`}
            >
              Custom
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          ref={durationTypeButtonRef}
          type="button"
          onClick={() =>
            setIsDurationTypeDropdownOpen(!isDurationTypeDropdownOpen)
          }
          className="w-40 px-3 py-1.5 border border-border-primary bg-primary font-roboto text-text-primary rounded-md focus:outline-none flex items-center justify-between hover:bg-input-bg transition-colors"
        >
          <span className="font-roboto">
            {durationType === "min"
              ? "Every 15 min"
              : durationType === "hour"
              ? "Every hour"
              : durationType === "day"
              ? "Every day"
              : "Every month"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
              isDurationTypeDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isDurationTypeDropdownOpen && (
          <div
            ref={durationTypeDropdownRef}
            className="absolute top-full left-0 mt-1 w-40 bg-secondary border border-border-primary rounded-md shadow-lg z-21"
          >
            {getAvailableDurationOptions().map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setDurationType(
                    option.value as "min" | "hour" | "day" | "month"
                  );
                  setIsDurationTypeDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-text-primary hover:bg-input-bg font-roboto transition-colors ${
                  durationType === option.value ? "bg-input-bg" : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {dateSelectionType === "daily" && (
        <input
          id="dailyDate"
          type="date"
          value={dailyDate}
          onChange={(e) => setDailyDate(e.target.value)}
          className="w-40 px-3 py-1.5 border border-border-primary bg-primary font-roboto text-text-primary rounded-md focus:outline-none"
        />
      )}
      {dateSelectionType === "monthly" && (
        <input
          id="monthYear"
          type="month"
          value={monthYear}
          onChange={(e) => setMonthYear(e.target.value)}
          className="w-40 px-3 py-1.5 border border-border-primary bg-primary font-roboto text-text-primary rounded-md focus:outline-none"
        />
      )}
      {dateSelectionType === "yearly" && (
        <input
          id="yearlyDate"
          type="number"
          min="2000"
          max="2100"
          value={yearlyDate}
          onChange={(e) => setYearlyDate(e.target.value)}
          placeholder="Select Year"
          className="w-40 px-3 py-1.5 border border-border-primary bg-primary font-roboto text-text-primary rounded-md focus:outline-none"
        />
      )}
      {dateSelectionType === "custom" && (
        <div className="flex items-center flex-col sm:flex-row gap-3 w-full sm:w-auto flex-wrap">
          <input
            id="customStartDate"
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="w-40 px-3 py-1.5 border border-border-primary bg-primary font-roboto text-text-primary rounded-md focus:outline-none"
          />
          <input
            id="customEndDate"
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="w-40 px-3 py-1.5 border border-border-primary bg-primary font-roboto text-text-primary rounded-md focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};

export default DateSelection;
