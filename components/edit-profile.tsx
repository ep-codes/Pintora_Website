"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { SettingsCard } from "@/components/settings-ui";
import { courses } from "@/lib/courses";
import { cleanUsername, skillLevels, updateAccount, USERNAME_MAX, useSession, type Account, type Preferences } from "@/lib/session";

const mediumOptions = courses["Based on Medium"].map((course) => course.name);

// How the signed-in artist appears and what they like to make. Email, theme and notifications are in
// Settings (components/settings-view.tsx). Rendered inside RequireSession.
export default function EditProfile() {
  const account = useSession();
  return account ? <EditProfileContent account={account} /> : null;
}

function EditProfileContent({ account }: { account: Account }) {
  const setPreferences = (changes: Partial<Preferences>) => updateAccount({ preferences: { ...account.preferences, ...changes } });
  const toggleMedium = (medium: string) => setPreferences({
    mediums: account.preferences.mediums.includes(medium) ? account.preferences.mediums.filter((m) => m !== medium) : [...account.preferences.mediums, medium],
  });

  return <div className="settings-page">
    <header className="settings-intro">
      <Link href="/profile" className="course-back">← Back to profile</Link>
      <h1>Edit Profile</h1>
      <p>For your email, theme and notifications, go to <Link href="/settings">Settings</Link>.</p>
    </header>

    {/* key resets the form if another tab switches accounts */}
    <ProfileForm account={account} key={account.id} />

    <SettingsCard title="Learning preferences" description="Tell us what you enjoy so we can point you to the right lessons. Changes save automatically.">
      <fieldset className="settings-fieldset">
        <legend>Favorite mediums</legend>
        <div className="chip-group">
          {mediumOptions.map((medium) => {
            const selected = account.preferences.mediums.includes(medium);
            return <button type="button" key={medium} className={selected ? "chip selected" : "chip"} aria-pressed={selected} onClick={() => toggleMedium(medium)}>{medium}</button>;
          })}
        </div>
      </fieldset>
      <fieldset className="settings-fieldset">
        <legend>Your level</legend>
        <div className="segmented">
          {skillLevels.map((level) => <label key={level} className={account.preferences.level === level ? "selected" : ""}>
            <input type="radio" name="skill-level" value={level} checked={account.preferences.level === level} onChange={() => setPreferences({ level })} />{level}
          </label>)}
        </div>
      </fieldset>
    </SettingsCard>
  </div>;
}

function ProfileForm({ account }: { account: Account }) {
  const [name, setName] = useState(account.name);
  const [username, setUsername] = useState(account.username);
  const [bio, setBio] = useState(account.bio);
  const [status, setStatus] = useState<{ kind: "saved" | "error"; text: string } | null>(null);
  const changed = name.trim() !== account.name || username !== account.username || bio.trim() !== account.bio;
  const edit = (setter: (value: string) => void) => (value: string) => { setter(value); setStatus(null); };

  function submit(event: FormEvent) {
    event.preventDefault();
    const values = { name: name.trim(), username, bio: bio.trim() };
    const error = updateAccount(values);
    if (error) { setStatus({ kind: "error", text: error }); return; }
    setName(values.name); setBio(values.bio);
    setStatus({ kind: "saved", text: "Changes saved" });
  }

  return <SettingsCard title="Profile" description="How you appear around Pintora.">
    <form className="settings-form" onSubmit={submit}>
      <label>Display name<input value={name} onChange={(e) => edit(setName)(e.target.value)} maxLength={40} autoComplete="name" required /></label>
      <label>Username<input value={username} onChange={(e) => edit(setUsername)(cleanUsername(e.target.value))} maxLength={USERNAME_MAX} autoCapitalize="none" spellCheck={false} required /></label>
      <label className="settings-form-wide"><span>Short bio <span className="settings-optional">(optional)</span></span>
        <textarea value={bio} onChange={(e) => edit(setBio)(e.target.value)} maxLength={160} rows={3} placeholder="What do you love to make?" />
        <span className="settings-count">{bio.length}/160</span>
      </label>
      <div className="settings-form-actions settings-form-wide">
        <button className="primary-btn" type="submit" disabled={!changed}>Save changes</button>
        <span role="status" className={`settings-status ${status?.kind ?? ""}`}>{status?.text}</span>
      </div>
    </form>
  </SettingsCard>;
}
