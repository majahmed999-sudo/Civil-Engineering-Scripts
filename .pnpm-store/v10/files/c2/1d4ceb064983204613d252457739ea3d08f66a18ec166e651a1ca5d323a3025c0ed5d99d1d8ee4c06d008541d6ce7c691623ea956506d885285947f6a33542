import { LoggedInAuthenticationInfo } from './SessionManager';
export declare const SUDO_MODE_REQUIRED_ERROR_CODE = "SUDO_MODE_REQUIRED";
/**
 * Whether the error is the server signaling that the current session must be upgraded
 * to sudo mode before performing this operation.
 */
export declare function isSudoModeRequiredError(error: unknown): boolean;
/**
 * Upgrade the current session to sudo mode by re-confirming the user's password
 * (and OTP if two-factor authentication is enabled). Sudo mode is required for
 * destructive operations like project deletion, and expires server-side after a
 * few minutes.
 */
export declare function promptForSudoModeUpgradeAsync(authenticationInfo: LoggedInAuthenticationInfo): Promise<void>;
