package io.github.hburaksavas.batch.parallel;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.util.ResourceUtils;
import org.springframework.util.StringUtils;

/** Shared SQL resource lookup for partition queries and application-owned readers/tasklets. */
public class SqlResources {
    private final ResourceLoader resources;
    private final String basePath;

    public SqlResources(ResourceLoader resources, ParallelProperties properties) {
        this.resources = resources;
        String base = properties.getSql().getBasePath();
        if (!StringUtils.hasText(base)) throw new IllegalArgumentException("batch.parallel.sql.base-path must not be blank");
        if (new File(base).isAbsolute()) base = new File(base).toURI().toString();
        else if (!ResourceUtils.isUrl(base)) base = "classpath:" + base;
        basePath = base.endsWith("/") ? base : base + "/";
    }

    /** Relative names are resolved under base-path; explicit resource locations remain unchanged. */
    public Resource resource(String location) {
        if (!StringUtils.hasText(location)) throw new IllegalArgumentException("SQL resource location must not be blank");
        if (new File(location).isAbsolute()) return resources.getResource(new File(location).toURI().toString());
        return resources.getResource(ResourceUtils.isUrl(location) ? location : basePath + location);
    }

    /** Reads a SQL resource as UTF-8, closing the stream after reading. */
    public String read(String location) throws IOException {
        Resource resource = resource(location);
        try (var stream = resource.getInputStream()) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IOException("Cannot read SQL resource " + resource.getDescription(), e);
        }
    }
}
