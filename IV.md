# Telegram Instant View

Every article page of the site (`/numeri/numero-N/<article>/`) is meant to open
as a Telegram Instant View. Instant View has two halves:

1. **The markup**, which lives in this repo and is built by `site/`.
2. **The template**, a set of XPath rules that tells Telegram which part of the
   page is the title, the author and the body. It is authored and published on
   <https://instantview.telegram.org/> **from a Telegram account** — it cannot be
   deployed from here. The canonical copy of the template is the block below;
   the copy on instantview.telegram.org is a paste of it and the two change
   together.

## The template

```
~version: "2.1"

# Article pages only: /numeri/numero-N/<article>/
?path: /numeri/numero-\d+/[^/]+/?$
?exists: //article[has-class("piece")]

site_name: "Il Fatto Fantidiano"

# Header (style guide §9 frontmatter, rendered by site/src/pages/numeri/[slug]/[article].astro)
$piece:      //article[has-class("piece")]
title:       $piece//h1[has-class("piece__title")]
kicker:      $piece//p[has-class("kicker")]
author:      $piece//p[has-class("byline")]/strong
author_url:  "https://fantamagazine.margiovanni.it/rubriche/"

# Body: the rendered Markdown, nothing else
body:        $piece//div[has-class("prose")]

# Everything outside the piece is chrome: masthead, skip link, footer,
# the "Altri articoli del numero" nav. Dropping it keeps the IV clean.
@remove:     //header[has-class("masthead")]
@remove:     //a[has-class("skip-link")]
@remove:     //nav[has-class("piece__nav")]
@remove:     //footer

# Markdown tables (pagelle, classifiche) are real <table>s; IV renders them
# natively once they sit in a <figure>, which also lets wide ones scroll.
<figure>:    $body//table
```

Notes on the rules:

- `?path` and `?exists` make the template apply to article permalinks only. The
  front page, the archive, `/rubriche/` and `/albo/` deliberately get no
  Instant View: they are navigation, not reading.
- `author` is the `byline` frontmatter field; `kicker` is the rubrica label
  (`COLUMN_LABELS` in `site/src/lib/columns.ts`).
- `published_date` is intentionally absent for now. The page prints the date as
  Italian prose ("20 agosto 2026") and the template would have to parse it; the
  planned markup pass (see *Follow-up*) adds a `<time datetime="YYYY-MM-DD">`
  and the rule becomes `published_date: @datetime(0, "yyyy-MM-dd"): $piece//time/@datetime`.
- No `cover`: the site has no article images. If a masthead image is added
  later, expose it as `og:image` and add `image_url: //meta[@property="og:image"]/@content`.

## Publishing the template — step by step

1. Open <https://instantview.telegram.org/my/> and log in with the Telegram
   account that owns the channel (phone number, confirmation in the app).
2. In the URL field paste a real article, for example
   `https://fantamagazine.margiovanni.it/numeri/numero-1/approfondimento-asta/`,
   and press **Open**. The editor opens: page on the left, template on the
   right, preview in the middle.
3. Paste the template above into the template pane. The preview re-renders on
   every keystroke; errors appear at the bottom of the pane.
4. Open three or four more articles from the address bar of the editor — one
   per rubrica is enough: a pagelle piece with tables, the editoriale, a
   rubrica-fissa — and check each renders. Press **Mark as Checked** on each
   one: that builds the sample set the template is validated against.
5. Press **View in Telegram**. The link it opens has the shape

   ```
   https://t.me/iv?url=<url-encoded article URL>&rhash=<hash>
   ```

   The `rhash` identifies *this* template for *this* domain. Copy it and keep
   it in `site/.env` as `IV_RHASH=<hash>` (not committed; `.env` is ignored).
6. **Submit template** is the request for global approval — the state where
   *anyone* sharing a plain article link gets the Instant View button. Telegram
   has not been approving new domains for years; submit anyway, it costs
   nothing, but plan on the `rhash` links below.

## Using it

A link of the form `https://t.me/iv?url=<article>&rhash=<IV_RHASH>` posted in a
channel, a group or a private chat shows the article with the Instant View
button, regardless of approval status. After a deploy, print one link per
article of an issue with:

```sh
cd site && npm run iv-links -- 1          # issue number, season defaults to 2026-27
```

The script (`site/scripts/iv-links.mjs`, logic in `site/src/lib/iv.ts`) reads
`IV_RHASH` from `site/.env`, walks `content/<season>/issue-NNN/*.md` in
`order`, and prints title + IV link, ready to paste into the channel post.

### Checking that the template still works

Telegram caches the rendered IV for a while. After a template change, open the
article in the editor on instantview.telegram.org and press **View in
Telegram** again; the editor always renders live. A markup change in the site
that breaks the template shows up there as a missing title or an empty body —
check it before deploying a change to `Base.astro`, `[article].astro` or the
design system's class names, which are what the XPaths bind to.

## Content rules that keep articles IV-safe

These are already required by the style guide and enforced by the build; they
are restated here because Instant View is why they matter:

- Articles are **plain Markdown**: headings, paragraphs, emphasis, lists,
  tables, block quotes, thematic breaks. No inline HTML — IV drops unknown
  elements and everything inside them.
- Tables have a header row and no merged cells.
- Emoji in headings are fine (`💣` in `bombe.md`).
- Images, if ever used, need `alt` text and go in their own paragraph so that
  the template can wrap them in `<figure>`.

## Follow-up (separate task, planned)

A markup pass that makes the page IV-friendly by construction rather than by
template, tracked in `tasks/todo.md`:

- `<time datetime>` on the dateline → `published_date` rule above;
- `<address class="byline" rel="author">` instead of `<p class="byline">`;
- `og:type=article`, `article:published_time`, `article:author`, `og:site_name`;
- a build-time test over `dist/` asserting the elements the template binds to
  still exist, so a redesign cannot silently break Instant View.
