"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Sentry = tslib_1.__importStar(require("@sentry/node"));
const easCli_1 = require("./utils/easCli");
Sentry.init({
    dsn: process.env.EAS_CLI_SENTRY_DSN,
    enabled: !!process.env.EAS_CLI_SENTRY_DSN,
    environment: getSentryEnvironment(),
    release: easCli_1.easCliVersion ? `eas-cli@${easCli_1.easCliVersion}` : undefined,
});
Sentry.setTag('source', 'eas-cli');
function getSentryEnvironment() {
    if (process.env.EXPO_LOCAL) {
        return 'local';
    }
    else if (process.env.EXPO_STAGING) {
        return 'staging';
    }
    return 'production';
}
exports.default = Sentry;
