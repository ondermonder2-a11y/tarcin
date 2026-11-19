# Veri Mimarisi — Admin → API → Veritabanı → Ana Sayfa

Bu belge, admin panelindeki ekleme/düzenlemelerin nasıl sunucu tarafında kalıcı hale
getirildiğini ve ana sayfanın bu veriyi nereden okuduğunu anlatır.

## Akış

```
Admin paneli (/admin)
   │  fetch PUT /api/admin/content   { changes: { fixMenu: {...} }, baseRevision: 12 }
   ▼
Sunucu API'si (src/routes/api/**)
   │  1) oturum doğrulama (HttpOnly imzalı çerez) + aynı kaynak kontrolü
   │  2) zod şemasıyla alan bazlı doğrulama  → hatalı veri ASLA yazılmaz
   ▼
Veritabanı (src/lib/server/content-db.ts)
   │  atomik yazma (geçici dosya + rename), sürüm (revision) artırımı,
   │  yazmaların sıraya alınması, bozuk belgeden kurtarma
   ▼
SITE_CONTENT_DB_FILE  →  geliştirme: .private/site-content.json
                          Docker:   /data/site-content.json (kalıcı volume)
   ▲
   │  GET /api/content  (herkese açık okuma)
Ana sayfa / profil / admin — SiteContentProvider (src/lib/content/client.tsx)
```

Kod tarafında tek tip/varsayılan/doğrulama kaynağı: `src/lib/content/schema.ts`.

## Uç noktalar

| Method | Yol | Oturum | Açıklama |
| --- | --- | --- | --- |
| GET | `/api/content` | gerekmez | Sitenin yayında olan içeriği (`revision`, `updatedAt`, `content`). |
| GET | `/api/admin/content` | gerekli | Aynı belge + `updatedBy` bilgisi (no-store). |
| PUT | `/api/admin/content` | gerekli | `changes` içinde **tek bir bölüm** günceller. 401 / 403 / 409 / 422 olası. |
| POST | `/api/admin/content-reset` | gerekli | `{"confirm": true}` ile içeriği fabrika varsayılanlarına döndürür. |
| POST | `/api/admin/media` | gerekli | Broşür/slider görselini sunucuya kaydeder, `/api/media/<ad>` adresini döner. |
| GET | `/api/media/:name` | gerekmez | Yüklenmiş görseli içerik türüyle sunar (immutable cache). |

Güncellenebilir bölümler: `fixMenu` (tabldot), `brochure` (fix menü broşürü),
`heroSlides` (slider), `categories` (lezzet kataloğu), `testimonials` (yorumlar), `profile`.

## Veritabanı belge formatı

```json
{
  "version": 1,
  "revision": 14,
  "updatedAt": "2026-11-19T10:44:00.000Z",
  "updatedBy": "admin",
  "content": { "fixMenu": { "Pazartesi": { "soup": "…" } }, "profile": { "fullName": "…" } }
}
```

- **revision**: her yazımda artar. Admin paneli kaydederken `baseRevision` gönderir;
  başkası ara yazmışsa sunucu **409** döner ve en güncel belgeyi geri verir.
  Böylece iki sekmede yapılan kayıtlar birbirinin üstüne yazmaz.
- Dosya yalnızca sunucuda durur; tarayıcıya hiçbir zaman yol veya ham belge gönderilmez.
- Neden tek dosyalık belge deposu? Bu repoda harici DB servisi yok (docker-compose yalnızca
  node-server çalıştırıyor), Lovable Cloud/Supabase şema klasörleri buradan yönetilemediği için
  `supabase/migrations` veya `drizzle/` eklenemiyor, native/deneysel sürücüler (better-sqlite3,
  `node:sqlite`) bu derleme hattında (Vite + Nitro bundle) risk taşıyor. Katman tek dosyaya
  soyutlanmış durumda; ileride `content-db.ts` içine Postgres/SQLite sürücüsü eklemek
  API'yi ve bileşenleri değiştirmeden mümkündür.

## Ortam değişkenleri

| Değişken | Geliştirme | Docker | Not |
| --- | --- | --- | --- |
| `SITE_CONTENT_DB_FILE` | `.private/site-content.json` | `/data/site-content.json` | İçerik veritabanı dosyası. |
| `SITE_MEDIA_DIR` | `.private/media` | `/data/media` | Yüklenen görsellerin klasörü. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `.env` | compose env | İlk giriş; parola panelde değiştirilebilir (PBKDF2 ile sunucuda saklanır). |
| `ADMIN_SESSION_SECRET` | `.env` | compose env | Oturum çerezi imzası (≥32 karakter). |

`.private/` ve `data/` zaten `.gitignore` içinde; veritabanı dosyası repoya girmez.

## Eski tarayıcı verisi ne oldu?

Sürüm 1'de admin paneli verileri **yalnızca o bilgisayarın tarayıcısında** duruyordu
(localStorage). Bu, "ben kaydettim ama başka telefondan bakınca eski menü görünüyor"
şikâyetinin kök nedeniydi. Artık:

