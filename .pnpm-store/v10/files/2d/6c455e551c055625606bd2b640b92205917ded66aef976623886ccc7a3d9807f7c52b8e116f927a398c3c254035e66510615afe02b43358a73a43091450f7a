/**
 * Format an ISO timestamp for display in event tables (minute precision).
 * Uses the runtime's default locale.
 */
export declare function formatTimestamp(isoString: string): string;
/**
 * Format an ISO timestamp for display in log tables (millisecond precision).
 * Use this instead of formatTimestamp when the table represents individual
 * log entries where sub-minute resolution matters. Uses the runtime's
 * default locale.
 */
export declare function formatLogTimestamp(isoString: string): string;
/**
 * Format an ISO timestamp for display as a date only (no time). Uses the
 * runtime's default locale.
 */
export declare function formatDate(isoString: string): string;
/**
 * Build the time-range fragment used in summary headers, e.g.
 * "for the last 7 days" or "from Jan 1, 2025 to Feb 1, 2025".
 * Returns an empty string when no range information is provided.
 */
export declare function buildTimeRangeDescription(options: {
    daysBack?: number;
    startTime?: string;
    endTime?: string;
}): string;
