"use client";
import { useState } from "react";
import { avatarUrl } from "@/lib/avatar";

/** The picture, or the first letter of the name if there isn't one. Goes inside a round element. */
export function AvatarContent({ name, path }: { name: string; path?: string | null }) {
  const [brokenPath, setBrokenPath] = useState<string | null>(null);
  if (path && path !== brokenPath) return <img src={avatarUrl(path)} alt="" onError={() => setBrokenPath(path)} />;
  return <>{name.trim().charAt(0).toUpperCase() || "·"}</>;
}

export default function Avatar({ name, path, className }: { name: string; path?: string | null; className: string }) {
  return <span className={className} aria-hidden="true"><AvatarContent name={name} path={path} /></span>;
}
