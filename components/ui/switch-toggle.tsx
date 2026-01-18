"use client";

import { useId } from "react";

type SwitchToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  showOnOff?: boolean;
  className?: string;
};

function SwitchButton({
  checked,
  onChange,
  labelId,
  showOnOff,
}: {
  checked: boolean;
  onChange: () => void;
  labelId?: string;
  showOnOff: boolean;
}) {
  const baseClass =
    "flex items-center gap-1.5 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#6917AF] focus-visible:ring-offset-2 rounded-full transition-all";

  // Conditionally render to use literal aria values
  if (checked) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked="true"
        aria-labelledby={labelId}
        className={baseClass}
        onClick={onChange}
      >
        <div className="relative w-[40px] h-[24px] rounded-full transition-colors duration-200 flex items-center px-[2px] bg-[#6917AF]">
          <div className="w-[18px] h-[18px] rounded-full bg-white transition-transform duration-200 translate-x-[16px]" />
        </div>
        {showOnOff && (
          <span className="text-[11px] font-black text-[#172233] w-5 text-left">ON</span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked="false"
      aria-labelledby={labelId}
      className={baseClass}
      onClick={onChange}
    >
      <div className="relative w-[40px] h-[24px] rounded-full transition-colors duration-200 flex items-center px-[2px] border border-black/20 bg-[#E4E4E4]">
        <div className="w-[18px] h-[18px] rounded-full bg-white transition-transform duration-200 translate-x-0" />
      </div>
      {showOnOff && (
        <span className="text-[11px] font-black text-[#172233] w-5 text-left">OFF</span>
      )}
    </button>
  );
}

export function SwitchToggle({
  checked,
  onChange,
  label,
  showOnOff = true,
  className = "",
}: SwitchToggleProps) {
  const id = useId();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <span id={id} className="text-xs xl:text-sm text-[#707070] font-medium">
          {label}
        </span>
      )}
      <SwitchButton
        checked={checked}
        onChange={() => onChange(!checked)}
        labelId={label ? id : undefined}
        showOnOff={showOnOff}
      />
    </div>
  );
}
