package io.github.hburaksavas.batch.parallel;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
@EnableConfigurationProperties(ParallelProperties.class)
public class ParallelAutoConfiguration {
    @Bean(destroyMethod = "close")
    @ConditionalOnMissingBean
    SharedWorkers parallelSharedWorkers(ParallelProperties properties, ObjectProvider<MeterRegistry> registry) {
        return new SharedWorkers(properties, registry.getIfUnique());
    }
}
