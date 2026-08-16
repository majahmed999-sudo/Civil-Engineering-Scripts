"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialsDistCertMismatchError = exports.UnknownCustomBuildError = exports.UnknownBuildError = exports.UnknownError = exports.SystemError = exports.UserError = exports.ExpoError = exports.ErrorCode = void 0;
const logs_1 = require("./logs");
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
    ErrorCode["UNKNOWN_CUSTOM_BUILD_ERROR"] = "UNKNOWN_CUSTOM_BUILD_ERROR";
    ErrorCode["SERVER_ERROR"] = "SERVER_ERROR";
    ErrorCode["UNKNOWN_FASTLANE_ERROR"] = "EAS_BUILD_UNKNOWN_FASTLANE_ERROR";
    ErrorCode["UNKNOWN_FASTLANE_RESIGN_ERROR"] = "EAS_BUILD_UNKNOWN_FASTLANE_RESIGN_ERROR";
    ErrorCode["UNKNOWN_GRADLE_ERROR"] = "EAS_BUILD_UNKNOWN_GRADLE_ERROR";
    ErrorCode["BUILD_TIMEOUT_ERROR"] = "EAS_BUILD_TIMEOUT_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class ExpoError extends Error {
    errorCode;
    // Internal-only classification used for Sentry, analytics, and worker internalErrorCode.
    // The public error saved on builds and job runs is always `errorCode`.
    trackingCode;
    docsUrl;
    metadata;
    buildPhase;
    constructor(message, details) {
        super(message, { cause: details.cause });
        this.errorCode = details.errorCode;
        this.trackingCode = details.trackingCode;
        this.docsUrl = details.docsUrl;
        this.metadata = details.metadata;
        this.buildPhase = details.buildPhase;
    }
    /**
     * Serialized error payload used by the orchestrator-worker API.
     */
    toExternalExpoError() {
        return {
            errorCode: this.errorCode,
            message: this.message,
            docsUrl: this.docsUrl,
            buildPhase: this.buildPhase,
        };
    }
}
exports.ExpoError = ExpoError;
class UserError extends ExpoError {
    errorCode;
    constructor(errorCode, message, options) {
        super(message, {
            errorCode,
            trackingCode: options?.trackingCode,
            docsUrl: options?.docsUrl,
            buildPhase: options?.buildPhase,
            metadata: options?.metadata,
            cause: options?.cause,
        });
        this.errorCode = errorCode;
    }
}
exports.UserError = UserError;
class SystemError extends ExpoError {
    constructor(message, options) {
        super(message, {
            errorCode: ErrorCode.SERVER_ERROR,
            trackingCode: options?.trackingCode,
            docsUrl: options?.docsUrl,
            buildPhase: options?.buildPhase,
            metadata: options?.metadata,
            cause: options?.cause,
        });
    }
}
exports.SystemError = SystemError;
class UnknownError extends UserError {
    constructor(buildPhase) {
        super(ErrorCode.UNKNOWN_ERROR, buildPhase
            ? `Unknown error. See logs of the ${logs_1.buildPhaseDisplayName[buildPhase]} build phase for more information.`
            : 'Unknown error. See logs for more information.', { buildPhase });
    }
}
exports.UnknownError = UnknownError;
class UnknownBuildError extends UserError {
    constructor() {
        const errorCode = ErrorCode.UNKNOWN_ERROR;
        const message = 'Unknown error. See logs for more information.';
        super(errorCode, message);
    }
}
exports.UnknownBuildError = UnknownBuildError;
class UnknownCustomBuildError extends UserError {
    constructor() {
        const errorCode = ErrorCode.UNKNOWN_CUSTOM_BUILD_ERROR;
        const message = 'Unknown custom build error. See logs for more information.';
        super(errorCode, message);
    }
}
exports.UnknownCustomBuildError = UnknownCustomBuildError;
class CredentialsDistCertMismatchError extends UserError {
    constructor(message) {
        super('EAS_BUILD_CREDENTIALS_DIST_CERT_MISMATCH', message);
    }
}
exports.CredentialsDistCertMismatchError = CredentialsDistCertMismatchError;
