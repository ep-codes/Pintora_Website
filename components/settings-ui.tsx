"use client";
import { useId, useState, type ReactNode } from "react";

// Building blocks shared by the Settings and Edit Profile pages.

/** A large titled section with its settings in one card underneath. */
export function SettingsSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const headingId = useId();
  return <section className="settings-section" aria-labelledby={headingId}>
    <h2 id={headingId}>{title}</h2>
    {description && <p>{description}</p>}
    <div className="settings-card">{children}</div>
  </section>;
}

export function SettingsCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const headingId = useId();
  return <section className="settings-card" aria-labelledby={headingId}>
    <div className="settings-card-head"><h2 id={headingId}>{title}</h2>{description && <p>{description}</p>}</div>
    {children}
  </section>;
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="settings-row">
    <span className="settings-text"><strong>{label}</strong><span>{hint}</span></span>
    <input type="checkbox" role="switch" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
  </label>;
}

type ConfirmActionProps = { label: string; description: string; action: string; confirmLabel: string; onConfirm: () => void; danger?: boolean; disabled?: boolean };

/** A destructive action that asks for a second click before running. */
export function ConfirmAction({ label, description, action, confirmLabel, onConfirm, danger = false, disabled = false }: ConfirmActionProps) {
  const [confirming, setConfirming] = useState(false);
  return <div className="settings-row">
    <span className="settings-text"><strong>{label}</strong><span>{description}</span></span>
    {confirming
      ? <span className="confirm-actions">
        <button type="button" className="secondary-btn" onClick={() => setConfirming(false)}>Cancel</button>
        <button type="button" className={danger ? "danger-btn" : "primary-btn"} onClick={() => { onConfirm(); setConfirming(false); }}>{confirmLabel}</button>
      </span>
      : <button type="button" className={danger ? "danger-outline-btn" : "secondary-btn"} disabled={disabled} onClick={() => setConfirming(true)}>{action}</button>}
  </div>;
}
