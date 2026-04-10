"use client";

import { Channel } from "@/lib/types";
import SocialForm from "./SocialForm";
import EDMForm from "./EDMForm";
import PDPForm from "./PDPForm";

interface Props {
  channel: Channel;
  onSubmit: (brief: Record<string, string | boolean>, productId: string, productIds?: string[]) => void;
  loading: boolean;
}

export default function BriefForm({ channel, onSubmit, loading }: Props) {
  switch (channel) {
    case "social": return <SocialForm onSubmit={onSubmit} loading={loading} />;
    case "edm":    return <EDMForm onSubmit={onSubmit} loading={loading} />;
    case "pdp":    return <PDPForm onSubmit={onSubmit} loading={loading} />;
  }
}
