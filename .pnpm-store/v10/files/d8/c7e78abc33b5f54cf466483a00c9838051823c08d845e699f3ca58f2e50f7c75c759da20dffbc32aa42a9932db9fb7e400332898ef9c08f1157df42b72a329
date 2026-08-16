"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogFragmentNode = void 0;
const tslib_1 = require("tslib");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
exports.AuditLogFragmentNode = (0, graphql_tag_1.default) `
  fragment AuditLogFragment on AuditLog {
    id
    createdAt
    websiteMessage
    targetEntityTypePublicName
    targetEntityMutationType
    actor {
      id
      displayName
    }
  }
`;
