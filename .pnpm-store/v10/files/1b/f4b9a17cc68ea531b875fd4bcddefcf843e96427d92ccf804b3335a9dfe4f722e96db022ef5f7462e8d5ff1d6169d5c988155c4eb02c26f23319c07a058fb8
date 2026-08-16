import { Interfaces } from '@oclif/core';
import { EasNonInteractiveAndJsonFlags } from './flags';
export declare const getPaginatedQueryOptions: (flags: Partial<Record<keyof typeof EasPaginatedQueryFlags | keyof typeof EasNonInteractiveAndJsonFlags, any>>) => PaginatedQueryOptions;
export declare const getLimitFlagWithCustomValues: ({ defaultTo, limit, description, }: {
    defaultTo: number;
    limit: number;
    description?: string;
}) => Interfaces.OptionFlag<number | undefined>;
export declare const EasPaginatedQueryFlags: {
    offset: Interfaces.OptionFlag<number | undefined, Interfaces.CustomOptions>;
    limit: Interfaces.OptionFlag<number | undefined>;
};
export type PaginatedQueryOptions = {
    nonInteractive: boolean;
    json: boolean;
    limit?: number;
    offset: number;
};
