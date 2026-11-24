"use client";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import Avatar from "@/components/avatar";
import { SettingsCard } from "@/components/settings-ui";
import { courses } from "@/lib/courses";
import { changeAvatar, cleanUsername, removeAvatar, skillLevels, updatePreferences, updateProfile, USERNAME_MAX, useSession, type Account, type Preferences } from "@/lib/session";

const mediumOptions = courses["Mediums"].map((course) => course.name);

// How the signed-in artist appears and what they like to make. Email, theme and notifications are in
// Settings (components/settings-view.tsx). Rendered inside RequireSession.
export default function EditProfile() {
  const account = useSession();
  return account ? <EditProfileContent account={account} /> : null;
}

function EditProfileContent({ account }: { account: Account }) {
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const setPreferences = async (changes: Partial<Preferences>) => setPreferencesError(await updatePreferences(changes));
  const toggleMedium = (medium: string) => setPreferences({
    mediums: account.preferences.mediums.includes(medium) ? account.preferences.mediums.filter((m) => m !== medium) : [...account.preferences.mediums, medium],
  });

  return <div className="settings-page">
    <header className="settings-intro">
      <Link href="/profile" className="course-back">← Back to profile</Link>
      <h1>Edit Profile</h1>
      <p>For your email, theme and notifications, go to <Link href="/settings">Settings</Link>.</p>
    </header>

    <PictureCard account={account} />

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
      <p role="alert" className="settings-status error">{preferencesError}</p>
    </SettingsCard>
  </div>;
}

function PictureCard({ account }: { account: Account }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "saved" | "error"; text: string } | null>(null);

  async function run(action: () => Promise<string | null>, done: string) {
    setBusy(true); setStatus(null);
    const error = await action();
    setStatus(error ? { kind: "error", text: error } : { kind: "saved", text: done });
    setBusy(false);
  }

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // so the same file can be picked again
    if (file) void run(() => changeAvatar(file), "Picture saved");
  }

  return <SettingsCard title="Profile picture" description="We use the middle of your picture. Anyone can see it.">
    <div className="picture-row">
      <Avatar className="profile-avatar" name={account.name} path={account.avatarPath} />
      <div className="picture-actions">
        <input ref={input} type="file" accept="image/*" onChange={choose} hidden />
        <button type="button" className="primary-btn" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Saving…" : account.avatarPath ? "Change picture" : "Upload picture"}</button>
        {account.avatarPath && <button type="button" className="secondary-btn" disabled={busy} onClick={() => run(removeAvatar, "Picture removed")}>Remove</button>}
        <span role="status" className={`settings-status ${status?.kind ?? ""}`}>{status?.text}</span>
      </div>
    </div>
  </SettingsCard>;
}

function ProfileForm({ account }: { account: Account }) {
  const [name, setName] = useState(account.name);
  const [username, setUsername] = useState(account.username);
  const [bio, setBio] = useState(account.bio);
  const [status, setStatus] = useState<{ kind: "saved" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const changed = name.trim() !== account.name || username !== account.username || bio.trim() !== account.bio;
  const usernameInput = useRef<HTMLInputElement>(null);

  // "Choose username" on the dashboard opens this page ready to type a new one.
  useEffect(() => { if (window.location.hash === "#username") usernameInput.current?.select(); }, []);

  const edit = (setter: (value: string) => void) => (value: string) => { setter(value); setStatus(null); };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const values = { name: name.trim(), username, bio: bio.trim() };
    if (!values.name) { setStatus({ kind: "error", text: "Please enter a name." }); return; }
    setBusy(true);
    const error = await updateProfile(values);
    setBusy(false);
    if (error) { setStatus({ kind: "error", text: error }); return; }
    setName(values.name); setBio(values.bio);
    setStatus({ kind: "saved", text: "Changes saved" });
  }

  return <SettingsCard title="Profile" description="How you appear around Pintora.">
    <form className="settings-form" onSubmit={submit}>
      <label>Display name<input value={name} onChange={(e) => edit(setName)(e.target.value)} maxLength={40} autoComplete="name" required /></label>
      <label>Username<input id="username" ref={usernameInput} value={username} onChange={(e) => edit(setUsername)(cleanUsername(e.target.value))} maxLength={USERNAME_MAX} autoCapitalize="none" spellCheck={false} required /></label>
      <label className="settings-form-wide"><span>Short bio <span className="settings-optional">(optional)</span></span>
        <textarea value={bio} onChange={(e) => edit(setBio)(e.target.value)} maxLength={160} rows={3} placeholder="What do you love to make?" />
        <span className="settings-count">{bio.length}/160</span>
      </label>
      <div className="settings-form-actions settings-form-wide">
        <button className="primary-btn" type="submit" disabled={!changed || busy}>{busy ? "Saving…" : "Save changes"}</button>
        <span role="status" className={`settings-status ${status?.kind ?? ""}`}>{status?.text}</span>
      </div>
    </form>
  </SettingsCard>;
}
