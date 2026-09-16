# Firebase migration checkpoint — 2026-09-09

The web code now uses Firebase Authentication and Cloud Firestore instead of Supabase. This is an implementation checkpoint, **not confirmation of production readiness**.

## Implemented locally

- Email/password and Google sign-in, email verification and password reset.
- Per-user profiles, courses, tasks, weekly events and books in Firestore, with ownership and input validation rules.
- Server-confirmed writes, revision conflict detection and per-account local drafts. The read-only preview remains separate from account storage.
- Firebase configuration, emulator tests and static hosting configuration. No uploads, AI, analytics or push notifications are enabled.
- Removed the Supabase web dependency, client modules and local schema from the working tree. Git history retains previous versions. No remote Supabase records or project have been deleted.

## Required before production rollout

1. Authorize Firebase CLI access to `growspace-c516a`. Access was not available at this checkpoint.
2. Verify email/password and Google providers, authorized domains and email action links against the real project.
3. Confirm or create the `(default)` Firestore database, choosing its region explicitly, then deploy the checked-in rules and indexes. Their deployment has not been verified.
4. Run real account registration, email verification, Google sign-in/cancellation, password reset, save/reload and cross-account access checks on a staging deployment.
5. Decide whether existing Supabase accounts/data should be migrated or whether users will start fresh. The old source must remain available until that decision and validation are complete. Existing Supabase sessions do not become Firebase sessions automatically.
6. Update and visually review the Word/PDF SRS. The current v0.10 deliverables still describe Supabase and are not the Firebase implementation reference.
7. After these checks, set GitHub repository variable `FIREBASE_MIGRATION_READY=true` and run the Pages workflow to publish. CI continues building on pushes, but the deploy job is gated to preserve the current public site until Firebase is ready. Firebase Hosting is an alternative; do not publish both unintentionally.

## Remaining product gaps

Deleting a linked course currently requires manually removing its links first. The proposed unlink-or-delete-all choice, dated exams and detailed weekly achievement rules remain outstanding. These are not claimed as completed by the provider migration.

## Validation

Ten automated emulator tests passed during migration development, covering ownership, unverified/anonymous access, field validation, revision conflicts, retry idempotency and account-separated drafts. These tests use `demo-growspace`, not production. Browser and live-provider verification are separate requirements; local test success does not confirm remote setup.
