# RFCs

An RFC ("request for comments") is a short design document for a change big enough that it should be agreed
before it's built. It keeps decisions on the record and lets users weigh in before an API is fixed.

## When you need one

Write an RFC for:

- a new package;
- a breaking change, or a deprecation (see [VERSIONING.md](../VERSIONING.md));
- a new convention every component must follow (like localization or CSP were);
- a change to the release process, the support policy or governance.

You don't need one for bug fixes, new properties or events on an existing component, docs, or internal
refactors. Open a pull request.

## How it works

1. Copy [`0000-template.md`](0000-template.md) to `rfcs/0000-short-name.md`, fill it in, and open a pull
   request. Its title starts with `RFC:`.
2. Discussion happens on the pull request. Update the document as it changes.
3. After at least **7 days** of review, a maintainer proposes a decision: accept, reject or postpone. That
   becomes final 7 days later if no maintainer objects (lazy consensus; the lead maintainer decides a
   deadlock, per [CONTRIBUTING.md](../CONTRIBUTING.md#decisions)).
4. **Accepted:** the RFC is numbered (the pull request's number), merged, and the work can start. The
   implementation links back to it.
5. **Rejected or postponed:** the pull request is closed with the reason. A postponed RFC can be reopened when
   things change.

An accepted RFC isn't a contract: the implementation can deviate, but the RFC is then updated to say how and
why.

## Accepted RFCs

None yet.
