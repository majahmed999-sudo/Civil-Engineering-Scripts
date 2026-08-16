import { AnalyticsWithOrchestration } from '../analytics/AnalyticsManager';
import { CurrentUserQuery } from '../graphql/generated';
export type LoggedInAuthenticationInfo = {
    accessToken: string;
    sessionSecret: null;
} | {
    accessToken: null;
    sessionSecret: string;
};
type Actor = NonNullable<CurrentUserQuery['meActor']>;
export default class SessionManager {
    private readonly analytics;
    private currentActor;
    constructor(analytics: AnalyticsWithOrchestration);
    getAccessToken(): string | null;
    getSessionSecret(): string | null;
    private getSession;
    private setSessionAsync;
    logoutAsync(): Promise<void>;
    getUserAsync(): Promise<Actor | undefined>;
    /**
     * Ensure that there is a logged-in actor. Show a login prompt if not.
     *
     * @param nonInteractive whether the log-in prompt if logged-out should be interactive
     * @returns logged-in Actor
     */
    ensureLoggedInAsync({ nonInteractive, }: {
        nonInteractive: boolean;
    }): Promise<{
        actor: Actor;
        authenticationInfo: LoggedInAuthenticationInfo;
    }>;
    /**
     * Prompt the user to log in.
     *
     * @deprecated Should not be used outside of context functions, except in the AccountLogin command.
     */
    showLoginPromptAsync({ nonInteractive, printNewLine, sso, browser, }?: {
        nonInteractive?: boolean | undefined;
        printNewLine?: boolean | undefined;
        sso?: boolean | undefined;
        browser?: boolean | undefined;
    }): Promise<void>;
    private browserLoginAsync;
    private loginAsync;
    /**
     * Prompt for an OTP with the option to cancel the question by answering empty (pressing return key).
     */
    private promptForOTPAsync;
    /**
     * Handle the special case error indicating that a second-factor is required for authentication.
     */
    private retryUsernamePasswordAuthWithOTPAsync;
}
export {};
