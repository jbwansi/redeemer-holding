# Administrative comment moderation

- GET /dashboard/post-comments (post-comments.index): Inertia page with server
  pagination (20 rows), optional status and post_id filters. Deleted articles
  remain identifiable in the queue. The Blogs navigation contains Commentaires.
- PATCH /dashboard/post-comments/{comment}/status (post-comments.status): accepts
  status, expected_version and an optional internal reason (maximum 2000 chars).
  Requires active administrator access and the standard Laravel CSRF protection.

Transitions: pending -> approved/rejected/spam; approved -> rejected/spam;
rejected/spam -> pending. All other transitions, including no-op submissions,
are rejected. Available actions are supplied by the backend transition map.

The service authorizes the acting administrator and locks the comment inside a
transaction. The latest moderation log ID serves as a revision (zero initially).
The list returns this as version; the client submits it as expected_version.
A stale revision produces a validation error under conflict (422 for JSON,
redirect with Inertia errors for the UI). The dialog disables confirmation and
offers a list reload. Returning to a previous status does not reset the revision.

Each successful change writes the previous/new statuses, actual administrator
ID, internal reason and timestamps to post_comment_moderation_logs atomically.
No decision is recorded for failed validation or a conflict. Audit write failure
rolls back the status change. Audit rows must not be edited or deleted in place:
they are the source of revisions as well as history.

UI content is rendered through React text nodes, including dialog previews.
No comment HTML is interpreted. Public resources remain allowlisted and expose
only approved comments, never internal reasons, visitor credentials or history.
The administrative UI does not provide an audit-history browser in this phase;
decisions are preserved in the database.

Tests cover all 16 state pairs, two-administrator stale writes including status
round trips, transactional rollback, real CSRF enforcement, access restrictions,
pagination/filtering, public visibility and React confirmation/XSS/conflict UX.
SQLite tests simulate stale concurrent decisions sequentially. MySQL row-lock
behavior under truly simultaneous requests still requires staging validation.
