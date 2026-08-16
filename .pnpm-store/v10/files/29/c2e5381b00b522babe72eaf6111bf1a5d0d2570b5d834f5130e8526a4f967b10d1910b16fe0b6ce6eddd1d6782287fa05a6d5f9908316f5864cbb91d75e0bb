"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchObserveCustomEventsAsync = fetchObserveCustomEventsAsync;
const ObserveQuery_1 = require("../graphql/queries/ObserveQuery");
async function fetchObserveCustomEventsAsync(graphqlClient, appId, options) {
    const filter = {
        ...(options.startTime && { startTime: options.startTime }),
        ...(options.endTime && { endTime: options.endTime }),
        ...(options.eventName && { eventName: options.eventName }),
        ...(options.platform && { platform: options.platform }),
        ...(options.appVersion && { appVersion: options.appVersion }),
        ...(options.updateId && { appUpdateId: options.updateId }),
        ...(options.sessionId && { sessionId: options.sessionId }),
    };
    return await ObserveQuery_1.ObserveQuery.customEventListAsync(graphqlClient, {
        appId,
        filter,
        first: options.limit,
        ...(options.after && { after: options.after }),
    });
}
