import { ExpoGraphqlClient } from '../../commandUtils/context/contextUtils/createGraphqlClient';
import { DeviceRunSessionByIdQuery, DeviceRunSessionFilterInput, DeviceRunSessionsByAppIdQuery } from '../generated';
export declare const DeviceRunSessionQuery: {
    byIdAsync(graphqlClient: ExpoGraphqlClient, deviceRunSessionId: string): Promise<DeviceRunSessionByIdQuery["deviceRunSessions"]["byId"]>;
    listByAppIdAsync(graphqlClient: ExpoGraphqlClient, { appId, first, after, filter, }: {
        appId: string;
        first?: number;
        after?: string;
        filter?: DeviceRunSessionFilterInput;
    }): Promise<DeviceRunSessionsByAppIdQuery["app"]["byId"]["deviceRunSessionsPaginated"]>;
};
