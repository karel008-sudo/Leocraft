# Mobilní strategie – Leocraft

## Rozhodnutí: web-first → PWA-ready → Capacitor-later

### Proč web-first?

- Nulové nastavení pro distribuci: sdílej URL, otevři v prohlížeči.
- Phaser je navržen pro browser — žádné wrapping problémy.
- Rychlý iterační cyklus: deploy = upload `dist/`.
- Testování na reálném zařízení ihned přes `npm run dev` + LAN IP.

### Co je hotovo teď (prototyp)

| Feature | Stav |
|---|---|
| Portrait viewport s `user-scalable=no` | ✅ |
| `touch-action: none` — žádný browser scroll | ✅ |
| Phaser Scale.FIT + CENTER_BOTH | ✅ |
| Rotate notice pro landscape na malých displejích | ✅ |
| PWA manifest.json | ✅ |
| `apple-mobile-web-app-capable` meta tagy | ✅ |

### Co je připraveno k přidání (před releasem)

| Feature | Akce |
|---|---|
| PWA ikony (192px, 512px) | Vygeneruj z finálního loga a vlož do `public/assets/icons/` |
| Service Worker (offline cache) | Přidej `vite-plugin-pwa`; pro prototyp není nutné |
| `apple-touch-icon` | Přidej po finalizaci ikony |

---

## Capacitor – kdy a jak

### Kdy přidat

Přidej Capacitor **po** těchto milnících:
1. Hra je hratelná a má iterovatelný herní loop.
2. Prošla testováním na reálných zařízeních přes browser.
3. Rozhoduješ se o vydání na Google Play / App Store.

### Jak přidat (postup)

```bash
# 1. Instalace
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios   # podle potřeby

# 2. Inicializace
npx cap init Leocraft com.leocraft.app --web-dir dist

# 3. Build webu
npm run build

# 4. Přidání platformy
npx cap add android
npx cap sync

# 5. Otevření v Android Studiu
npx cap open android
```

Celý webový kód (Phaser + TS) zůstává beze změny.  
Capacitor jen zabalí `dist/` do nativní WebView.

---

## Testování na mobilu (lokálně)

```bash
npm run dev
# Vite vypíše Network URL, např. http://192.168.1.42:3000
# Otevři na telefonu ve stejné Wi-Fi síti
```

Doporučení: testuj na nejlevnějším Android, který máš — Chrome na low-end HW odhalí výkonnostní problémy.
