# Screenshots for diff

Empty. The in-app Guest Browser exposed no WebView devtools socket this run, so
no browser screenshot could be captured, and the built app was smoke-tested
over HTTP instead.

To fill: run `npm run dev` (or `npm start`), open the site, and capture each
screen at the reference viewport into this folder as `S01.png`…`S18.png`.

Verified over HTTP in this run:

| screen | route | status |
| --- | --- | --- |
| S01 home | `/` | 200 |
| S02 shop | `/shop`, `/shop?category=…` | 200 |
| S03 product | `/p/pushponibash-decor-set` | 200 |
| S05 checkout | `/checkout` | 200 |
| S06 confirmation | `/order/RF-20261018-0001` | 200 |
| S07 track | `/track-order` | 200 |
| S08 wishlist | `/wishlist` | 200 |
| S09 account | `/account` | 200 |
| S10 live chat | `/live-chat` | 200 |
| S11–S15 content | `/about` `/faq` `/contact` `/blog` `/blog/:slug` | 200 |
| S16–S18 policies | `/delivery-policy` `/return-refund` `/privacy-policy` | 200 |
| primitives | `/design` | 200 |

Core loop verified: `POST /api/orders` → `RF-20261018-0001`, subtotal ৳৪,৪৭৯,
free delivery (>৳১৯৯৯), WELCOME10 −৳৪৪৭.৯, total ৳৪,০৩১.১; coupon validate,
order tracking (404 on wrong phone), and phone validation (422) all correct.
