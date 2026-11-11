package io.github.hburaksavas.batch.parallel;

import java.lang.annotation.*;

/** Reads a value from the current partition's StepExecutionContext. Requires @StepScope. */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PartitionValue {
    String value();
}
