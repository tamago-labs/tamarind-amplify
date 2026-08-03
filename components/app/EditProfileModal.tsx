"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { X } from "lucide-react";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface ProfileValues {
  displayName: string;
}

export default function EditProfileModal({
  isOpen,
  userId,
  initialValues,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  userId: string;
  initialValues: ProfileValues;
  onClose: () => void;
  onSaved: (values: ProfileValues) => void;
}) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues);
      setError("");
    }
  }, [isOpen, initialValues]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!values.displayName.trim()) {
      setError("Enter a display name.");
      return;
    }
    setSaving(true);
    setError("");
    const { data: existingProfile } = await client.models.UserProfile.get({ id: userId });
    const result = existingProfile
      ? await client.models.UserProfile.update({ id: userId, displayName: values.displayName.trim() })
      : await client.models.UserProfile.create({ id: userId, userId, displayName: values.displayName.trim() });
    if (result.errors?.length) {
      setError("Could not save your profile. Please try again.");
      setSaving(false);
      return;
    }
    onSaved({ displayName: values.displayName.trim() });
    setSaving(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
      <div className="w-full max-w-md rounded-2xl border border-hair bg-panel shadow-xl">
        <div className="flex items-center justify-between border-b border-hair px-6 py-4">
          <h2 id="edit-profile-title" className="text-lg font-semibold text-ink">Edit profile</h2>
          <button onClick={onClose} className="p-1 text-sub hover:text-ink" aria-label="Close dialog"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label htmlFor="profile-display-name" className="mb-2 block text-sm font-medium text-ink">Display name</label>
            <input id="profile-display-name" value={values.displayName} onChange={(event) => setValues({ ...values, displayName: event.target.value })} className="w-full rounded-lg border border-hair bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-indigo" placeholder="Your name" autoFocus />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-3 pt-1"><button type="button" onClick={onClose} className="rounded-lg border border-hair px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-indigo px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50">{saving ? "Saving..." : "Save profile"}</button></div>
        </form>
      </div>
    </div>
  );
}
