"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppObserveAppVersionFragmentNode = exports.AppObserveEventFragmentNode = exports.AppObserveCustomEventFragmentNode = exports.AppObserveTimeSeriesFragmentNode = void 0;
const tslib_1 = require("tslib");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
exports.AppObserveTimeSeriesFragmentNode = (0, graphql_tag_1.default) `
  fragment AppObserveTimeSeriesFragment on AppObserveTimeSeries {
    appVersionMarkers {
      ...AppObserveAppVersionFragment
    }
    eventCount
    statistics {
      min
      max
      median
      average
      p80
      p90
      p99
    }
  }
`;
exports.AppObserveCustomEventFragmentNode = (0, graphql_tag_1.default) `
  fragment AppObserveCustomEventFragment on AppObserveCustomEvent {
    id
    eventName
    timestamp
    sessionId
    severityNumber
    severityText
    properties {
      key
      value
      type
    }
    appVersion
    appBuildNumber
    appUpdateId
    appEasBuildId
    deviceOs
    deviceOsVersion
    deviceModel
    environment
    easClientId
    countryCode
  }
`;
exports.AppObserveEventFragmentNode = (0, graphql_tag_1.default) `
  fragment AppObserveEventFragment on AppObserveEvent {
    id
    metricName
    metricValue
    timestamp
    appVersion
    appBuildNumber
    appUpdateId
    deviceModel
    deviceOs
    deviceOsVersion
    countryCode
    sessionId
    easClientId
    customParams
    routeName
  }
`;
exports.AppObserveAppVersionFragmentNode = (0, graphql_tag_1.default) `
  fragment AppObserveAppVersionFragment on AppObserveAppVersion {
    appVersion
    firstSeenAt
    eventCount
    uniqueUserCount
    buildNumbers {
      appBuildNumber
      firstSeenAt
      eventCount
      uniqueUserCount
      easBuilds {
        easBuildId
        firstSeenAt
        eventCount
        uniqueUserCount
      }
    }
    updates {
      appUpdateId
      firstSeenAt
      eventCount
      uniqueUserCount
      easBuilds {
        easBuildId
        firstSeenAt
        eventCount
        uniqueUserCount
      }
    }
    metrics {
      metricName
      eventCount
      statistics {
        min
        max
        median
        average
        p80
        p90
        p99
      }
    }
  }
`;
