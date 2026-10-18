# Public blog interaction UI

The detail page mounts PostInteractions after the article tags and before the
newsletter. Article content, metadata, view counting and related articles are
unchanged. The panel remounts on article/account changes so personal state and
form credentials cannot carry over to another article or account.

The existing Axios client sends JSON requests using Ziggy route names, Laravel
session/actor cookies and the XSRF-TOKEN cookie. There are no Inertia reloads or
optimistic comment inserts. The public comments endpoint alone supplies the list.

Reading counters/comments does not initialize an anonymous actor. The first
write or interaction with the comment form initializes it, with one shared
in-flight initialization promise. Its returned opaque form token remains in
memory, never localStorage. Repeated likes/ratings reuse that context. Form tokens
are renewed for a new comment or near expiry, while the server reuses the actor
cookie. A 403 never silently triggers a new identity or an automatic write retry.

Comment submission is enabled after the documented three-second anti-spam delay
(plus a small margin). Successful submissions clear the text and show the
moderation confirmation; they never add pending content to the public list.
Network failures retain the original token and text so explicit retries remain
idempotent. Validation errors appear next to the fields. Expired tokens are
renewed without silently submitting or discarding the draft. Rate-limit messages
include Retry-After when supplied; the UI does not automatically retry mutations.

Native radio inputs provide star selection, with arrow keys, Home/End, accessible
labels, focus styling and an explicit remove action. Votes use server-returned
counts and are serialized while requests are pending. Comments use text nodes,
server pagination and localized dates. Reads have cancellation/stale-response
guards; personal data is never placed in a shared client cache.

Checks: Vitest DOM interaction tests, the existing React regression tests,
Laravel interaction/moderation and blog regression tests, Vite production build
in a temporary directory, and a TypeScript diagnostic check. The repository-wide
TypeScript check still reports existing errors outside this feature; do not
interpret a successful Vite build as a clean global typecheck.
