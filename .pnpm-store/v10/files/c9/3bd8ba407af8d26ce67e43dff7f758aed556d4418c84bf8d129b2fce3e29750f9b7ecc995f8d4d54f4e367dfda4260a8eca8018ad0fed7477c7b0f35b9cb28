import { ExpoGraphqlClient } from '../../commandUtils/context/contextUtils/createGraphqlClient';
import { ViewUpdateGroupInsightsQuery } from '../generated';
export type UpdateWithInsightsObject = ViewUpdateGroupInsightsQuery['updatesByGroup'][number];
export declare const UpdateInsightsQuery: {
    viewUpdateGroupInsightsAsync(graphqlClient: ExpoGraphqlClient, { groupId, startTime, endTime }: {
        groupId: string;
        startTime: string;
        endTime: string;
    }): Promise<UpdateWithInsightsObject[]>;
};
