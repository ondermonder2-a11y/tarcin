# Google yorumları — araştırma notu

Tarih: 2026-11-19

## Doğrulanan işletme profili
- Google Maps listing: Tarçın Ev Yemekleri, Gebizli, Aşık Veysel Cd. No:4 D:B, 07300 Muratpaşa/Antalya.
- Google Maps place URL / CID: https://www.google.com/maps/place/tar%C3%A7%C4%B1n+ev+yemekleri+antalya/data=!4m2!3m1!1s0x14c3854217371f63:0xdaa728aa7a7a8b80?hl=tr
- Profil görünümünde araştırma sırasında 4,6 puan ve 405 yorum gösterildi (zamana duyarlı değer; 2026-11-19).
- Google Maps sınırlı sayfa görünümünde öne çıkan birkaç yorum metni gösteriliyor; bazıları kısaltılıp “Diğer” ile devam ediyor, bu yüzden tam yorum olarak kullanılmamalı.

## Resmi Google kaynakları
- Place Details (New): https://developers.google.com/maps/documentation/places/web-service/place-details
  - `rating` ve `userRatingCount` ile ortalama puan ve yorum sayısı alınabilir.
  - `reviews` alanı en fazla beş kullanıcı yorumu döndürür ve Places API fiyatlandırmasında Place Details Enterprise + Atmosphere SKU katmanına girer.
- Places API policies: https://developers.google.com/maps/documentation/places/web-service/policies
  - Google Maps içeriğini kazımak, kopyalayıp saklamak veya hizmet dışına dağıtmak yasaktır; place ID istisna kapsamındadır.
  - Her yorum yazarına atıf ve Google Maps’te tekil kaynak yoruma doğrudan erişim linki gösterilmelidir. Gösterim sıralama/filtre notu da eklenmelidir.
- Maps JavaScript API review sample: https://developers.google.com/maps/documentation/javascript/place-reviews
  - `Place.fetchFields({fields:[...]})` ile yorum getirilebilir. Yazar adı, profil URI’si, profil fotoğrafı, puan, zaman ve yorum metni alanları örneklenmiştir; yazar atfı zorunludur.
- Business Profile review data API: https://developers.google.com/my-business/content/review-data
  - İşletme hesabı yetkilendirmesi/OAuth gerektirir; yorumları listeleme ve yanıtlama desteği bulunur.
- Google Maps embed/share help: https://support.google.com/maps/answer/144361?hl=tr
  - İşletme konumu bir web sayfasına harita olarak yerleştirilebilir; bu doğrudan custom review-card feed’i değildir.

## Karar
Google’dan görülen yorumları statik olarak `INITIAL_TESTIMONIALS` içine kopyalamak yerine, resmi Places API üzerinden canlı getirme veya Google Maps profiline bağlantı seçeneği sunulmalı. Canlı yorum kartlarında yazar atfı ve kaynak linki gösterilmeli; API key proje ayarlarında tutulup domain/API bazında kısıtlanmalı. Google Places API ücretlendirmesi etkin olabileceği için kullanıcı projede API/billing ayarını yapmalı.
