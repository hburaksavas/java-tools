# API Studio geliştirme planı

## Tamamlandı: JSON yanıtlarını tablo olarak gösterme

- Varsayılan JSON; uygun yanıtlarda JSON / Table geçişi.
- Kök nesne dizisi veya `content` gibi kapsayıcı alanların içindeki nesne dizileri seçilebilir.
- Eksik hücre, null, boolean ve iç içe nesne/dizi değerleri korunur; iç içe değerler hücreden genişletilir.
- Endpoint bazında yalnız görünüm tercihi saklanır. Yanıtlar ve dizi içeriği kalıcı depolanmaz.
- Boş dizi 0 satır olarak gösterilir. Hatalı/uygun olmayan yanıtta JSON görünümüne dönülür.
- Sayfa başına 100 satır, en fazla 100 görünür sütun; tam yanıt JSON görünümünde kalır.

## Tamamlandı: liste alanlarının gönderimi

- Query, form ve JSON body içindeki listelerde eleman ekle/sil ve alternatif JSON girişi.
- İç içe nesne alanlarındaki listeler ve kök JSON dizileri desteklenir; nesne dizilerinin içindeki alanlar JSON ile düzenlenir.
- Alanı göndermeme, boş liste ve boş metin elemanı ayrılır. Boş query listesi servis sözleşmesine göre parametre üretmeyebilir; uyarı ve istek önizlemesi bulunur.
- GET/POST query ve form serileştirmesi Swagger motoruna bırakılır; OpenAPI style/explode/encoding ve Swagger 2 collectionFormat korunur. Format sessizce değiştirilmez.
- Request preview, interceptor öncesi gerçek URL/body gösterir; geçersiz giriş gönderimi engeller.
- Liste taslakları ve hatalı girişler endpoint sekmelerinde bellekte tutulur; Studio kapanınca silinir.

## Demo ve doğrulama

- GET/POST `/api/list-query`: tekrarlanan metin parametreleri.
- POST `/api/list-body`: JSON names listesi, boş liste.
- GET `/api/list-optional`: gönderilmeyen alan / boş metin ayrımı.
- GET `/api/list-numbers`: sayısal liste ve hatalı tip.
- POST `/api/list-form`: URL-encoded form listesi.
- POST `/api/list-nested`: iç içe names ve sayısal ids listeleri.
- GET `/api/table-page?empty=false`: content/archived dizileri, iç içe hücreler, eksik alanlar; empty=true boş liste.
- GET `/api/table-scalar` ve `/api/table-error`: JSON'a dönüş.

Demo tekrarlanan string parametrelerini servlet değerlerinden aynen okur. Spring'in varsayılan tek değerli koleksiyon dönüşümü virgülü bölebildiğinden `Ayşe & a,b` tek eleman senaryosu ayrıca doğrulanır. Diğer servislerde OpenAPI tanımı ve sunucu sözleşmesinin uyuşması gerekir.


## Tamamlandı: Paper City teması

- Katlanmış kâğıttan küçük bir şehir; binalar sırayla açılır.
- İmleç yaklaşınca pencereler aydınlanır; sahne sakin, düşük kontrastlı kalır.
- İstek yaşam döngüsü mevcut şehir sahnesine bağlanır; ikinci bir sahne çizilmez.
- Formlar ve yanıt metni etkileşimden korunur; azaltılmış hareket ve görünmeyen sekme davranışları desteklenir.
- Uygulandı; tema kataloğundan seçilebilir.


## Tamamlandı: diğer tema fikirleri

Bu bölümdeki beş tema uygulandı; tema kataloğundan seçilebilir.

- **Cable Car:** Sisli vadi üzerinde teleferik; imleçle hafifçe sallanan kabin, istasyonlarda açılan kapılar.
- **Watchmaker:** Lacivert ve fırçalanmış çelik; kurma kolunu sürükleyerek gerilen yay ve çalışan dişliler.
- **Bonsai Seasons:** Dokunmayla filizlenen bonsai; zamanla çiçeklenme ve yaprak dökme.
- **Silk Lanterns:** Gece avlusunda ipek fenerler; imlecin esintisiyle salınım ve hafif ışık değişimleri.
- **Miniature Harbor:** Küçük yük limanı; konteyner taşıyan vinçler ve tıklamayla sıradaki yükü seçme.

İstek tepkileri temanın mevcut sahnesinde çalışacak; ikinci bir sahne oluşturulmayacak. Form ve yanıt etkileşimleri korunacak, azaltılmış hareket ve gizli sekme tercihleri desteklenecek.


## Tamamlandı: Darkroom teması

- Kırmızı güvenlik ışığı altında fotoğraf banyosu atmosferi.
- Fotoğraf, banyo sıvısının içinde yavaşça belirir; imleçle tepsi hafifçe sallanabilir.
- İstek beklerken gelişen görüntü, yanıt geldiğinde tamamlanır; tepkiler mevcut sahnede çalışır.
- Form ve yanıt etkileşimleri korunur; azaltılmış hareket ve gizli sekme davranışları desteklenir.
- Uygulandı; tema kataloğundan seçilebilir.

## Sonraki sürümler

- Maven Central dağıtımı: yayın hesabı ve namespace, imzalı kaynak/Javadoc paketleri ve temiz bir tüketici projesinde kurulum doğrulaması.
- CI tarayıcı testleri: paketlenmiş Java 17 demosunda Studio açılışı, OpenAPI grubu geçişi, Execute ve cURL kopyalama. Masaüstü ve dar ekran kontrolü.
- Tema adayları: önce Mosaic Atelier (çini parçalarıyla tamamlanan geometrik desen) ve Shadow Theatre (kehribar ışıklı gölge oyunu). Diğer adaylar Letterpress (hareketli metal dizgi), Seismograph (dekoratif sismik iz) ve Amber Museum (fosilli amber vitrini).
