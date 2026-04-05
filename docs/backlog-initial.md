# Počáteční backlog – Leocraft

Kroky po dodání přesného herního zadání. Seřazeno prioritou.

---

## Fáze 1 – Herní design a assety (závisí na zadání)

- [ ] Definovat herní mechaniku: co dítě dělá, jaký je cíl, jak se hra ukončí
- [ ] Definovat postavy / objekty a jejich chování
- [ ] Připravit nebo objednat vizuální assety (postavy, pozadí, UI)
- [ ] Připravit zvukové assety (SFX, hudba)
- [ ] Vygenerovat PWA ikony (192px, 512px) z finálního loga

## Fáze 2 – Implementace jádra hry

- [ ] Nahradit `GameScene` placeholder skutečnou herní logikou
- [ ] Načíst assety v `LoadScene.preload()`
- [ ] Implementovat GameState (score, progress, save/load)
- [ ] Přidat audio manager (master volume, mute toggle)
- [ ] Přidat vizuální a audio feedback na herní akce

## Fáze 3 – Polish a testování

- [ ] Testovat na reálných zařízeních (Android + iOS)
- [ ] Testovat s dětmi 3–5 let (UX validace)
- [ ] Optimalizovat výkon (profiling, atlas sprity)
- [ ] Přidat splash screen / logo animaci
- [ ] Přidat animaci přechodu mezi scénami

## Fáze 4 – Distribuce (web)

- [ ] Nastavit Netlify / GitHub Pages deployment
- [ ] Přidat Service Worker (offline support) přes `vite-plugin-pwa`
- [ ] Přidat `apple-touch-icon` a iOS splash screeny
- [ ] QA build: `npm run build && npm run preview`

## Fáze 5 – Nativní verze (volitelné)

- [ ] Přidat Capacitor (`npm install @capacitor/core @capacitor/cli`)
- [ ] Konfigurovat Android build
- [ ] Konfigurovat iOS build (vyžaduje macOS + Xcode)
- [ ] Testovat WebView výkon na nativní platformě
- [ ] Přidat Capacitor pluginy dle potřeby (haptics, storage…)

---

## Technický dluh (k řešení průběžně)

- [ ] Přidat ESLint konfiguraci (`@typescript-eslint`)
- [ ] Přidat Prettier formátování
- [ ] Přidat unit testy pro herní logiku (Vitest)
- [ ] Dokumentovat všechny veřejné API v UI komponentách
