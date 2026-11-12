package io.github.hburaksavas.demo;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.batch.core.*;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = DemoApplication.class, properties = "spring.batch.job.enabled=false")
@ActiveProfiles({"h2", "chunk"})
class ChunkCustomerJobTest {
    @Autowired JobLauncher launcher;
    @Autowired Job customerJob;
    @Autowired JdbcTemplate jdbc;

    @Test void chunkReadersAndProcessorsHandleOnlyTheirPartitionAndBothStepsComplete() throws Exception {
        JobExecution execution = launcher.run(customerJob, new JobParametersBuilder().addLong("run", 1L).toJobParameters());

        assertThat(execution.getStatus()).isEqualTo(BatchStatus.COMPLETED);
        assertThat(jdbc.queryForList("SELECT STATUS FROM DEMO_BATCH_ITEM", String.class))
                .containsExactly("DONE", "DONE", "DONE", "DONE");

        Map<String, Long> expectedReads = Map.of("001", 2L, "002", 1L, "003", 1L);
        assertThat(execution.getStepExecutions()).filteredOn(step -> step.getStepName().contains(":"))
                .hasSize(6).allSatisfy(step -> {
                    assertThat(step.getStatus()).isEqualTo(BatchStatus.COMPLETED);
                    assertThat(step.getReadCount()).isEqualTo(expectedReads.get(step.getExecutionContext().getString("branchCode")));
                    assertThat(step.getWriteCount()).isEqualTo(step.getReadCount());
                    assertThat(step.getFilterCount()).isZero();
                });

        StepExecution prepare = execution.getStepExecutions().stream()
                .filter(step -> step.getStepName().equals("prepareStep")).findFirst().orElseThrow();
        assertThat(execution.getStepExecutions()).filteredOn(step -> step.getStepName().startsWith("processStep:"))
                .allSatisfy(step -> assertThat(step.getStartTime()).isAfterOrEqualTo(prepare.getEndTime()));
    }
}
