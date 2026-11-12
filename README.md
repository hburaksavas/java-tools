# Swagger UI Studio 0.2.1

Spring Boot uygulamasından sunulan, Swagger ile aynı adreste çalışan bir API çalışma alanı. `/swagger-ui/index.html` açılınca Studio otomatik başlar. Eklenti ve ayrı frontend sunucusu gerekmez.

## Neler var?

- Karşılama dashboard'u: API adı/sürümü, endpoint ve tag sayıları, HTTP metodu dağılımı, favoriler, son açılan endpoint'ler ve oturum içi istek sonuçları.
- Swagger ile paylaşılan bearer, API key, basic ve OAuth yetkilendirmesi. Güncel token her istekte Swagger'dan okunur; request ve response interceptor'ları çalışır. **Authorize**, Swagger'ın kendi yetkilendirme penceresini açar; ardından **Open API Studio** ile dönün.
- Tag grupları, arama, sekmeler, favoriler; tarayıcı yeniden açılınca çalışma düzeni geri gelir.
- Şemadan örnek JSON, JSON biçimlendirme ve temel tip/zorunlu alan doğrulaması; alan açıklamaları, typed query parametreleri, URL-encoded form ve multipart dosya yükleme.
- Kompakt görünüm; Studio ve standart Swagger için eşlenik açık/koyu/sistem teması. Başlık, aynı origin logo ve karşılama metni uygulamadan ayarlanır. Üst çubuktaki Snow/Stars efektleri düşük hareket tercihini izler; örnek projede kar açıktır.
- İstek bitince yanıt alanına kontrollü kaydırma, klavye odağı ve kısa vurgu animasyonu. Endpoint sekmeleri arasında editör kaydırma konumu korunur.
- `Ctrl+K`: arama, `Ctrl+Enter`: istek gönderme, `Alt+W`: aktif endpoint sekmesini kapatma, `Esc`: ayarları kapatma veya standart Swagger'a dönüş.

## Spring Boot entegrasyonu

```xml
<dependency>
    <groupId>com.brsvs</groupId>
    <artifactId>swagger-ui-studio-spring-boot-starter</artifactId>
    <version>0.2.1</version>
</dependency>
```

Maven Central'da yayımlanmadı. Kaynaktan `./mvnw.cmd install` (Linux/macOS: `./mvnw install`) ile yerel Maven deposuna kurun. [GitHub Release](https://github.com/hburaksavas/java-tools/releases/tag/swagger-ui-studio-v0.2.1) ayrıca starter JAR, sources JAR, çalıştırılabilir demo, Maven repository ZIP'i ve SHA256 dosyasını sunar.

Repository ZIP'ini örneğin `vendor/studio-maven` klasörüne açıp tüketen projeye şu repository'yi ekleyebilirsiniz. ZIP, starter'ın parent POM'unu da içerir; diğer bağımlılıklar Maven Central'dan çözülür.

```xml
<repositories>
    <repository>
        <id>brsvs-studio</id>
        <url>file://${project.basedir}/vendor/studio-maven</url>
    </repository>
</repositories>
```

Doğrulanan taban: **Java 17, Spring Boot 3.4.13, Springdoc 2.8.14, Spring MVC**. Starter Web MVC ve Springdoc UI içerir. Boot 4, WebFlux ve Springfox doğrulanmadı. Mevcut Springdoc bağımlılığı varsa sürümleri uyumlu tutun.

```yaml
brsvs:
  swagger:
    studio:
      enabled: true
      title: Payment API Studio
      logo-url: /assets/logo.svg
      welcome-title: Welcome to Payment API
      welcome-message: Explore the API and try a request.
      theme: system  # system, dark, light — kullanıcı tercihi varsa onu korur
      effect: none   # none, snow, stars — kullanıcı tercihi varsa onu korur
```

`enabled: false` özgün Swagger HTML'ini geri getirir. Başlangıç ayarları `/swagger-ui/studio/config.json` altında sunulur ve OpenAPI dokümanına eklenmez. Logo yalnız aynı origin HTTP(S) adresinden yüklenir. Context path kullanılan projede logo adresine context path'i ekleyin veya uygun göreli adres kullanın.

## Gerçek Spring Boot örneği

```powershell
./mvnw.cmd verify
java -jar examples/customer-api/target/swagger-ui-studio-customer-demo-0.2.1.jar
```

