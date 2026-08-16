import { CombinedError } from '@urql/core';
import { AscAppLinkQuery } from '../../graphql/queries/AscAppLinkQuery';
type AscAppLinkMetadata = Awaited<ReturnType<typeof AscAppLinkQuery.getAppMetadataAsync>>;
export type AscAppLinkStatus = 'not-connected' | 'connected' | 'invalid';
export interface AscAppLinkJsonOutput {
    action: string;
    project: string;
    status: AscAppLinkStatus;
    appStoreConnectApp: {
        id: string;
        ascAppIdentifier: string;
        name: string | null;
        bundleIdentifier: string | null;
        appleUrl: string;
    } | null;
}
export declare function buildJsonOutput(action: string, metadata: AscAppLinkMetadata): AscAppLinkJsonOutput;
export declare function buildInvalidJsonOutput(action: string, projectId: string): AscAppLinkJsonOutput;
export declare function isAscAuthenticationError(error: unknown): error is CombinedError;
export declare function formatAscAppLinkStatus(metadata: AscAppLinkMetadata): string;
export {};
