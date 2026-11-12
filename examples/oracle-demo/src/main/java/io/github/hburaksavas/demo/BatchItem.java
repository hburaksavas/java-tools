package io.github.hburaksavas.demo;

/** Immutable item passed between the reader, processor and writer. */
public record BatchItem(long id, String branchCode, String status) {}
