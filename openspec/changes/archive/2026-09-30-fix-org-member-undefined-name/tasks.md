# Tasks

## 1. Type Definitions

- [x] 1.1 Update `OrgMemberDTO` in `src/lib/api/types.ts` to make `name` optional (`name?: string`), `email` nullable (`email?: string | null`), and support both `user_id` and optional `id`, verifying with `npx tsc --noEmit`.

## 2. Organization Detail Page Member Preview

- [x] 2.1 Refactor member rendering in `src/app/(dashboard)/organizations/[id]/page.tsx` to safely resolve `displayName` and 2-character avatar initials from `m.name || m.email || m.user_id || 'Member'`, and key rows by `m.user_id || m.id`, verifying rendering passes without throwing `TypeError: Cannot read properties of undefined (reading 'slice')`.

## 3. Organization Members Management Page

- [x] 3.1 Refactor member row rendering in `src/app/(dashboard)/organizations/[id]/members/page.tsx` to safely resolve avatar initials and display names without assuming `member.name` is defined, and ensure `handleRoleChange` and removal dialog pass `member.user_id || member.id`, verifying no runtime exceptions occur when `member.name` is undefined.

## 4. Verification

- [x] 4.1 Run TypeScript typecheck (`npx tsc --noEmit`) and project test suite (`npm test` or `npx vitest run`) to verify clean builds and regression-free tests across organization routes.
