# Blog public interactions API

All endpoints use Laravel web sessions, encrypted cookies and CSRF protection.
Send Accept: application/json and same-origin credentials. Mutations require the
standard Laravel CSRF header; no route is exempted. No actor ID is accepted from
the client. All operations require an existing published, non-deleted article.

| Method | Path under /blogs/{slug} | Result |
| --- | --- | --- |
| POST | /interaction-session | 200, initializes identity if needed; returns comment_form_token |
| GET | /interactions | 200, aggregate and personal state |
| PUT | /like | 200, idempotent like and refreshed state |
| DELETE | /like | 200, idempotent removal and refreshed state |
| PUT | /rating | 200, integer rating 1–5 and refreshed state |
| DELETE | /rating | 200, idempotent removal and refreshed state |
| GET | /comments?page=1 | 200, approved comments, 10 per page |
| POST | /comments | 202, generic receipt; never publishes directly |

Summary fields: likes_count, liked, ratings_count, rating_average (null when empty,
otherwise rounded to two decimals), my_rating (null when absent), comments_count
(approved only). Reads without an anonymous identity return neutral personal
state and do not create an anonymous actor. Anonymous mutations without a valid
identity return 403. Account actors use the phase-2 service and reject inactive
accounts. Logging in never claims or merges anonymous contributions.

Initialization returns an opaque encrypted form token bound to actor and article,
valid for one hour and usable after three seconds. It is not an actor identifier
or a substitute for CSRF. Obtain a new token for each new comment. Send:

    {"comment_form_token":"...","display_name":"Nom","body":"Texte","website":""}

display_name is required for all visitors (plain text, 80 characters maximum).
It is the chosen public display name, not proof of identity. The authenticated
user or anonymous cookie still determines the actor exclusively on the server.
body is required, plain
text, at most 3000 characters. HTML is rejected, never rendered. website is a
honeypot and must be empty/omitted. More than two URL prefixes is rejected.
Stored status is always pending regardless of client input.

Repeating the same token with the same normalized content returns the same generic
202 without another row. Reusing it with different content returns 422. Equivalent
content with a fresh token for the same actor/article within ten minutes returns
422. Locks and database unique keys protect concurrent submissions. Neither a
submission response nor the public listing reveals pending/rejected/spam records,
actor IDs, hashes, submission keys or internal moderation fields.

Comments expose only id, display_name, body, created_at. Pagination metadata has
current_page, last_page, per_page and total; order is newest first, with ID as a
stable tie breaker. Only page is configurable (1–10000); client status/per_page
parameters cannot expand visibility or page size.

Limits in config/blog.php: 120 requests/minute/IP for these routes, 10 initializations
/minute/IP, 30 writes/minute/actor, 3 comment attempts/10 minutes/actor and 10/day.
Actor limits apply across articles; failures and retries consume quota. IP is only
a secondary network safeguard, never identity. 429 includes Retry-After. Use a
shared Laravel cache store across production workers for effective limiting.

Other errors: 403 missing identity/inactive account, 404 unavailable article,
419 CSRF, 422 validation. Responses passing through the blog context middleware
are private/no-store, including validation failures; no personalized shared cache
is used. The existing article detail controller and view counting are untouched.

Cookie deletion and multiple browsers/accounts remain ways to obtain distinct
identities; this does not guarantee one vote per human. Honeypots and time delays
are friction, not bot-proof verification. No CAPTCHA or dependency was added.
Concurrency and ENUM aggregation should be validated on real MySQL staging before
production deployment; automated tests here run on isolated SQLite memory.
