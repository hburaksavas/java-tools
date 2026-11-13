# java-tools

Birden fazla bağımsız Java projesi için ortak GitHub deposu.

| Proje | Açıklama | Kaynak |
| --- | --- | --- |
| [spring-batch-parallel-starter](spring-batch-parallel-starter) | Java 17 / Spring Boot 3.4 için annotation ile anahtar bazında paralel step çalıştırma | [Proje branch'i](https://github.com/hburaksavas/java-tools/tree/project/spring-batch-parallel-starter) |
| [swagger-ui-studio](swagger-ui-studio) | Swagger ile ortak auth/tema kullanan dashboard, sekmeli istek editörü ve Spring Boot starter | [Proje branch'i](https://github.com/hburaksavas/java-tools/tree/project/swagger-ui-studio) · [0.3.6 sürümü](https://github.com/hburaksavas/java-tools/releases/tag/swagger-ui-studio-v0.3.6) |

## Checkout

```bash
git clone --recurse-submodules https://github.com/hburaksavas/java-tools.git
cd java-tools/spring-batch-parallel-starter
./mvnw verify
```

Her proje ayrı Git çalışma ağacı ve kendi `git status` durumuna sahiptir. Aynı GitHub deposunda `project/<proje-adı>` branch'inde tutulur; `main` altında submodule olarak listelenir. GitHub'da proje klasörü ilgili commit'e bağlantı verir.

Mevcut checkout için `git submodule update --init --recursive` kullanın. Bir proje üzerinde çalışmadan önce klasöründe `git switch project/spring-batch-parallel-starter` ile branch'e geçin. Proje commit'i/push'ından sonra üst depoda submodule referansını ayrıca commit edip pushlayın.
