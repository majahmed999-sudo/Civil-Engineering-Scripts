"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentTelemetryContext = getAgentTelemetryContext;
const tslib_1 = require("tslib");
const agent_cli_detector_1 = require("agent-cli-detector");
const log_1 = tslib_1.__importDefault(require("../log"));
let agentTelemetryContext;
function getAgentTelemetryContext() {
    if (agentTelemetryContext === undefined) {
        agentTelemetryContext = resolveAgentTelemetryContext();
    }
    return agentTelemetryContext;
}
function resolveAgentTelemetryContext() {
    try {
        const { agent, detected } = (0, agent_cli_detector_1.detectAgent)();
        if (!detected || agent == null) {
            return null;
        }
        return { id: agent.id, sessionId: agent.sessionId };
    }
    catch (error) {
        log_1.default.debug('Failed to detect coding agent:', error?.message ?? error);
        return null;
    }
}
