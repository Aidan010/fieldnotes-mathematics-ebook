# Fieldnotes Mathematics — Algebra II Units 1–10

A single course website with a textbook reader, lesson guides, and browser-based adaptive practice. The existing production destination is https://fieldnotes-mathematics-ebook.netlify.app. Repository: https://github.com/Aidan010/fieldnotes-mathematics-ebook.

## Course coverage

- 694 independently addressable textbook pages from 347 distinct two-page photographs.
- All 348 supplied photographs are accounted for: the duplicate Unit 8 opening is recorded as an alternate source rather than a repeated pair of pages.
- 72 numbered lessons with explanations, formulas, worked examples, common mistakes, summaries, and links to the original textbook.
- 360 active questions: Q1 Standard, Q2 Hard, Q3 Hard–Challenge, Q4 Challenge, Q5 Hardest for each lesson.
- 43 graph questions, each with four equal-sized A/B/C/D graphs and one correct choice.
- 317 non-graph questions, each offering Multiple Choice and Written Response for the same question.
- The original 80 questions and 90 archived question versions are preserved.

| Unit | Lessons | Reader pages | Printed textbook pages |
|---|---:|---:|---|
| 1 — Linear Equations | 9 | 80 | 4–83 |
| 2 — Relations and Functions | 7 | 64 | 84–147 |
| 3 — Quadratic Functions | 7 | 78 | 148–225 |
| 4 — Polynomials and Polynomial Functions | 9 | 86 | 226–311 |
| 5 — Inverses and Radical Functions | 6 | 58 | 312–369 |
| 6 — Exponential and Logarithmic Functions | 10 | 94 | 370–463 |
| 7 — Rational Functions | 6 | 64 | 464–527 |
| 8 — Statistics and Probability | 7 | 62 | 528–589 |
| 9 — Trigonometric Functions | 6 | 62 | 590–651 |
| 10 — Trigonometric Identities and Equations | 5 | 46 | 652–697 |

## Routes and shared layout

`/` is the study home, `/workbook` lists the entire course, and `/workbook/6-10` is an example lesson guide. Adaptive practice starts at `/practice/setup`; Mistake Book and History retain saved work.

Every valid `/ebook/chapter{number}/p{number}` URL opens the exact page independently. Each page has complete HTML and its own HTTP 200 rewrite in the generated `_redirects` file. Refresh, bookmarks, sharing, new browser contexts, and Back/Forward do not depend on having opened another page. Examples:

- `/ebook/chapter1/p1`
- `/ebook/chapter1/p25`
- `/ebook/chapter2/p5`
- `/ebook/chapter6/p94`
- `/ebook/chapter10/p46`

The reader provides chapter selection, typed or chosen page numbers, contents, Previous/Next, and zoom. It displays the current page without claiming that position measures reading completion. Source HEIC photographs remain unchanged; the website uses upright WebP copies.

Home, reader, workbook, practice, feedback, Mistake Book, and History share navigation and design rules. Graph choices keep a 2 × 2 layout on phones and provide an enlarged four-graph view. KaTeX supplies accessible MathML alongside rendered mathematics.

## Existing learning rules

Student selections are hard constraints. The engine selects only inside the selected courses, lessons, difficulty levels, and answer methods.

Every question has one result and one adaptive weight, initially 1. Correct answers multiply it by 0.5; incorrect answers multiply it by 2. Multiple Choice, Written Response, and Both share that question's state. Both requires both responses to be correct and still counts once. Graph questions are Multiple Choice only and are excluded from Written-only scope. Written working is retained for review without separate grading.

The existing engine, grading, migration, and browser storage modules are unchanged. Recent-question protection, spaced review, unseen exploration, gradual Auto difficulty, and the three-consecutive-correct mastery behavior are preserved. The regression fixture checks the four modules' hashes and all 80 original active question objects.

IndexedDB remembers this browser and origin, without sign-in or a server database. Scope changes preserve history and learning state. Transactions protect against duplicate submissions. Earlier question versions remain available for old attempts. Clearing browser site data removes local progress; devices and browsers have separate histories.

## Build and preview

Use Node.js 22 and pnpm 9.15.9 (recorded in `package.json`).

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm run build
pnpm run test:practice
pnpm run preview
```

The preview is available at `http://127.0.0.1:4173`. The build consumes the converted images already included in `public/scans`; no image conversion, OCR, external photo download, account, or API token is required to build.

`src/course.mjs` defines the units and page counts. `practice/content/lessons.mjs` assembles the course. Existing Chapter 1 and 2 questions retain their original source files; new questions and guides are in `practice/content/units/`. `practice/content/extensions.mjs` connects the supplied labs to their lessons.

## Downloads

The build generates a Markdown workbook, graph sheets, and a ZIP at:

- `/downloads/Algebra_2_Units_1_10_Complete_Course.md`
- `/downloads/Algebra_2_Units_1_10_Complete_Course.zip`

The ZIP includes the Markdown and all four-graph SVG sheets. Local copies appear in `artifacts/`. The earlier Chapter 1–2 download URLs remain available.

## Verification

`pnpm run test:practice` runs 50 checks covering question completeness, equivalent written answers, mathematical results, graph keys, parameter boundaries, scope constraints, shared weights, duplicate submissions, mastery, and preserved historical content. GitHub Actions runs the build and these checks on pushes and pull requests.

The existing browser checks are in `practice/tests/course-browser.mjs` and `scripts/verify.mjs`. They exercise every active question, all lesson guides, mobile layouts, fresh direct links, refresh, selectors, and Back/Forward. `scripts/check-routes.mjs` checks all 694 deployed reader routes and all textbook image URLs. Browser tests require Playwright and its Chromium browser; verification evidence is kept locally in `verification/`.

## Deploy the existing Netlify site

Connect this repository's `main` branch to the existing **fieldnotes-mathematics-ebook** project. Its site ID is `40d41d4f-770e-4926-a6e3-99b8b95c0b09`.

- Build command: `npm run build`
- Publish directory: `dist`
- Node.js: 22
- pnpm: 9.15.9

`netlify.toml` contains the build settings and response headers. The build generates page-specific rewrites plus the reader's unavailable-address fallback. Keep those rewrites; directing all reader routes to Page 1 would break random access.

Repository-based builds publish the complete course together. If deploying locally instead, build first and use `netlify deploy --prod --dir=dist --no-build --site=40d41d4f-770e-4926-a6e3-99b8b95c0b09` from an authenticated Netlify CLI.

The textbook photos are user-supplied course material from *Glencoe Algebra 2, Student Edition* (McGraw-Hill Education, 2018, ISBN 9780079039903). The lesson guides and practice extend the supplied course sequence.
