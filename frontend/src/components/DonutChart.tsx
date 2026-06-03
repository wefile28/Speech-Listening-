import React from "react";

interface DonutChartProps {
  percentage: number;
  total?: number;
  passed?: number;
  label: string;
  color: string;      // Hex color for stroke
  bgColor: string;    // Hex color for background track
  icon: string;       // Icon representation
}

export default function DonutChart({
  percentage,
  label,
  color,
  bgColor,
  icon
}: DonutChartProps) {
  // Radius of the circle
  const radius = 40;
  // Circumference of the circle
  const circumference = 2 * Math.PI * radius;
  // Offset based on percentage
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 print:p-3 bg-white/80 border border-neutral-100 rounded-3xl shadow-sm text-center relative flex-1">
      {/* Label and Icon Header */}
      <h4 className="font-extrabold text-base print:text-sm text-giraffe-brown-dark flex items-center gap-1.5 mb-4 print:mb-2">
        <span>{icon}</span>
        <span>{label}</span>
      </h4>

      {/* SVG Donut Chart */}
      <div className="relative w-36 h-36 print:w-24 print:h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Background Track Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={bgColor}
            strokeWidth="10"
          />
          {/* Active Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="animate-donut-draw"
            style={{
              "--donut-offset": strokeDashoffset,
            } as React.CSSProperties}
          />
        </svg>

        {/* Center Percentage display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl print:text-lg font-black text-giraffe-brown-dark leading-none">
            {percentage.toFixed(0)}%
          </span>
          <span className="text-[10px] print:text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-1 print:mt-0">
            score
          </span>
        </div>
      </div>

    </div>
  );
}
