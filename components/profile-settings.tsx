"use client";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { courses } from "@/lib/courses";
import { lessons } from "@/lib/lessons";
import { clearProgress, useProgress } from "@/lib/progress";
import { clearSavedLessons, useSavedLessons } from "@/lib/saved";
import { deleteAccount, signOut, skillLevels, updateAccount, useSession, type Account, type Preferences } from "@/lib/session";

const mediumOptions = courses["Based on Medium"].map((course) => course.name);

// Profile and settings for the signed-in account. Rendered inside RequireSession.
export default function ProfileSettings() {
  const account = useSession();
  return account ? <ProfileContent account={account} /> : null;
}

function ProfileContent({ account }: { account: Account }) {
  const progress = useProgress() ?? {};
  const saved = useSavedLessons() ?? [];
  const finished = lessons.filter((l) => progress[l.id]?.completed).length;
  const started = lessons.filter((l) => progress[l.id]).length;
  const memberSince = account.joinedAt ? new Date(account.joinedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : null;
  const setPreferences = (changes: Partial<Preferences>) => updateAccount({ preferences: { ...account.preferences, ...changes } });
  const toggleMedium = (medium: string) => setPreferences({
    mediums: account.preferences.mediums.includes(medium) ? account.preferences.mediums.filter((m) => m !== medium) : [...account.preferences.mediums, medium],
  });

  return <div className="profile-page">
    <section className="profile-hero" aria-label="Your profile">
      <div className="profile-avatar" aria-hidden="true">{account.name.trim().charAt(0).toUpperCase() || "·"}</div>
      <div className="profile-identity">
        <h1>{account.name}</h1>
        <p>{account.email}{memberSince && <> · Member since {memberSince}</>}</p>
        {account.bio && <p className="profile-bio">{account.bio}</p>}
      </div>
      <dl className="profile-stats">
        <div><dt>Finished</dt><dd>{finished}</dd></div>
        <div><dt>Started</dt><dd>{started}</dd></div>
        <div><dt>Saved</dt><dd>{saved.length}</dd></div>
      </dl>
    </section>

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

    <SettingsCard title="Notifications" description="Email isn't connected yet. Your choices are saved for when it is.">
      <Toggle label="Weekly inspiration" hint="A few new lessons and community favorites, once a week." checked={account.preferences.weeklyDigest} onChange={(weeklyDigest) => setPreferences({ weeklyDigest })} />
      <Toggle label="Replies to my discussions" hint="Know when someone answers your question or post." checked={account.preferences.replyEmails} onChange={(replyEmails) => setPreferences({ replyEmails })} />
    </SettingsCard>

    <SettingsCard title="Your data" description="Lesson progress and saved lessons are stored in this browser.">
      <ConfirmAction label="Reset learning progress" description="Clears your finished and in-progress lessons." action="Reset" confirmLabel="Yes, reset progress" disabled={started === 0} onConfirm={clearProgress} />
      <ConfirmAction label="Clear saved lessons" description="Removes every lesson from your Saved list." action="Clear" confirmLabel="Yes, clear saved" disabled={saved.length === 0} onConfirm={clearSavedLessons} />
    </SettingsCard>

    <SettingsCard title="Account">
      <div className="settings-row"><span className="settings-text"><strong>Password</strong><span>Password changes will be available once real accounts are connected.</span></span></div>
      <div className="settings-row"><span className="settings-text"><strong>Log out</strong><span>Log back in any time with the same email.</span></span><button type="button" className="secondary-btn" onClick={signOut}>Log out</button></div>
      <ConfirmAction danger label="Delete account" description="Removes your profile, progress and saved lessons from this browser. This can't be undone." action="Delete account" confirmLabel="Yes, delete my account" onConfirm={() => { clearProgress(); clearSavedLessons(); deleteAccount(); }} />
    </SettingsCard>
  </div>;
}

function ProfileForm({ account }: { account: Account }) {
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email);
  const [bio, setBio] = useState(account.bio);
  const [status, setStatus] = useState<{ kind: "saved" | "error"; text: string } | null>(null);
  const changed = name.trim() !== account.name || email.trim() !== account.email || bio.trim() !== account.bio;
  const edit = (setter: (value: string) => void) => (value: string) => { setter(value); setStatus(null); };

  function submit(event: FormEvent) {
    event.preventDefault();
    const values = { name: name.trim(), email: email.trim(), bio: bio.trim() };
    const error = updateAccount(values);
    if (error) { setStatus({ kind: "error", text: error }); return; }
    setName(values.name); setEmail(values.email); setBio(values.bio);
    setStatus({ kind: "saved", text: "Changes saved" });
  }

  return <SettingsCard title="Profile" description="How you appear around Pintora.">
    <form className="settings-form" onSubmit={submit}>
      <label>Display name<input value={name} onChange={(e) => edit(setName)(e.target.value)} maxLength={40} autoComplete="name" required /></label>
      <label>Email<input type="email" value={email} onChange={(e) => edit(setEmail)(e.target.value)} autoComplete="email" required /></label>
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

function SettingsCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const headingId = useId();
  return <section className="settings-card" aria-labelledby={headingId}>
    <div className="settings-card-head"><h2 id={headingId}>{title}</h2>{description && <p>{description}</p>}</div>
    {children}
  </section>;
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="settings-row">
    <span className="settings-text"><strong>{label}</strong><span>{hint}</span></span>
    <input type="checkbox" role="switch" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
  </label>;
}

type ConfirmActionProps = { label: string; description: string; action: string; confirmLabel: string; onConfirm: () => void; danger?: boolean; disabled?: boolean };

/** A destructive action that asks for a second click before running. */
function ConfirmAction({ label, description, action, confirmLabel, onConfirm, danger = false, disabled = false }: ConfirmActionProps) {
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
