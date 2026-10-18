# Blog interaction foundations

Phase 2 added storage and identity. Public endpoints were subsequently added in
phase 3; see blog-interactions-api.md for their contract. Phase 4 adds administrative
moderation (blog-comment-moderation.md). Phase 5 adds the public React UI
(blog-interactions-ui.md). No scheduled task is introduced.

## Identity contract

- `BlogActorService::resolve(Request)` returns the active account actor, or an
  existing unexpired anonymous actor. Missing/invalid anonymous credentials return
  `null`; callers must reject interaction writes in that case.
- `initialize(Request)` explicitly provisions an identity and returns an internal
  actor plus an optional Symfony cookie. Attach that cookie to the response;
  never serialize this return value. Rate limiting and CSRF belong to the future
  initialization endpoint, which must use the Laravel `web` middleware stack.
- Laravel `EncryptCookies` encrypts and authenticates the cookie on the response
  and validates it before the service reads the request. Do not exempt this cookie
  or call the service with untrusted raw requests outside that middleware stack.
- The credential contains 256 random bits. Only SHA-256 of it is stored. The
  cookie is host-only, HttpOnly, SameSite=Lax, scoped to `/blogs`, Secure on HTTPS
  and always Secure in production and staging, including behind a TLS proxy.
  It is never placed in JSON or localStorage.
- `config/blog.php` sets a fixed 180-day lifetime. Both the browser expiration and
  server `expires_at` enforce it; ordinary reads do not renew it. Expiration may
  be followed by explicit initialization of a new actor, preserving old records.
- `revokeAnonymous()` immediately invalidates a credential without removing
  contributions. Expired/revoked actors must not be purged while referenced.
- No IP address, user agent, email or fingerprint is used as an identity.

## Login, logout and deletion

An authenticated active user always uses their unique account actor. Anonymous
contributions remain owned by their original actor: there is no automatic merge,
transfer or claim. Login leaves the anonymous cookie untouched; logout may resume
that identity until expiration. This avoids transferring shared-browser content.
An inactive authenticated account is rejected rather than treated as anonymous.

Deleting an account sets its actor's `user_id` to null while retaining `kind=user`
and no anonymous credential. The orphan actor cannot be resolved as anonymous.
Deleting a moderator nulls the audit reference and retains the decision record.
Deleting a post softly keeps its interactions; force deletion cascades through
its interactions and moderation records. Referenced actors cannot be deleted.

Uniqueness is per account or browser identity, not per human. Clearing cookies,
switching browsers, or switching between account and anonymous identity can allow
additional votes. Stronger person-level guarantees require a different policy.

## Storage and next-phase responsibilities

Unique database keys prevent duplicate likes/ratings per post and actor, and
duplicate comment submissions per actor and submission key. Submission keys and
content hashes are internal; future endpoints must derive trusted identity and
hash fields server-side. Eloquent hidden fields are defense in depth; public
responses still require explicit resources, particularly for pending comments
and moderation logs.

Ratings use a finite SQL domain of 1–5: Laravel emits a CHECK-backed string column
on SQLite and ENUM on MySQL. Eloquent exposes `rating` as an integer. MySQL must
use the existing strict connection mode; public input must also validate integer
values 1–5 before writing. Numeric aggregates can be computed explicitly from
these values. No cached counters are introduced.

The comment status defaults to pending; this phase defines storage only, not
approval transitions. Future endpoints must enforce publication visibility,
authorization, anti-spam limits, idempotent writes and moderation transactions.

Run tests with `APP_ENV=testing`, `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`,
an empty `DB_URL`, and no cached configuration. Production migrations are not
executed by this implementation. A real MySQL staging validation remains required
before deployment; SQLite tests do not prove MySQL runtime behavior.
