"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostHogProjectFragmentNode = exports.PostHogOrganizationConnectionFragmentNode = void 0;
const tslib_1 = require("tslib");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
exports.PostHogOrganizationConnectionFragmentNode = (0, graphql_tag_1.default) `
  fragment PostHogOrganizationConnectionFragment on PostHogOrganizationConnection {
    id
    posthogOrganizationIdentifier
    posthogOrganizationName
    posthogRegion
    createdAt
    updatedAt
  }
`;
exports.PostHogProjectFragmentNode = (0, graphql_tag_1.default) `
  fragment PostHogProjectFragment on PostHogProject {
    id
    posthogProjectIdentifier
    posthogProjectName
    posthogProjectToken
    posthogHost
    createdAt
    updatedAt
    posthogOrganizationConnection {
      id
      ...PostHogOrganizationConnectionFragment
    }
  }
`;
