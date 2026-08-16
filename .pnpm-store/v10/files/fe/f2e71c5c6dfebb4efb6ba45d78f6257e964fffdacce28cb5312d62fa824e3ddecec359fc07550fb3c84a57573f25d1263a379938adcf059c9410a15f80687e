"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUDO_MODE_REQUIRED_ERROR_CODE = void 0;
exports.isSudoModeRequiredError = isSudoModeRequiredError;
exports.promptForSudoModeUpgradeAsync = promptForSudoModeUpgradeAsync;
const tslib_1 = require("tslib");
const ApiV2Error_1 = require("../ApiV2Error");
const api_1 = require("../api");
const client_1 = require("../graphql/client");
const log_1 = tslib_1.__importDefault(require("../log"));
const prompts_1 = require("../prompts");
exports.SUDO_MODE_REQUIRED_ERROR_CODE = 'SUDO_MODE_REQUIRED';
/**
 * Whether the error is the server signaling that the current session must be upgraded
 * to sudo mode before performing this operation.
 */
function isSudoModeRequiredError(error) {
    return (error instanceof client_1.GraphqlError &&
        error.graphQLErrors.some(e => e?.extensions?.errorCode === exports.SUDO_MODE_REQUIRED_ERROR_CODE));
}
/**
 * Upgrade the current session to sudo mode by re-confirming the user's password
 * (and OTP if two-factor authentication is enabled). Sudo mode is required for
 * destructive operations like project deletion, and expires server-side after a
 * few minutes.
 */
async function promptForSudoModeUpgradeAsync(authenticationInfo) {
    if (!authenticationInfo.sessionSecret) {
        throw new Error('This action requires sudo mode, which is only available for user sessions. ' +
            'Access tokens (EXPO_TOKEN) cannot be upgraded to sudo mode; log in with `eas login` instead.');
    }
    log_1.default.log('This action requires sudo mode. Confirm your password to continue.');
    const { password } = await (0, prompts_1.promptAsync)({
        type: 'password',
        name: 'password',
        message: 'Password:',
    });
    if (!password) {
        throw new Error('Password is required for sudo mode.');
    }
    const apiV2Client = new api_1.ApiV2Client(authenticationInfo);
    try {
        await apiV2Client.postAsync('auth/upgradeSudo', { body: { password } });
    }
    catch (error) {
        if (error instanceof ApiV2Error_1.ApiV2Error && error.expoApiV2ErrorCode === 'ONE_TIME_PASSWORD_REQUIRED') {
            log_1.default.log('One-time password from authenticator required.');
            const { otp } = await (0, prompts_1.promptAsync)({
                type: 'text',
                name: 'otp',
                message: 'One-time password or backup code:',
            });
            if (!otp) {
                throw new Error('Cancelled sudo mode upgrade.');
            }
            await apiV2Client.postAsync('auth/upgradeSudo', { body: { password, otp } });
        }
        else {
            throw error;
        }
    }
}