[Swagger UI / Studio](http://127.0.0.1:8087/swagger-ui/index.html) adresini açın. Springdoc, [OpenAPI tanımını](http://127.0.0.1:8087/v3/api-docs) gerçek controller'lardan üretir. Müşteri oluşturma/listeleme, sipariş, sağlık, auth/interceptor kontrolü, dosya ve form endpoint'leri vardır. Veriler bellekte tutulur; sunucu yalnız `127.0.0.1` üzerinde çalışır.

Auth demosu: **Authorize** içinde `demoBearer` için `demo-token` girin. Studio'da `/api/request-context` isteği `authenticated: true` ve `client: swagger-shared` döndürür. Yanıt başlıklarında `x-demo-response-interceptor: applied` görünür. Bu sabit token yalnız yerel örnek içindir; üretim güvenlik mekanizması değildir.

## Depolama ve erişim

`localStorage` yalnız favori ve açık endpoint kimliklerini, son açılan endpoint'leri, aktif sekmeyi ve görünüm tercihlerini saklar. Bunlar sayfa ve API dokümanı bazında ayrılır; tema tüm Studio/Swagger görünümleri için ortaktır. Depolama engelliyse uygulama yine açılır. **Settings → Reset workspace preferences** çalışma alanı tercihlerini sıfırlar.

Token, istek gövdesi, parametre değeri, dosya ve yanıtlar Studio tarafından diske yazılmaz; Studio kapanınca taslaklar temizlenir. Swagger'ın `persistAuthorization` ayarı uygulamanın kontrolündedir; Studio bunu değiştirmez. Oturum istek metriği yalnız bu sayfada yapılan Studio çağrılarını gösterir, sunucu geneli ölçüm değildir.

Spring Security kurallarına dokunulmaz. `/swagger-ui/**` ve API dokümanı için projenizin erişim kuralları geçerlidir. Aynı origin çerezleri normal çalışır; `withCredentials` Swagger ayarı korunur. Farklı origin isteklerinde interceptor sonrası hedef için kullanıcı onayı alınır; CORS ve tarayıcı kuralları geçerlidir. Redirect takibi kapalıdır. Yanıt belleği 1 MiB ile sınırlıdır.

## Entegrasyon ayrıntıları ve sınırlar

Starter mevcut `SwaggerIndexTransformer` bean'ini dekore eder; özel transformer ve Swagger initializer çalışmaya devam eder. Beş harici JS dosyası ve bir CSS aynı uygulamadan sunulur. Swagger API tanımı 20 saniyede yüklenmezse standart ekran açık kalır ve **Retry API Studio** ile yeniden denenebilir.

Yerel `$ref`, yaygın JSON/form/query şekilleri desteklenir. Şema doğrulaması temel tip, enum, required, sayı aralığı ve boyutlarla sınırlıdır; tam JSON Schema doğrulayıcısı değildir. Harici `$ref` çözümü, çoklu doküman seçimi, raw binary body ve elle cookie-header düzenleme henüz yoktur. Swagger'da cookie tabanlı login kullanın. Şema/proje değişince sayfayı yenileyin. Strict nonce-only CSP politikaları için tema/efekt stillerine uygulamaya özel entegrasyon gerekir; starter CSP'yi gevşetmez. Somut transformer sınıfına doğrudan injection yapan kurulumlar interface dekorasyonuna uyarlanmalıdır.

## Geliştirme ve doğrulama

```powershell
npm ci
npm run check
npm test
./mvnw.cmd verify
```

Frontend testleri gerçek Swagger UI paketinin istek motorunu kullanarak auth türleri, interceptor'lar, serialization, form/dosya ve yanıt limitini doğrular. DOM testleri dashboard, sekme/favori kalıcılığı, klavye, tema eşlemesi, kar ve engellenen storage davranışını kontrol eder. Java entegrasyon testleri HTML/assets, özel transformer, config, context path, kapatma ayarı ve gerçek örnek API'yi kontrol eder.

`npm run demo` hızlı frontend geliştirmesi için 4173 portunda Node örneği açar; asıl starter testi 8087 portundaki Java uygulamasıdır. Kullanıcının Node kurması gerekmez. JS/CSS dosyaları Maven build sırasında starter JAR'ına alınır. GitHub Actions aynı testleri Java 17'de çalıştırır; `swagger-ui-studio-v*` tag'i başarılı doğrulamadan sonra sürüm dosyalarını yayımlar.

## Depo düzeni

Bu proje bağımsız Git deposudur. Kaynak: [project/swagger-ui-studio](https://github.com/hburaksavas/java-tools/tree/project/swagger-ui-studio). Üst deponun `main` branch'inde submodule olarak listelenir. `AGENTS.md` yerel tutulur.

Teknik başvurular: [Springdoc customization](https://springdoc.org/index.html), [Swagger configuration](https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/), [Swagger Client transport](https://github.com/swagger-api/swagger-js/blob/master/src/http/index.js).