- Kaynak sunucudaki veritabanıdır; her ziyaretçi aynı veriyi `/api/content` üzerinden alır.
- İlk açılışta, veritabanı **hiç düzenlenmemişse** (`revision === 1`) ve bu tarayıcıda eski
  kayıt varsa, metin bölümleri (tabldot, katalog, yorumlar, profil) otomatik olarak **bir kez**
  sunucuya taşınır ve eski anahtarlar silinir (`src/lib/content/legacy-import.ts`).
- Eski slider/broşür kayıtları bilinçli olarak taşınmaz: içlerinde Vite'ın hash'li geçici
  görsel adresleri veya 2 MB'lık base64 dizileri bulunuyordu; bunlar veritabanına yazılırsa
  kırık görsel üretirdi. Görseller artık `/api/admin/media` ile sunucuya yüklenir.
- Admin paneli artık "kaydettim" mesajını sunucu onayından **sonra** gösterir; hata olursa
  kırmızı uyarı görürsünüz (yanlışlıkla "kaydedildi" demiyor).

## Güvenlik notları

- Yazma uç noktaları HttpOnly/SameSite=Strict oturum çerezi + `Origin`/`Sec-Fetch-Site`
  kontrolü ister; çerez dışarıdan okunamaz.
- Tüm alanlar sunucuda zod ile doğrulanır: uzunluk sınırları, kontrol karakteri ve `<>`
  reddi, puan 1–5, benzersiz kategori/slider kimlikleri.
- Görsel adresleri yalnızca `/...` veya `http(s)://...` olabilir; `javascript:` ve `data:`
  reddedilir (HTML enjeksiyonu ve 3 MB'lık JSON gövdesi girişi engellenir).
- Yüklenen dosyalarda MIME beyanına değil **baytlara** bakılır (JPEG/PNG/WebP imzası);
  SVG bilinçli olarak reddedilir. Dosya adı içerik işaretinden üretilir; path traversal
  ve beklenmedik uzantı `/api/media/:name` tarafından engellenir.
- İstek boyutu sınırlıdır (içerik 512 KB, görsel 4 MB).

## Doğrulama

```bash
npx tsc --noEmit -p tsconfig.json   # tip kontrolü (geçiyor)
npm run test                        # vitest: src/lib/server/content-db.test.ts dahil
```

Ayrıca `.work/api-verify/run.mjs` ve `.work/ts-verify/verify*.ts`, Vite olmadan Node'un
tip-silme özelliğiyle **gerçek kaynak dosyaları** çalıştırıp şu senaryoları doğrular
(toplam 94 kontrol, tümü geçiyor):

- `GET /api/content` → varsayılan içerik, `revision: 1`
- `PUT /api/admin/content` → diske yazar, ardından `GET /api/content` yeni veriyi döner
- oturumsuz istekler 401, `Origin` başlıksız/çapraz kaynak istekler 403
- geçersiz puan / `javascript:` görsel / tek seferde iki bölüm → 422, veri değişmez
- bayat `baseRevision` → 409 + sunucudaki güncel belge
- sıfırlama → varsayılanlar; eşzamanlı 5 kayıt → sürüm 1..6 sıralı
- görsel yükleme → `/api/media/<sha>` adresi, immutabil sunum, EXE yüklemesi 422,
  `..\..\` traversal 404
- bozuk veritabanı dosyası → site varsayılanlarla çalışmaya devam eder

## Bu makinede `npm run dev` hatası

`node_modules` Docker/WSL içinde kurulmuş olduğu için yalnızca **Linux** native ikili
dosyalarını içeriyordu (`@oxc-parser/binding-linux-x64-*`, `@rolldown/binding-linux-x64-*`).
Windows'ta Vite/Nitro bu yüzden şu hatayla başlatılamıyordu:

```
Cannot find native binding ... @oxc-parser/binding-win32-x64-msvc
```

Çözüm: bağımlılıkları Windows için **kilit dosyasına sadık kalarak** yeniden kurmak.
`npm ci` kullanın; `npm install` sürümleri güncelleyebilir, `npm ci` ise
`package-lock.json`'daki (yayımlanmış Lovable sürümleriyle birebir aynı) paketleri kurar:

```powershell
npm ci        # birkaç dakika; Windows native binding'lerini de indirir
npm run dev   # http://localhost:3000
npm run test  # vitest: src/lib/server/content-db.test.ts dahil
```

Kilit dosyası silindiyse geri alın: `git checkout -- package-lock.json`.

Yalnızca eksik native paketleri tamir etmek isterseniz (ağınız açıksa):

```powershell
npm install --no-save --no-package-lock @oxc-parser/binding-win32-x64-msvc @rolldown/binding-win32-x64-msvc
```

Docker ile çalışmaya devam edecekseniz host'ta hiçbir şey kurmanıza gerek yok:
`docker compose up -d --build` Linux tarafında bağımlılıkları kendi başına kurar ve
veritabanı/görseller `/data` volume'ünde kalıcı olur.
