import { Play, Music, Radio, FileText, Link2 } from "lucide-react";
import type React from "react";

export interface ContentTypeConfig {
  icon: React.ElementType;
  cta: string;
}

export const GATED_CONTENT_TYPES: Record<string, ContentTypeConfig> = {
  VIDEO:    { icon: Play,     cta: "Watch now" },
  AUDIO:    { icon: Music,    cta: "Listen now" },
  STREAM:   { icon: Radio,    cta: "Watch live" },
  DOCUMENT: { icon: FileText, cta: "Open document" },
  LINK:     { icon: Link2,    cta: "Access content" },
};

export const GATED_CONTENT_TYPE_FALLBACK = GATED_CONTENT_TYPES.LINK;
