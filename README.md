# deep work depot

Aplicație locală pentru deep work: timer work/rest și calendar pe lună cu sesiuni.

## Stocare date

### Variantă 1: Fișier pe disc (recomandat)

Rulezi serverul local; datele se salvează în **data.json** în același folder.

```bash
node server.js
```

Apoi deschide în browser: **http://localhost:3847**

Fișierul `data.json` este creat automat; îl poți copia/backup oricând.

### Variantă 2: Doar în browser

Dacă deschizi direct **index.html** (fără server), datele rămân în **localStorage** (se pot pierde la ștergerea datelor site-ului).

## Postare automată pe WIP.co

După fiecare sesiune de deep work terminată poți posta automat pe [wip.co](https://wip.co).

1. Ia un **API key** de la [wip.co/my/api_keys](https://wip.co/my/api_keys).
2. În aplicație: **settings** → câmpul **WIP API key** → lipește cheia → Închide.
3. Rulează aplicația prin server (`node server.js`); la fiecare sesiune work terminată se postează pe WIP un todo de tip „1 sesiune deep work – [data]”.

Fără API key (câmp gol) nu se postează nimic.

## Cerințe

- Pentru server: **Node.js** instalat pe calculator.
