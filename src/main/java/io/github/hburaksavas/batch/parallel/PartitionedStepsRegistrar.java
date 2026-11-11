package io.github.hburaksavas.batch.parallel;

import java.util.*;
import org.springframework.beans.factory.support.*;
import org.springframework.context.annotation.ImportBeanDefinitionRegistrar;
import org.springframework.core.type.AnnotationMetadata;

public final class PartitionedStepsRegistrar implements ImportBeanDefinitionRegistrar {
    @Override
    public void registerBeanDefinitions(AnnotationMetadata metadata, BeanDefinitionRegistry registry) {
        Map<String, Object> a = metadata.getAnnotationAttributes(EnablePartitionedSteps.class.getName());
        if (a == null) return;
        PartitionSpec spec = new PartitionSpec((String) a.get("job"),
                Arrays.asList((String[]) a.get("steps")), (String) a.get("contextKey"),
                (String) a.get("valuesResource"), Arrays.asList((String[]) a.get("values")),
                (Integer) a.get("concurrency"));
        RootBeanDefinition definition = new RootBeanDefinition(PartitionSpec.class, () -> spec);
        registry.registerBeanDefinition("parallelPartitionSpec:" + metadata.getClassName(), definition);
        if (!registry.containsBeanDefinition("parallelStepPostProcessor")) {
            registry.registerBeanDefinition("parallelStepPostProcessor", new RootBeanDefinition(ParallelStepPostProcessor.class));
            registry.registerBeanDefinition("partitionValueSupport", new RootBeanDefinition(PartitionValueSupport.class));
        }
    }
}
