import type { Command } from "./repository";
const key = (uid: string) => `growspace:firebase-drafts:v1:${uid}`;
const kinds = new Set(["profiles", "courses", "tasks", "events", "books"]);
export function readDrafts(uid: string): Command[] {
  const raw: unknown = JSON.parse(localStorage.getItem(key(uid)) || "[]");
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is Command => item && item.uid === uid && kinds.has(item.collection) && typeof item.id === "string" && typeof item.documentId === "string" && (item.data === null || typeof item.data === "object") && (item.expectedRevision === null || Number.isInteger(item.expectedRevision)));
}
export function storeDraft(command: Command) {
  const drafts = readDrafts(command.uid).filter(item => item.collection !== command.collection || item.documentId !== command.documentId);
  localStorage.setItem(key(command.uid), JSON.stringify([...drafts, command]));
}
export function removeDraft(uid: string, id: string) {
  localStorage.setItem(key(uid), JSON.stringify(readDrafts(uid).filter(item => item.id !== id)));
}
