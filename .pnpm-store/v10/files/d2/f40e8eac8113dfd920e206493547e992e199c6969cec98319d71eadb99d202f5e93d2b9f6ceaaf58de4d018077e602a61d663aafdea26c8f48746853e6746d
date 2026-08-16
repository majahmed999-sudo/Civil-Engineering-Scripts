"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgeRatingTask = void 0;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const log_1 = tslib_1.__importDefault(require("../../../log"));
const log_2 = require("../../utils/log");
const task_1 = require("../task");
class AgeRatingTask extends task_1.AppleTask {
    name = () => 'age rating declarations';
    async prepareAsync({ context }) {
        if (!context.info) {
            return;
        }
        // The ageRatingDeclaration relationship is on appInfos (not appStoreVersions).
        try {
            context.ageRating = (await context.info.getAgeRatingDeclarationAsync()) ?? undefined;
        }
        catch (error) {
            // Gracefully handle cases where the relationship is not available
            if (error?.message?.includes('ageRatingDeclaration')) {
                log_1.default.warn((0, chalk_1.default) `{yellow Skipped age rating - not available for this app. This may require updating through App Store Connect directly.}`);
                return;
            }
            throw error;
        }
    }
    async downloadAsync({ config, context }) {
        if (context.ageRating) {
            config.setAgeRating(context.ageRating.attributes);
        }
    }
    async uploadAsync({ config, context }) {
        if (!context.ageRating) {
            log_1.default.log((0, chalk_1.default) `{dim - Skipped age rating update, not available}`);
            return;
        }
        const ageRating = config.getAgeRating();
        if (!ageRating) {
            log_1.default.log((0, chalk_1.default) `{dim - Skipped age rating update, no advisory configured}`);
        }
        else {
            context.ageRating = await (0, log_2.logAsync)(() => context.ageRating.updateAsync(ageRating), {
                pending: 'Updating age rating declaration...',
                success: 'Updated age rating declaration',
                failure: 'Failed to update age rating declaration',
            });
        }
    }
}
exports.AgeRatingTask = AgeRatingTask;
