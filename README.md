# HandsOn project website

Live homepage: https://llltttwww.github.io/HandsOn-website/

A buildless research project page. Serve `dist/` with any static HTTP server:

```sh
python3 -m http.server 8765 --directory dist
```

## Publishing

GitHub Pages publishes the `docs/` directory on `main`. It is a byte-for-byte copy
of `dist/`, prepared by `python3 tools/prepare-pages.py` before each publication.
All assets use relative paths so the site works under the project URL above.
The canonical and social sharing URLs in `dist/index.html` point to that URL.
The homepage has its own public repository; the benchmark repository is separate.

## Content and provenance

`dist/index.html`, `style.css`, and `app.js` contain the page. The task catalog is
`dist/assets/tasks.json`. All media are local; the page needs no third-party CDN,
analytics, database, or build service. Core-50 and Transfer-16 results follow the
manuscript; DP is reported separately with its comparison caveat. GPT-6
success is shown with its own sample and interaction budgets. The Transfer-16
GPT-6 table contains success rates only. The site displays only measured results.

The page follows the conventional structure of research project pages such as
RoboCasa and Nerfies, without copying their code or media.

The opening figure retains the author's requested tall composition, natural arm
pose. The dangling cable beside the leftmost freestanding hand is removed.
Its source image is `dist/assets/handson-overview.jpg`
(SHA-256 `28d0c87f2c0242cd58bb604da5affdc4a2245aad07fd36b2e8555a36cb84d102`).
The responsive WebP files and social card derive from this image. It retains its tall composition independently of the paper's first figure.
The score panel now includes GPT-6; `tools/results-source.json` records the
verified manuscript data and `tools/update-results-artwork.py` rebuilds it.
Video assets are maintained separately.

The hero retains text affiliations and displays the official NatureWill logotype
at a small size in the upper-right corner of the hero. `dist/assets/naturewill-logotype.svg` matches the manuscript
asset (SHA-256 `52687b0b6e2459d46c9efef3d0dbcd00242735e9743774bc6d2badbe6c9dc13d`).

The download PDF follows the current author-approved arXiv manuscript,
working tree based on `92a2920`, with 56 pages. The repository links point to
`TsinghuaC3I/HandsOn`, and the author affiliations match the current Overleaf source. It includes
GPT-6 with `move_eef`, the unified 660-trial results, updated comparisons,
and the API-cost and wall-clock rationale for ten episodes per task.
The HandsOn project mark and small NatureWill header logo are retained. Image compression
preserves the exact extracted text of every page; hashes and provenance are in
`tools/paper-source.json`.
Author order, affiliations, and contribution markers are in `tools/author-source.json`.
The Paper links and BibTeX citation use the published arXiv record
`2610.26765` (DOI `10.48550/arXiv.2610.26765`, category `cs.RO`).
The separate PDF button retains the locally hosted download.

The overview film (`dist/assets/overview.mp4`) is rendered from the `FilmV2` composition of
the separately maintained film project (`dexomni-film`, deliverable `out/HandsOn_film_web.mp4`)
and re-encoded for the page at 1280 px; its poster is the title card at 16.8 s. Source,
encode settings and hashes are in `tools/video-source.json`. Its wording follows the
current manuscript and this page, including the conclusion that instruction grounding and
physical contact both matter, and regression controls for demonstration count and duration.

`tools/film-copy.ts` is the copy of the earlier line-art cut (`Film` composition), kept for
reference; editing it does not change the published film.

## Updating

Use an explicitly verified manuscript checkout and freshly compiled PDF:

```sh
python3 tools/sync-authors.py /path/to/current/root.tex --revision VERIFIED_COMMIT
python3 tools/update-paper.py --source /path/to/current/root.pdf --revision VERIFIED_COMMIT
python3 tools/prepare-social.py --font /path/to/sans-font.ttf
```

`prepare-assets.py` is for a complete media refresh. Pass the source film project
and video cards directory explicitly, alongside the verified manuscript and film:

```sh
python3 tools/prepare-assets.py \
  --project-root /path/to/workspace \
  --film-root /path/to/film-project \
  --cards-dir /path/to/video-cards \
  --ffmpeg /path/to/ffmpeg \
  --manuscript-root /path/to/current/manuscript \
  --overview-video /path/to/reviewed/film.mp4 \
  --paper-pdf /path/to/current/root.pdf \
  --paper-revision VERIFIED_COMMIT
```

The workspace must contain `handson-release/`. The film project supplies
`public/fonts/InterTight-normal-200_900.woff2` and `public/img/rerender_{a,b,c,d}.png`.
The cards directory supplies `manifest.json`; relative `src` entries resolve
against that directory. If a source is unavailable, the script uses the matching
`sim_hammer.mp4` or `sim_spoon.mp4` in the cards directory.

The script regenerates website media but does not modify the source manuscript,
simulation assets, or video project. The explicit inputs prevent silently
selecting an old cached manuscript or film.

## Validation

```sh
node tools/check-site.cjs
SITE_URL=https://llltttwww.github.io/HandsOn-website/ node tools/check-site.cjs
```

Requires Playwright and a browser. `PLAYWRIGHT_MODULE` and `BROWSER_PATH` may point
to existing installations. Checks cover the 66-task gallery, search, dialogs,
result tabs, citation copy, image loading, video playback, PDF download, and
mobile/tablet overflow. Review rendered PDF pages and changed film scenes before
publishing. `tools/qa/` is local-only and is not part of the public repository.
