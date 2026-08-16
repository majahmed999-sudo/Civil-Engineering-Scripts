"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupConvexProjectResultFragmentNode = exports.ConvexProjectFragmentNode = exports.ConvexTeamConnectionFragmentNode = void 0;
const tslib_1 = require("tslib");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
exports.ConvexTeamConnectionFragmentNode = (0, graphql_tag_1.default) `
  fragment ConvexTeamConnectionFragment on ConvexTeamConnection {
    id
    convexTeamIdentifier
    convexTeamName
    convexTeamSlug
    hasBeenClaimed
    createdAt
    updatedAt
    invitedAt
    invitedEmail
  }
`;
exports.ConvexProjectFragmentNode = (0, graphql_tag_1.default) `
  fragment ConvexProjectFragment on ConvexProject {
    id
    convexProjectIdentifier
    convexProjectName
    convexProjectSlug
    createdAt
    updatedAt
    convexTeamConnection {
      id
      ...ConvexTeamConnectionFragment
    }
  }
`;
exports.SetupConvexProjectResultFragmentNode = (0, graphql_tag_1.default) `
  fragment SetupConvexProjectResultFragment on SetupConvexProjectResult {
    convexDeploymentName
    convexDeploymentUrl
    deployKey
    convexProject {
      id
      ...ConvexProjectFragment
    }
  }
`;
