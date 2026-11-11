package io.github.hburaksavas.batch.parallel;

import java.util.*;

record PartitionSpec(String job, List<String> steps, String contextKey,
                     String valuesResource, List<String> values, int concurrency) {
    PartitionSpec {
        steps = List.copyOf(steps);
        values = List.copyOf(values);
        if (job.isBlank() || steps.isEmpty() || steps.stream().anyMatch(String::isBlank)
                || new HashSet<>(steps).size() != steps.size()) {
            throw new IllegalArgumentException("A job and distinct non-empty step bean names are required");
        }
        if (!contextKey.matches("[A-Za-z_][A-Za-z0-9_]*") || contextKey.startsWith("_parallel")) {
            throw new IllegalArgumentException("contextKey must be an identifier and must not start with _parallel");
        }
        if (valuesResource.isBlank() == values.isEmpty()) {
            throw new IllegalArgumentException("Specify exactly one of valuesResource or values");
        }
        if (concurrency < 1) throw new IllegalArgumentException("concurrency must be positive");
    }
}
