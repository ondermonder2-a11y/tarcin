# SMTP ve Node.js kurulumu

İletişim formu postaları, yönetici panelinde tanımlanan SMTP hesabı üzerinden gönderilir. SMTP kullanıcı adı/parolası tarayıcıya geri verilmez; sunucuda AES-256-GCM ile şifrelenmiş ayar dosyasında saklanır.

## Gereksinimler ve ilk kurulum

Bu sürüm doğrudan SMTP bağlantısı kurduğu için Node.js 22 destekli bir sunucuda çalıştırılmalıdır. Projenin Cloudflare Worker/Lovable Cloudflare hedefi raw SMTP/TCP bağlantısını desteklemez; bu özelliği o hedefe dağıtmayın. Node destekli barındırma veya Docker kullanın ve siteyi üretimde HTTPS arkasında sunun.

1. `.env.example` dosyasını `.env` olarak kopyalayın; gerçek `.env` dosyasını Git'e eklemeyin.
2. `ADMIN_PASSWORD` için en az 12 karakterlik güçlü bir ilk yönetici parolası belirleyin. `ADMIN_SESSION_SECRET` için en az 32 rastgele karakter üretin. `SMTP_SETTINGS_ENCRYPTION_KEY` için aşağıdaki komutu çalıştırıp çıkan base64 değerini kullanın:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
   ```

3. Üretim Docker imajını oluşturup kalıcı `/data` birimiyle başlatın:

   ```sh
   docker build -t tarcin-node .
   docker volume create tarcin-mail-data
   docker run --env-file .env -p 3000:3000 -v tarcin-mail-data:/data --restart unless-stopped tarcin-node
   ```

   Uygulama `SMTP_SETTINGS_FILE=/data/smtp-settings.enc` dosyasını kullanır. Reverse proxy ile HTTPS sağlayın; üretim admin oturum çerezi `Secure`, `HttpOnly` ve `SameSite=Strict` özelliklerine sahiptir.

## SMTP'yi yönetici panelinde ayarlama

1. `.env` içindeki `ADMIN_USERNAME` ve `ADMIN_PASSWORD` ile `/admin` adresinde oturum açın.
2. **E-posta / SMTP** sekmesinde SMTP sunucusu, port, SSL/TLS tercihi, kullanıcı adı, parola, `MAIL_FROM` ve `MAIL_TO` alanlarını girip kaydedin.
3. **Test E-postası Gönder** düğmesi, test mesajını `MAIL_TO` adresine yollar. Ardından iletişim formunu deneyin.

Yaygın ayar: 465 portunda SSL/TLS açık; 587 portunda SSL/TLS kapalı (uygulama STARTTLS'i zorunlu tutar). SMTP sağlayıcınızın doğru değerlerini kullanın.

## Yedekleme ve sır yönetimi

`/data/smtp-settings.enc` dosyası şifreli olsa da `SMTP_SETTINGS_ENCRYPTION_KEY` ile birlikte korunmalı ve yedeklenmelidir. Şifreleme anahtarı kaybolursa kayıtlı SMTP parolası geri açılamaz; anahtarı değiştirirseniz önce ayarları dışa aktarmadan/değiştirmeden önce yeni SMTP bilgisini admin panelinde yeniden kaydedin. Gerçek `.env`, anahtarlar ve SMTP parolaları kaynak denetimine eklenmemelidir. Sunucu logları yalnızca hata türünü yazar; SMTP kimlik bilgileri ya da form içeriği loglanmaz.

Admin panelindeki profil sayfası parola değişikliği de artık sunucuda doğrulanır ve en az 12 karakter ister. İlk başarılı parola değişikliğinden sonra parola özeti şifreli ayar dosyasında tutulur; oturumların geçerliliği artırılmış sürüm numarasıyla yenilenir.
