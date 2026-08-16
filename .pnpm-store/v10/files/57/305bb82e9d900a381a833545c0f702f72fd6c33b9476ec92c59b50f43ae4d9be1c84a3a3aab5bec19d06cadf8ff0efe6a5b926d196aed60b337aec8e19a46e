"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObserveQuery = void 0;
const tslib_1 = require("tslib");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
const graphql_1 = require("graphql");
const Observe_1 = require("../types/Observe");
exports.ObserveQuery = {
    async timeSeriesAsync(graphqlClient, { appId, metricName, platform, startTime, endTime, }) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query AppObserveTimeSeries(
              $appId: String!
              $input: AppObserveTimeSeriesInput!
            ) {
              app {
                byId(appId: $appId) {
                  id
                  observe {
                    timeSeries(input: $input) {
                      ...AppObserveTimeSeriesFragment
                    }
                  }
                }
              }
            }
            ${(0, graphql_1.print)(Observe_1.AppObserveAppVersionFragmentNode)}
            ${(0, graphql_1.print)(Observe_1.AppObserveTimeSeriesFragmentNode)}
          `, {
            appId,
            input: { metricName, platform, startTime, endTime },
        })
            .toPromise());
        return data.app.byId.observe.timeSeries;
    },
    async appVersionsAsync(graphqlClient, { appId, platform, startTime, endTime, metricNames, }) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query AppObserveAppVersions(
              $appId: String!
              $input: AppObserveReleasesInput!
            ) {
              app {
                byId(appId: $appId) {
                  id
                  observe {
                    appVersions(input: $input) {
                      ...AppObserveAppVersionFragment
                    }
                  }
                }
              }
            }
            ${(0, graphql_1.print)(Observe_1.AppObserveAppVersionFragmentNode)}
          `, {
            appId,
            input: { platform, startTime, endTime, ...(metricNames && { metricNames }) },
        })
            .toPromise());
        return data.app.byId.observe.appVersions;
    },
    async eventsAsync(graphqlClient, variables) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query AppObserveEvents(
              $appId: String!
              $filter: AppObserveEventsFilter
              $first: Int
              $after: String
              $orderBy: AppObserveEventsOrderBy
            ) {
              app {
                byId(appId: $appId) {
                  id
                  observe {
                    events(
                      filter: $filter
                      first: $first
                      after: $after
                      orderBy: $orderBy
                    ) {
                      pageInfo {
                        hasNextPage
                        hasPreviousPage
                        endCursor
                      }
                      edges {
                        cursor
                        node {
                          id
                          ...AppObserveEventFragment
                        }
                      }
                    }
                  }
                }
              }
            }
            ${(0, graphql_1.print)(Observe_1.AppObserveEventFragmentNode)}
          `, variables)
            .toPromise());
        const { edges, pageInfo } = data.app.byId.observe.events;
        return {
            events: edges.map(edge => edge.node),
            pageInfo,
        };
    },
    async customEventListAsync(graphqlClient, variables) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query AppObserveCustomEventList(
              $appId: String!
              $filter: AppObserveCustomEventListFilter
              $first: Int
              $after: String
            ) {
              app {
                byId(appId: $appId) {
                  id
                  observe {
                    customEventList(filter: $filter, first: $first, after: $after) {
                      pageInfo {
                        hasNextPage
                        hasPreviousPage
                        endCursor
                      }
                      edges {
                        cursor
                        node {
                          id
                          ...AppObserveCustomEventFragment
                        }
                      }
                    }
                  }
                }
              }
            }
            ${(0, graphql_1.print)(Observe_1.AppObserveCustomEventFragmentNode)}
          `, variables)
            .toPromise());
        const { edges, pageInfo } = data.app.byId.observe.customEventList;
        return {
            events: edges.map(edge => edge.node),
            pageInfo,
        };
    },
    async customEventNamesAsync(graphqlClient, { appId, startTime, endTime, platform, environment, }) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query AppObserveCustomEventNames(
              $appId: String!
              $startTime: DateTime!
              $endTime: DateTime!
              $platform: AppObservePlatform
              $environment: String
            ) {
              app {
                byId(appId: $appId) {
                  id
                  observe {
                    customEventNames(
                      startTime: $startTime
                      endTime: $endTime
                      platform: $platform
                      environment: $environment
                    ) {
                      isTruncated
                      names {
                        eventName
                        count
                      }
                    }
                  }
                }
              }
            }
          `, {
            appId,
            startTime,
            endTime,
            ...(platform && { platform }),
            ...(environment && { environment }),
        })
            .toPromise());
        return data.app.byId.observe.customEventNames;
    },
    async navigationRoutesAsync(graphqlClient, variables) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query AppObserveNavigationRoutes(
              $appId: String!
              $filter: AppObserveNavigationRoutesFilter!
              $first: Int
              $after: String
              $orderBy: AppObserveNavigationRoutesOrderBy
            ) {
              app {
                byId(appId: $appId) {
                  id
                  observe {
                    navigationRoutes(filter: $filter, first: $first, after: $after, orderBy: $orderBy) {
                      pageInfo {
                        hasNextPage
                        hasPreviousPage
                        endCursor
                      }
                      edges {
                        cursor
                        node {
                          routeName
                          coldTtr {
                            count
                            median
                            p90
                          }
                          warmTtr {
                            count
                            median
                            p90
                          }
                          tti {
                            count
                            median
                            p90
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `, variables)
            .toPromise());
        const { edges, pageInfo } = data.app.byId.observe.navigationRoutes;
        return {
            routes: edges.map(edge => edge.node),
            pageInfo,
        };
    },
};
