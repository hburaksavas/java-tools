package io.github.hburaksavas.batch.parallel;

import java.lang.annotation.*;
import org.springframework.context.annotation.Import;

/** Enables local partitioning of explicitly selected Step beans in a sequential job. */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(PartitionedStepsRegistrar.class)
public @interface EnablePartitionedSteps {
    /** Spring bean name of the target job. */
    String job();
    /** Spring bean names of the worker steps. */
    String[] steps();
    String contextKey();
    String valuesResource() default "";
    String[] values() default {};
    int concurrency() default 4;
}
