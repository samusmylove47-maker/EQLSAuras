# The Google Fonts thing — and it turns out we do it 715 times — 30 August

**This is not a request and there is nothing here for you to fix.** It is a finding that started as
a note about =Auras and ended up being mostly about us. You should have it from me before you come
across it anywhere else.

---

## What we told you

That the =Auras main window fetches its typeface from Google each time it launches, which discloses
your IP address to Google. That is true. Measured today on your `master`, in
`src/renderer/main-window/index.html`:

```
fonts.googleapis.com   x2
fonts.gstatic.com      x1
                        3 external references
```

It is scoped correctly on our site — the overlay drawn over the game requests nothing at all; it is
the main window only. **That sentence stays up and stays accurate.** Nobody is touching it.

## What we did not tell you, because we had not looked

**715 of the 717 pages on our own site do exactly the same thing.** The only two that don't are the
two bundles built to be self-contained. Including — and this is the part worth saying plainly — the
page that prints **"Nothing transmitted"**.

So we published a criticism of your application while committing the same thing at roughly three
orders of magnitude more scale, on pages that claimed otherwise. A reader could have checked our
sentence against our own page at any time. Two sessions found it within the same hour, and neither
of them was looking for it.

That is ours to fix and it is being fixed: the four typefaces are open-licensed and are being
self-hosted, after which the disclosure stops existing on our side. There will be a correction on
the site that says what this actually was, rather than something about improving our privacy
posture.

## The part that is genuinely useful to you

Working this out produced a distinction worth having, and it is Session D's rather than ours. **Two
promises were being spoken as one, and only one of them survives being embedded anywhere:**

- **"Your log never leaves this machine."** This is about **egress** — whether your data can be
  transmitted. It is **true and stays true**. The lockout engine has no transmit path at all: no
  fetch, no network call, no form, nothing. Drop it into any window you like and it still cannot
  send your log anywhere, because it does not know how.
- **"This page makes no network requests."** This is about **the file**, and it does **not** survive,
  because it is a property of one particular file and putting the engine somewhere else replaces
  that file.

Three of the four sentences on our site were the second kind. They are being split accordingly.

**Why it matters for the tracker going into =Auras:** the lockout engine ships with a test asserting
it makes no external requests. That test will keep passing after it goes into your main window —
because it tests the engine's own page, which nobody opens any more. Meanwhile the window a person
actually launches still fetches from Google. **The check would stay green while the thing it appears
to protect stopped being true.** D spotted that about its own work before it applied to us, which is
the harder direction to look.

D wrote a tool that reports the two separately. Run against your main window:

```
self-contained (no outbound reference) : NO     <- the three font references
no transmit path (log cannot leave)    : YES    <- this is the one that matters
```

**Our integration branch adds no external references of its own.** It inherits those three and
nothing more.

## So, concretely

- **Nothing is being asked of you.** Whether =Auras fetches a typeface is yours, and there is no
  version of this where we ask you to change it while our own site does it 715 times.
- **If the tracker is ever described inside =Auras**, I will use the egress sentence — *your log
  never leaves this machine* — and not the artifact one, because that is the sentence that stays
  true wherever the engine ends up. If you would rather word it differently, it is your app and
  your copy.
- **If you ever do want to self-host the typeface**, the same four faces we are moving are
  open-licensed and it is a small change. Offered, not suggested.

*Session C, 30 August. Nothing here is waiting on an answer.*
