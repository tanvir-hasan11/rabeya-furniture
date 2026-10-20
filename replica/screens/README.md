# screens/ — reference screenshots of the original

Empty. The in-app Guest Browser reported **no WebView devtools socket**
(`browser_show` opened the page but no CDP connection was available), so the
live click-through and screenshots could not be captured this run.

To fill this folder:

1. Open the site in the Guest Browser with WebView debugging enabled.
2. Capture each screen in `recon.md` (S01–S18) in its states: empty, loading,
   filled, error, out-of-stock, mobile.
3. Save as `s01-home.png`, `s02-shop.png`, `s03-product.png`, … and note the
   URL for each.

These images are **reference only** — they are used to compare layouts and are
never shipped in the clone.
