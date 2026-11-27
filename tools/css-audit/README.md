# CSS audit tools (optional, development only)

These scripts shrink `styles.css` **without changing how any screen looks**. Run them from the repository root with Playwright + Chromium installed.

1. `node tools/css-audit/prune-dead-selectors.mjs . out1.css` removes selectors whose class/id never appears in the HTML/JS (also treats names built dynamically, e.g. `"av"+n`, as alive).
2. Prove nothing changed: `node tools/css-audit/screenshot-hashes.mjs styles.css before.json` and `... out1.css after.json`, then compare the two JSON files (68 screens at 390x844 and 320x568 with synthetic data; `320/is-duas` is known to vary between runs).

`tools/css-audit/screenshot-hashes-extended.mjs <css> <out.json>` is the wider version (300 screens: four widths 390/320/768/1024, full and empty data, error messages, Done/Quick/Receive dialogs, all expense types, data cards, timer bar, print and dark colour-scheme, keyboard focus, and a check that no closed `<dialog>` is visible). Run it on the old and the new CSS, and once more on the old CSS to see run-to-run noise (a few screens such as the backup card vary between runs).

Never commit the generated JSON or intermediate CSS files.

Note: an experimental second pass that also dropped declarations overridden by later identical-selector rules removed a further ~11 KB with identical screenshots, but it broke 10 tests that pin the literal text of older rules, so it was not adopted.
