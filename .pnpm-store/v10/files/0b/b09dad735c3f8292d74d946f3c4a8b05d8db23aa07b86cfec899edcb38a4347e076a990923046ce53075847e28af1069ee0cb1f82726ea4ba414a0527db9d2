import { ExpoGraphqlClient } from '../../commandUtils/context/contextUtils/createGraphqlClient';
import { ViewChannelRuntimeInsightsOnAppQuery } from '../generated';
export type ChannelRuntimeInsights = NonNullable<ViewChannelRuntimeInsightsOnAppQuery['app']['byId']['updateChannelByName']>['runtimeInsights'];
export declare const ChannelInsightsQuery: {
    viewChannelRuntimeInsightsAsync(graphqlClient: ExpoGraphqlClient, { appId, channelName, runtimeVersion, startTime, endTime, }: {
        appId: string;
        channelName: string;
        runtimeVersion: string;
        startTime: string;
        endTime: string;
    }): Promise<ChannelRuntimeInsights>;
};
