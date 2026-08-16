import { AppClip, AppClipAppStoreReviewDetail, AppClipDefaultExperience, AppClipDefaultExperienceLocalization, AppClipHeaderImage } from '@expo/apple-utils';
import { AppleTask, TaskDownloadOptions, TaskPrepareOptions, TaskUploadOptions } from '../task';
export type AppClipData = {
    /** The App Clip resource for the current app, if one exists. */
    appClip: AppClip | null;
    /**
     * The default experience attached to the *current editable* app store
     * version, if one exists. App Clip default experiences are versioned per
     * app store version, so this is null when the user has bumped the version
     * but not yet pushed an App Clip configuration for it.
     */
    appClipDefaultExperience: AppClipDefaultExperience | null;
    /**
     * The most recent default experience from any other version, used as a
     * template when creating a new default experience for the current version
     * (and as the source for `metadata:pull` when the current version has none).
     */
    appClipTemplateExperience: AppClipDefaultExperience | null;
    /** Existing localizations keyed by locale (e.g. `en-US`). */
    appClipLocalizations: Map<string, AppClipDefaultExperienceLocalization>;
    /** Existing header images keyed by locale. */
    appClipHeaderImages: Map<string, AppClipHeaderImage>;
    /** App Store review detail (invocation URLs), if one exists. */
    appClipReviewDetail: AppClipAppStoreReviewDetail | null;
};
/**
 * Task for managing App Clip metadata (default experience, localized
 * subtitles + header images, App Store review invocation URLs).
 *
 * No-op when the app does not have an App Clip target.
 */
export declare class AppClipTask extends AppleTask {
    name: () => string;
    prepareAsync({ context }: TaskPrepareOptions): Promise<void>;
    downloadAsync({ config, context }: TaskDownloadOptions): Promise<void>;
    uploadAsync({ config, context }: TaskUploadOptions): Promise<void>;
}
