# Hooks Golf Stats

Mobilanpassad golfstatistik-app för Hooks GK.

## Sätt upp på GitHub Pages

### 1. Skapa ett nytt repo på GitHub
- Gå till github.com → New repository
- Namn: `golf-stats` (eller vad du vill)
- Välj **Public** (krävs för gratis GitHub Pages)
- Klicka "Create repository"

### 2. Ladda upp filerna
Ladda upp dessa tre filer till repot:
- `index.html`
- `app.jsx`
- `README.md`

Enklast via GitHub-webben: dra och släpp filerna direkt in i repot.

### 3. Aktivera GitHub Pages
- Gå till repots **Settings** → **Pages**
- Under "Source": välj **Deploy from a branch**
- Branch: `main`, mapp: `/ (root)`
- Klicka **Save**

Efter ~1 minut är appen live på:
`https://DITTANVÄNDARNAMN.github.io/golf-stats/`

---

## Synka data med GitHub Gist

### Skapa en token (en gång)
1. github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)"
3. Ge den ett namn, t.ex. "Golf Stats"
4. Kryssa **endast** i `gist`
5. Klicka "Generate token" och kopiera den direkt (visas bara en gång)

### Koppla ihop appen
1. Öppna appen på GitHub Pages
2. Gå till **Inställningar** → GitHub Gist
3. Klistra in token
4. Lämna Gist ID tomt första gången
5. Tryck "↑ Ladda upp till GitHub" – appen skapar ett Gist automatiskt
6. Gist ID fylls i automatiskt och sparas

### Använd på flera enheter
- Öppna appen på ny enhet
- Gå till Inställningar, fyll i token + Gist ID
- Tryck "↓ Hämta från GitHub"
- Klart!
