package io.github.hburaksavas.batch.parallel;

import java.util.*;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("batch.parallel")
public class ParallelProperties {
    private int maxWorkers = 8;
    private int queueCapacity = 32;
    private SqlSettings sql = new SqlSettings();
    private Map<String, JobSettings> jobs = new HashMap<>();
    public int getMaxWorkers() { return maxWorkers; }
    public void setMaxWorkers(int value) { maxWorkers = value; }
    public int getQueueCapacity() { return queueCapacity; }
    public void setQueueCapacity(int value) { queueCapacity = value; }
    public SqlSettings getSql() { return sql; }
    public void setSql(SqlSettings value) { sql = value; }
    public Map<String, JobSettings> getJobs() { return jobs; }
    public void setJobs(Map<String, JobSettings> jobs) { this.jobs = jobs; }
    int concurrency(PartitionSpec spec) {
        JobSettings settings = jobs.get(spec.job());
        int value = settings != null && settings.concurrency != null ? settings.concurrency : spec.concurrency();
        if (value < 1) throw new IllegalArgumentException("Job concurrency must be positive: " + spec.job());
        return value;
    }
    public static class JobSettings {
        private Integer concurrency;
        public Integer getConcurrency() { return concurrency; }
        public void setConcurrency(Integer value) { concurrency = value; }
    }
    public static class SqlSettings {
        private String basePath = "classpath:sql/";
        public String getBasePath() { return basePath; }
        public void setBasePath(String value) { basePath = value; }
    }
}
