# deep work depot

Aplicație pentru deep work: timer work/rest și calendar pe lună cu sesiuni. Poate rula local sau fi publicată pe Netlify (static).

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

- Pentru server local: **Node.js** instalat pe calculator.

## GitHub și Netlify

### 1. Pune proiectul pe GitHub

1. Creează un repository nou pe [github.com](https://github.com/new) (ex: `deep-work-depot`), fără README / .gitignore.
2. În terminal, din folderul proiectului:

```bash
git remote add origin https://github.com/USERNAME/deep-work-depot.git
git branch -M main
git push -u origin main
```

Înlocuiește `USERNAME` cu username-ul tău GitHub și `deep-work-depot` cu numele repo-ului dacă e diferit.

### 2. Deploy pe Netlify

1. Mergi la [netlify.com](https://www.netlify.com) și autentifică-te (cu GitHub).
2. **Add new site** → **Import an existing project** → **GitHub** și alege repo-ul.
3. Setări build (sau lasă netlify.toml din repo să le seteze):
   - **Build command:** `npm install`
   - **Publish directory:** `.`
4. **Deploy site**.

Pe Netlify, datele se salvează în **Netlify Blobs** (persistente chiar dacă ștergi cache-ul). Postarea pe WIP funcționează din browser dacă ai setat API key-ul în Setări.

### 3. Dacă pe Netlify nu merge (date nu se salvează / extensia nu blochează)

- **Verifică build-ul:** în Netlify → **Deploys** → ultimul deploy → **Build log**. Trebuie să vezi `npm install` și fără erori.
- **Verifică Functions:** în Netlify → **Functions**. Ar trebui să apară `get-data` și `save-data`.
- **Hard refresh pe site:** Ctrl+Shift+R (sau Cmd+Shift+R pe Mac) pe pagina ta Netlify ca să se încarce ultima versiune a `app.js`.
- **Extensia Chrome:** reîncarcă extensia din `chrome://extensions/`, apoi reîncarcă pagina Deep Work Depot de pe Netlify și pornește timerul.
