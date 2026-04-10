"use client";

import { CopyVariation, Channel } from "@/lib/types";
import VariationCard from "./VariationCard";

interface Props {
  variations: CopyVariation[];
  channel: Channel;
  model: string;
  examplesUsed: number;
}

function Skeleton() {
  return (
    <div className="memo-card p-5 animate-pulse space-y-4">
      <div className="h-3 w-16 bg-[#e8e6e3] rounded" />
      <div className="space-y-2">
        <div className="h-4 bg-[#e8e6e3] rounded w-3/4" />
        <div className="h-4 bg-[#e8e6e3] rounded w-full" />
        <div className="h-4 bg-[#e8e6e3] rounded w-2/3" />
      </div>
      <div className="h-3 w-full bg-[#e8e6e3] rounded" />
    </div>
  );
}

export default function OutputPanel({ variations, channel, model, examplesUsed }: Props) {
  if (variations.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {variations.map((v, i) => (
          <VariationCard
            key={v.id}
            variation={v}
            channel={channel}
            index={i}
          />
        ))}
      </div>
      <p className="text-[10px] text-[#bbb] text-right">
        {examplesUsed} example{examplesUsed !== 1 ? "s" : ""} used &middot; {model}
      </p>
    </div>
  );
}
