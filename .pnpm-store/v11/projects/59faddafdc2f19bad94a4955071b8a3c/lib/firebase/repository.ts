import { collection, doc, getDocsFromServer, runTransaction, type Firestore } from "firebase/firestore";
import type { Book, ClassEvent, Course, Profile, Task } from "../../features/dashboard/types";

export type CollectionName = "profiles" | "courses" | "tasks" | "events" | "books";
export type Command = { id: string; uid: string; collection: CollectionName; documentId: string; data: Record<string, unknown> | null; expectedRevision: number | null };
export type Revisioned = { revision?: number };
export function recordRef(db: Firestore, uid: string, kind: CollectionName, id: string) {
  return kind === "profiles" ? doc(db, "users", uid) : doc(db, "users", uid, kind, id);
}
export async function executeCommand(db: Firestore, command: Command) {
  const ref = recordRef(db, command.uid, command.collection, command.documentId);
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists() && snapshot.data().lastMutationId === command.id) return;
    if (!snapshot.exists() && command.data === null) return;
    const revision = snapshot.exists() ? snapshot.data().revision : null;
    if (revision !== command.expectedRevision) throw new Error("draft-conflict");
    if (command.data === null) transaction.delete(ref);
    else transaction.set(ref, { ...command.data, revision: (revision ?? 0) + 1, lastMutationId: command.id });
  });
}
export async function loadAccount(db: Firestore, uid: string, name: string) {
  const profile = await runTransaction(db, async transaction => {
    const ref = doc(db, "users", uid);
    const snapshot = await transaction.get(ref);
    if (snapshot.exists()) return snapshot.data() as Profile & Revisioned;
    const value = { name: name.trim().slice(0, 100) || "طالب GrowSpace", weeklyGoal: 5, revision: 1, lastMutationId: crypto.randomUUID() };
    transaction.set(ref, value);
    return value;
  });
  const [courses, tasks, events, books] = await Promise.all(
    (["courses", "tasks", "events", "books"] as const).map(async kind => {
      const result = await getDocsFromServer(collection(db, "users", uid, kind));
      return result.docs.map(item => ({ ...item.data(), id: item.id }));
    }),
  );
  const names = new Map((courses as Course[]).map(course => [course.id, course.name]));
  const withCourseName = (rows: typeof tasks) => rows.map(row => ({ ...row, course: names.get((row as unknown as { courseId: string }).courseId) || "" }));
  return { profile, courses: courses as Course[], tasks: withCourseName(tasks) as Task[], events: withCourseName(events) as ClassEvent[], books: books as Book[] };
}
