import React from "react";

interface DonutChartProps {
  percentage: number;
  total: number;
  passed: number;
  label: string;
  color: string;      // Hex color for stroke
  bgColor: string;    // Hex color for background track
  icon: string;       // Icon representation
}

export default function DonutChart({
  percentage,
  total,
  passed,
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
    <div className="flex flex-col items-center justify-center p-6 bg-white/80 border border-neutral-100 rounded-3xl shadow-sm text-center relative flex-1">
      {/* Label and Icon Header */}
      <h4 className="font-extrabold text-sm text-giraffe-brown-dark flex items-center gap-1.5 mb-4">
        <span>{icon}</span>
        <span>{label}</span>
      </h4>

      {/* SVG Donut Chart */}
      <div className="relative w-36 h-36">
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
              ["--donut-offset" as any]: strokeDashoffset,
            }}
          />
        </svg>

        {/* Center Percentage display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-giraffe-brown-dark leading-none">
            {percentage.toFixed(0)}%
          </span>
          <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider mt-1">
            score
          </span>
        </div>
      </div>

      {/* Score Summary Fraction */}
      <div className="text-xs text-neutral-400 font-medium mt-4">
        {passed} / {total} questions
      </div>
    </div>
  );
}
