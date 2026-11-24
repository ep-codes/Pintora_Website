import { clearIds, toggleId, useUserData } from "@/lib/user-data";

// Bookmarked lesson ids (the Bookmarks page). Saved artworks are in lib/community.ts.

/** `undefined` until loaded. */
export const useSavedLessons = () => useUserData((data) => data.bookmarks);
export const toggleSavedLesson = (id: string) => toggleId("bookmarks", id);
export const clearSavedLessons = () => clearIds("bookmarks");
