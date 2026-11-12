package io.github.hburaksavas.batch.parallel;

import java.nio.file.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.DefaultResourceLoader;
import static org.assertj.core.api.Assertions.*;

class SqlResourcesTest {
    @TempDir Path directory;

    @Test void defaultBaseReadsNestedClasspathSql() throws Exception {
        SqlResources sql = new SqlResources(new DefaultResourceLoader(), new ParallelProperties());
        assertThat(sql.read("nested/branches.sql")).contains("SELECT DISTINCT branch_code FROM branches");
    }

    @Test void qualifiedLocationsOverrideTheConfiguredBase() throws Exception {
        ParallelProperties properties = new ParallelProperties();
        properties.getSql().setBasePath("classpath:does-not-exist/");
        SqlResources sql = new SqlResources(new DefaultResourceLoader(), properties);
        assertThat(sql.read("classpath:find-branches.sql")).contains("SELECT branch_code FROM branches");
        Path external = directory.resolve("external.sql");
        Files.writeString(external, "SELECT 'şube' FROM DUAL");
        assertThat(sql.read(external.toUri().toString())).isEqualTo("SELECT 'şube' FROM DUAL");
    }

    @Test void filesystemBaseReadsRelativeFiles() throws Exception {
        Path nested = Files.createDirectories(directory.resolve("jobs"));
        Files.writeString(nested.resolve("read.sql"), "SELECT 1 FROM DUAL");
        ParallelProperties properties = new ParallelProperties();
        properties.getSql().setBasePath(directory.toUri().toString());
        assertThat(new SqlResources(new DefaultResourceLoader(), properties).read("jobs/read.sql"))
                .isEqualTo("SELECT 1 FROM DUAL");
    }
}
