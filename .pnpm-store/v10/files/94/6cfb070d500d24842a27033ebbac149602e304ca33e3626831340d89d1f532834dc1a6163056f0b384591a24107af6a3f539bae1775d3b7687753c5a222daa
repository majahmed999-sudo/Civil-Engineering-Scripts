"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppleTasks = createAppleTasks;
const age_rating_1 = require("./age-rating");
const app_clip_1 = require("./app-clip");
const app_info_1 = require("./app-info");
const app_review_detail_1 = require("./app-review-detail");
const app_version_1 = require("./app-version");
const previews_1 = require("./previews");
const screenshots_1 = require("./screenshots");
/**
 * List of all eligible tasks to sync local store configuration to the App store.
 */
function createAppleTasks({ version } = {}) {
    return [
        new app_version_1.AppVersionTask({ version }),
        new app_info_1.AppInfoTask(),
        new age_rating_1.AgeRatingTask(),
        new app_review_detail_1.AppReviewDetailTask(),
        new screenshots_1.ScreenshotsTask(),
        new previews_1.PreviewsTask(),
        new app_clip_1.AppClipTask(),
    ];
}
