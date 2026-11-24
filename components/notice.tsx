"use client";
import { useEffect, useRef } from "react";
import { useNotice } from "@/lib/notice";

export default function Notice() {
  const message = useNotice();
  const element = useRef<HTMLDivElement>(null);

  // A popover sits above everything, including the artwork and lesson dialogs.
  useEffect(() => {
    if (!message) return;
    const popover = element.current;
    popover?.showPopover?.();
    return () => popover?.hidePopover?.();
  }, [message]);

  return <div className="notice" role="status" popover="manual" ref={element}>{message}</div>;
}
