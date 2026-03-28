"use client";

import { useState } from "react";

type HeroClarityPickerProps = {
  label: string;
  question: string;
  choices: string[];
  stats: { value: string; label: string }[];
};

export function HeroClarityPicker({
  label,
  question,
  choices,
  stats,
}: HeroClarityPickerProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="rounded-[14px] border border-[#2e5430] bg-[#132115] p-7">
      <p className="text-[0.625rem] font-medium uppercase tracking-[0.1em] text-[#7ec87e]">
        {label}
      </p>
      <p className="mt-1.5 text-[1.06rem] font-medium leading-[1.4] text-[#f0f7f0]">
        {question}
      </p>

      <div className="mt-5 space-y-2">
        {choices.map((choice, i) => (
          <button
            key={choice}
            type="button"
            onClick={() => setActive(i)}
            className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left text-[0.81rem] leading-[1.4] text-[#c4d8c5] transition-colors ${
              i === active
                ? "border-[#7ec87e] bg-[#1d3a20]"
                : "border-[#2e5430] hover:bg-[#1d3a20]"
            }`}
          >
            <span
              className={`h-2 w-2 flex-shrink-0 rounded-full transition-colors ${
                i === active
                  ? "bg-[#7ec87e]"
                  : "border-[1.5px] border-[#4a7a4a] bg-transparent"
              }`}
            />
            {choice}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-[#0e1c10] px-4 py-3.5">
            <div className="font-[family:var(--font-serif)] text-2xl font-semibold leading-none text-[#f0f7f0]">
              {stat.value}
            </div>
            <div className="mt-1 text-[0.69rem] text-[#8fa891]">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
