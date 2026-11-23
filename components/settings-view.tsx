"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ConfirmAction, SettingsSection, Toggle } from "@/components/settings-ui";
import { clearCommunityActivity } from "@/lib/community";
import { lessons } from "@/lib/lessons";
import { clearProgress, useProgress } from "@/lib/progress";
import { clearSavedLessons, useSavedLessons } from "@/lib/saved";
import { deleteAccount, signOut, updateAccount, useSession, type Account, type Preferences } from "@/lib/session";
import { setAccent, setThemePreference, useAccent, useThemePreference, type Accent, type ThemePreference } from "@/lib/theme";
import { accents } from "@/lib/theme-script";

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Match my device" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const accentLabels: Record<Accent, string> = { purple: "Purple", orange: "Orange", pink: "Pink", blue: "Blue", green: "Green", grey: "Grey" };

// Account, appearance and notification settings. Rendered inside RequireSession.
export default function SettingsView() {
  const account = useSession();
  return account ? <SettingsContent account={account} /> : null;
}

function SettingsContent({ account }: { account: Account }) {
  const progress = useProgress() ?? {};
  const saved = useSavedLessons() ?? [];
  const started = lessons.filter((l) => progress[l.id]).length;
  const setPreferences = (changes: Partial<Preferences>) => updateAccount({ preferences: { ...account.preferences, ...changes } });

  return <div className="settings-page">
    <h1 className="profile-title">Settings</h1>

    <div className="settings-identity">
      <div className="profile-avatar" aria-hidden="true">{account.name.trim().charAt(0).toUpperCase() || "·"}</div>
      <div className="profile-identity"><strong>{account.name}</strong><p>@{account.username}</p></div>
      <Link className="profile-btn" href="/profile/edit">Edit Profile</Link>
    </div>

    <SettingsSection title="Account Settings">
      {/* key resets the form if another tab switches accounts */}
      <EmailForm account={account} key={account.id} />
      <div className="settings-row"><span className="settings-text"><strong>Password</strong><span>Password changes will be available once real accounts are connected.</span></span></div>
      <ConfirmAction label="Reset learning progress" description="Clears your finished and in-progress lessons from this browser." action="Reset" confirmLabel="Yes, reset progress" disabled={started === 0} onConfirm={clearProgress} />
      <ConfirmAction label="Clear bookmarks" description="Removes every lesson from your Bookmarks in this browser." action="Clear" confirmLabel="Yes, clear bookmarks" disabled={saved.length === 0} onConfirm={clearSavedLessons} />
      <div className="settings-row"><span className="settings-text"><strong>Log out</strong><span>Log back in any time with the same email.</span></span><button type="button" className="secondary-btn" onClick={signOut}>Log out</button></div>
      <ConfirmAction danger label="Delete account" description="Removes your profile, comments, progress, bookmarks and saved artworks from this browser. This can't be undone." action="Delete account" confirmLabel="Yes, delete my account" onConfirm={() => { clearProgress(); clearSavedLessons(); clearCommunityActivity(account.id); deleteAccount(); }} />
    </SettingsSection>

    <AppearanceSettings />

    <SettingsSection title="Notifications" description="Email isn't connected yet. Your choices are saved for when it is.">
      <Toggle label="Weekly inspiration" hint="A few new lessons and community favorites, once a week." checked={account.preferences.weeklyDigest} onChange={(weeklyDigest) => setPreferences({ weeklyDigest })} />
      <Toggle label="Replies to my discussions" hint="Know when someone answers your question or post." checked={account.preferences.replyEmails} onChange={(replyEmails) => setPreferences({ replyEmails })} />
    </SettingsSection>
  </div>;
}

function EmailForm({ account }: { account: Account }) {
  const [email, setEmail] = useState(account.email);
  const [status, setStatus] = useState<{ kind: "saved" | "error"; text: string } | null>(null);
  const changed = email.trim() !== account.email;

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = email.trim();
    const error = updateAccount({ email: value });
    if (error) { setStatus({ kind: "error", text: error }); return; }
    setEmail(value);
    setStatus({ kind: "saved", text: "Email saved" });
  }

  return <form className="settings-form settings-email" onSubmit={submit}>
    <label>Email<input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setStatus(null); }} autoComplete="email" required /></label>
    <div className="settings-form-actions"><button className="primary-btn" type="submit" disabled={!changed}>Save email</button></div>
    <span role="status" className={`settings-status settings-form-wide ${status?.kind ?? ""}`}>{status?.text}</span>
  </form>;
}

function AppearanceSettings() {
  const preference = useThemePreference();
  const accent = useAccent();
  return <SettingsSection title="Appearance & Display" description="Choose how Pintora looks on this device. You can also switch with the sun and moon button at the top.">
    <fieldset className="settings-fieldset">
      <legend>Theme</legend>
      <div className="segmented">
        {themeOptions.map(({ value, label }) => <label key={value} className={preference === value ? "selected" : ""}>
          <input type="radio" name="theme" value={value} checked={preference === value} onChange={() => setThemePreference(value)} />{label}
        </label>)}
      </div>
    </fieldset>
    <fieldset className="settings-fieldset">
      <legend>Accent color</legend>
      <p className="settings-hint">Used for buttons, links and highlights across the site.</p>
      <div className="accent-options">
        {accents.map((value) => <label key={value} className={`accent-option${accent === value ? " selected" : ""}`}>
          <input type="radio" name="accent" value={value} checked={accent === value} onChange={() => setAccent(value)} />
          {/* data-accent gives the swatch that accent's colors, whatever the page's current accent is. */}
          <span className="accent-swatch" data-accent={value} aria-hidden="true" />{accentLabels[value]}
        </label>)}
      </div>
    </fieldset>
  </SettingsSection>;
}
