interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  isOn,
  onToggle,
  label,
  disabled = false,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onToggle(!isOn);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-sm font-normal text-text-primary font-roboto">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex h-8 w-20 items-center rounded-full transition-colors duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${
            isOn
              ? "bg-status-success focus:ring-status-success"
              : "bg-status-danger focus:ring-status-danger"
          }
        `}
        role="switch"
        aria-checked={isOn}
        aria-label={label || "Toggle switch"}
      >
        <span
          className={`
            inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ease-in-out
            ${isOn ? "translate-x-14" : "translate-x-1"}
          `}
        />
        <span
          className={`
            absolute inset-0 flex items-center justify-center text-xs font-semibold text-white transition-opacity duration-300
            ${isOn ? "opacity-100" : "opacity-0"}
          `}
        >
          ON
        </span>
        <span
          className={`
            absolute inset-0 flex items-center justify-center text-xs font-semibold text-white transition-opacity duration-300
            ${isOn ? "opacity-0" : "opacity-100"}
          `}
        >
          OFF
        </span>
      </button>
    </div>
  );
};

export default ToggleSwitch;
