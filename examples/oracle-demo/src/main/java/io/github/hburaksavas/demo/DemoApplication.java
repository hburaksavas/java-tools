package io.github.hburaksavas.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        try (var context = SpringApplication.run(DemoApplication.class, args)) {
            long remaining = context.getBean(org.springframework.jdbc.core.JdbcTemplate.class)
                    .queryForObject("SELECT COUNT(*) FROM DEMO_BATCH_ITEM WHERE STATUS <> 'DONE'", Long.class);
            if (remaining != 0) throw new IllegalStateException("Demo did not complete all branches: " + remaining);
        }
    }
}
