# Exhibit

Sociale media speciaal voor fotografen, modellen en andere artiesten.

## Deployen naar GitHub Pages

Deze repository bevat een GitHub Actions workflow die automatisch een productiebuild maakt en publiceert naar GitHub Pages wanneer er wijzigingen naar de `main`-branch worden gepusht. Controleer in de repository-instellingen of GitHub Pages is ingesteld op "GitHub Actions".

1. Commit en push je wijzigingen naar `main`.
2. Ga naar het tabblad **Actions** om de workflow `Deploy to GitHub Pages` te volgen.
3. Na een geslaagde run staat de site live op `https://jouw-github-gebruikersnaam.github.io/show-app-preview/`.

## Docker

Deze repository bevat een multi-stage Dockerfile die eerst de Vite-frontend bouwt en vervolgens dezelfde container gebruikt om de backend-API én de gebuilde statics te serveren.

### Beschikbare instellingen

| Variabele           | Beschrijving                                                    | Standaard                    |
| ------------------- | --------------------------------------------------------------- | ---------------------------- |
| `VITE_API_BASE`     | API-basis-URL tijdens het bouwen van de frontend.               | `http://localhost:4000/api`  |
| `VITE_USE_STUB_API` | Gebruik de stub-API in de frontend (`true`/`false`).            | `false`                      |
| `PORT`              | Poort waarop de backend luistert.                               | `4000`                       |
| `CLIENT_ORIGIN`     | Toegestane CORS-origin (leeg laat alle origins toe).            | _leeg_                       |
| `STATIC_DIR`        | Pad waar de gebuilde frontend-statics staan.                    | `/app/dist`                  |
| `UPLOAD_DIR`        | Locatie op de host/container waar uploads worden opgeslagen.    | `/data/uploads`              |
| `DATABASE_URL`      | Database connectiestring (placeholder voor toekomstige opslag). | `file:./data/exhibit.sqlite` |

### Image bouwen en draaien

1. Build de image met optionele build-args voor de frontend:
   ```bash
   docker build \
     --build-arg VITE_API_BASE="https://api.example.com" \
     --build-arg VITE_USE_STUB_API=false \
     -t exhibit .
   ```
2. Start de container met configureerbare runtime-variabelen en een volume voor uploads:
   ```bash
   docker run --rm -p 4000:4000 \
     -e PORT=4000 \
     -e CLIENT_ORIGIN="https://example.com" \
     -e DATABASE_URL="postgresql://user:pass@db:5432/exhibit" \
     -v exhibit_uploads:/data/uploads \
     exhibit
   ```

### docker-compose

Gebruik de meegeleverde `docker-compose.yml` om lokaal te testen met standaardinstellingen:

```bash
docker compose up --build
```

Pas eventueel de waarden in een `.env`-bestand aan om `PORT`, `VITE_API_BASE`, `DATABASE_URL` of `CLIENT_ORIGIN` te wijzigen.

### Deployen naar Sliplane

- Wijs in Sliplane de map met deze repository aan en kies de meegeleverde `Dockerfile` als build-instructie.
- Zet de gewenste omgeving variabelen (`PORT`, `CLIENT_ORIGIN`, `DATABASE_URL`, `VITE_API_BASE`) in het Sliplane-dashboard.
- Zorg dat poort `4000` (of de ingestelde waarde) wordt blootgesteld in de Sliplane service-instellingen.
