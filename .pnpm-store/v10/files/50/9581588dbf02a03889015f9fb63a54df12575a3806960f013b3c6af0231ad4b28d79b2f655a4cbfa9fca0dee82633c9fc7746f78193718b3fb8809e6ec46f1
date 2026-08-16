import { SessionEventEntry, SessionMetadata } from './fetchSessions';
export interface BuildSessionEventsOptions {
    metadata?: SessionMetadata | null;
    hasMoreMetricEvents?: boolean;
    hasMoreLogEvents?: boolean;
}
export declare function buildObserveSessionEventsTable(entries: SessionEventEntry[], options?: BuildSessionEventsOptions): string;
export interface ObserveSessionEventsJson {
    sessionId: string;
    metadata: SessionMetadata | null;
    entries: SessionEventEntry[];
    hasMoreMetricEvents: boolean;
    hasMoreLogEvents: boolean;
}
export declare function buildObserveSessionEventsJson(entries: SessionEventEntry[], sessionId: string, metadata: SessionMetadata | null, hasMoreMetricEvents: boolean, hasMoreLogEvents: boolean): ObserveSessionEventsJson;
