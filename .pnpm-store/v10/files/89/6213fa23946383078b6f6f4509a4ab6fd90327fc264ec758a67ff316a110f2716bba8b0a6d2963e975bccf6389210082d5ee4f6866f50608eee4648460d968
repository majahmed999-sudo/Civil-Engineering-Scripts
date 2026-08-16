import { BuildPhase } from './logs';
export declare enum ErrorCode {
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    UNKNOWN_CUSTOM_BUILD_ERROR = "UNKNOWN_CUSTOM_BUILD_ERROR",
    SERVER_ERROR = "SERVER_ERROR",
    UNKNOWN_FASTLANE_ERROR = "EAS_BUILD_UNKNOWN_FASTLANE_ERROR",
    UNKNOWN_FASTLANE_RESIGN_ERROR = "EAS_BUILD_UNKNOWN_FASTLANE_RESIGN_ERROR",
    UNKNOWN_GRADLE_ERROR = "EAS_BUILD_UNKNOWN_GRADLE_ERROR",
    BUILD_TIMEOUT_ERROR = "EAS_BUILD_TIMEOUT_ERROR"
}
export interface ExternalBuildError {
    errorCode: string;
    message: string;
    docsUrl?: string;
    buildPhase?: BuildPhase;
}
export type ErrorMetadata = Record<string, unknown>;
interface ExpoErrorDetails<TMetadata extends ErrorMetadata = ErrorMetadata> {
    errorCode: string;
    trackingCode?: string;
    docsUrl?: string;
    buildPhase?: BuildPhase;
    /**
     * Metadata object for the error. Used internally for Sentry/logging/debugging.
     * It is not included in the external build error payload.
     */
    metadata?: TMetadata;
    /**
     * Underlying error that caused this error to be created. Used internally to
     * propagate blame stack traces to the response.
     */
    cause?: unknown;
}
export declare abstract class ExpoError<TMetadata extends ErrorMetadata = ErrorMetadata> extends Error {
    errorCode: string;
    trackingCode?: string;
    docsUrl?: string;
    readonly metadata?: TMetadata;
    buildPhase?: BuildPhase;
    constructor(message: string, details: ExpoErrorDetails<TMetadata>);
    /**
     * Serialized error payload used by the orchestrator-worker API.
     */
    toExternalExpoError(): ExternalBuildError;
}
export declare class UserError<TMetadata extends ErrorMetadata = ErrorMetadata> extends ExpoError<TMetadata> {
    errorCode: string;
    constructor(errorCode: string, message: string, options?: {
        trackingCode?: string;
        docsUrl?: string;
        buildPhase?: BuildPhase;
        metadata?: TMetadata;
        cause?: unknown;
    });
}
export declare class SystemError<TMetadata extends ErrorMetadata = ErrorMetadata> extends ExpoError<TMetadata> {
    constructor(message: string, options?: {
        trackingCode?: string;
        docsUrl?: string;
        buildPhase?: BuildPhase;
        metadata?: TMetadata;
        cause?: unknown;
    });
}
export declare class UnknownError extends UserError {
    constructor(buildPhase?: BuildPhase);
}
export declare class UnknownBuildError extends UserError {
    constructor();
}
export declare class UnknownCustomBuildError extends UserError {
    constructor();
}
export declare class CredentialsDistCertMismatchError extends UserError {
    constructor(message: string);
}
export {};
