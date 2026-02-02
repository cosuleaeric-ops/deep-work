# Deep Work Depot – extensie Chrome

Blochează **Facebook, X (Twitter), Reddit, Instagram** și **LinkedIn** cât timp timerul de deep work rulează în aplicația Deep Work Depot.

## Cum funcționează

1. Când pornești timerul (work sau rest) în Deep Work Depot, aplicația setează un indicator în browser.
2. Extensia citește acest indicator (când ai tab-ul cu Deep Work Depot deschis) și activează blocarea.
3. Încercări de acces la Facebook, X, Reddit, Instagram sau LinkedIn sunt blocate până oprești timerul.

Blocarea rămâne activă și după ce închizi tab-ul cu Deep Work Depot, până când deschizi din nou aplicația și oprești timerul (sau acesta se termină).

## Instalare (Chrome)

1. Deschide Chrome și mergi la `chrome://extensions/`.
2. Activează **Developer mode** (din colțul dreapta sus).
3. Apasă **Load unpacked**.
4. Alege folderul **extension** din acest proiect (cel care conține `manifest.json`).

După instalare, extensia va bloca site-urile de mai sus doar când timerul de deep work rulează.

## Site-uri blocate

- facebook.com
- twitter.com / x.com
- reddit.com
- instagram.com
- linkedin.com

Poți modifica lista în `background.js` (tab-ul BLOCK_RULES) dacă vrei să adaugi sau să scoți domenii.
