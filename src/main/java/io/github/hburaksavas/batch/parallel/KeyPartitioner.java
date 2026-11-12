package io.github.hburaksavas.batch.parallel;

import java.util.*;
import javax.sql.DataSource;
import org.springframework.batch.core.*;
import org.springframework.batch.core.partition.support.Partitioner;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.jdbc.core.JdbcTemplate;

final class KeyPartitioner implements Partitioner {
    private final PartitionSpec spec;
    private final List<String> values;

    @SuppressWarnings("unchecked")
    KeyPartitioner(PartitionSpec spec, StepExecution manager, JobRepository repository,
                   SqlResources resources, DataSource dataSource) throws Exception {
        this.spec = spec;
        ExecutionContext context = manager.getJobExecution().getExecutionContext();
        String snapshotKey = "_parallel.values." + spec.job();
        String keyName = "_parallel.contextKey." + spec.job();
        if (context.containsKey(snapshotKey)) {
            if (!spec.contextKey().equals(context.getString(keyName))) {
                throw new IllegalStateException("Partition contextKey changed since the original execution");
            }
            values = List.copyOf((List<String>) context.get(snapshotKey));
        } else {
            List<String> loaded;
            if (!spec.valuesResource().isBlank()) {
                if (dataSource == null) throw new IllegalStateException("A unique DataSource is required for valuesResource");
                String sql = resources.read(spec.valuesResource());
                loaded = new JdbcTemplate(dataSource).query(sql, (org.springframework.jdbc.core.ResultSetExtractor<List<String>>) rs -> {
                    if (rs.getMetaData().getColumnCount() != 1) {
                        throw new IllegalArgumentException("Partition query must return exactly one column");
                    }
                    List<String> result = new ArrayList<>();
                    while (rs.next()) {
                        if (result.size() == 10000) throw new IllegalArgumentException("Partition query may return at most 10000 rows; use DISTINCT");
                        result.add(rs.getString(1));
                    }
                    return result;
                });
            } else loaded = spec.values();
            if (loaded.stream().anyMatch(v -> v == null || v.isBlank())) {
                throw new IllegalArgumentException("Partition values must not be null or blank");
            }
            values = List.copyOf(new LinkedHashSet<>(loaded));
            if (values.isEmpty()) throw new IllegalStateException("Partition source returned no values");
            if (values.size() > 10000) throw new IllegalStateException("At most 10000 partitions are supported");
            context.put(snapshotKey, new ArrayList<>(values));
            context.putString(keyName, spec.contextKey());
            // Persist before any worker is submitted, including on the first selected step.
            repository.updateExecutionContext(manager.getJobExecution());
        }
    }

    @Override public Map<String, ExecutionContext> partition(int gridSize) {
        Map<String, ExecutionContext> partitions = new LinkedHashMap<>();
        for (int index = 0; index < values.size(); index++) {
            ExecutionContext context = new ExecutionContext();
            context.putString(spec.contextKey(), values.get(index));
            partitions.put("partition" + index, context);
        }
        return partitions;
    }
}
