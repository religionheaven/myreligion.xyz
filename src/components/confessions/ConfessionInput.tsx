import React from "react";

interface ConfessionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ConfessionInput({ value, onChange, onSubmit, isSubmitting }: ConfessionInputProps) {
  return (
    <div className="border-t border-white/20 p-3 md:p-6 bg-black/20 backdrop-blur-sm">
      <div className="flex gap-2 md:gap-3">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (value.trim() && !isSubmitting) {
                onSubmit();
              }
            }
          }}
          placeholder="Write your confession anonymously... (No links or contact info)"
          maxLength={500}
          className="flex-1 p-3 md:p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-300 text-white placeholder-white/60 hover:bg-white/15 resize-none min-h-[80px] md:min-h-[100px] max-h-[100px] md:max-h-[120px] confession-textarea text-sm"
          style={{ fontFamily: "Poiret One, sans-serif" }}
          disabled={isSubmitting}
        />
        <button
          onClick={onSubmit}
          disabled={!value.trim() || isSubmitting}
          className="px-4 md:px-6 py-3 md:py-4 bg-white/80 backdrop-blur-sm text-black rounded-xl md:rounded-2xl hover:bg-white/90 transition-all duration-300 hover:scale-105 border border-white/20 self-end text-sm"
          style={{ fontFamily: "Poiret One, sans-serif" }}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
      <div className="mt-1 md:mt-2 flex flex-col md:flex-row justify-between text-white/40 text-xs gap-1 md:gap-0">
        <p style={{ fontFamily: "Poiret One, sans-serif" }}>
          <span className="hidden md:inline">
            Anonymous posting • Max 2 confessions per user • NO CONTACT INFO ALLOWED • Press Enter
            to submit
          </span>
          <span className="md:hidden">Anonymous • Max 2 per user • Enter to submit</span>
        </p>
        <p className="md:self-end">{value.length}/500</p>
      </div>
    </div>
  );
}
