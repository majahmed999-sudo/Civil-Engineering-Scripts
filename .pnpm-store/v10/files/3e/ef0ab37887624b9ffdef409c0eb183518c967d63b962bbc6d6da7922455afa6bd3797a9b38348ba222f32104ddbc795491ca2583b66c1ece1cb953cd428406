import { AppScreenshotSet, ScreenshotDisplayType } from '@expo/apple-utils';
import { AppleTask, TaskDownloadOptions, TaskPrepareOptions, TaskUploadOptions } from '../task';
/** Locale -> ScreenshotDisplayType -> AppScreenshotSet */
export type ScreenshotSetsMap = Map<string, Map<ScreenshotDisplayType, AppScreenshotSet>>;
export type ScreenshotsData = {
    /** Map of locales to their screenshot sets */
    screenshotSets: ScreenshotSetsMap;
};
/**
 * Task for managing App Store screenshots.
 * Downloads existing screenshots and uploads new ones based on store configuration.
 */
export declare class ScreenshotsTask extends AppleTask {
    name: () => string;
    prepareAsync({ context }: TaskPrepareOptions): Promise<void>;
    downloadAsync({ config, context }: TaskDownloadOptions): Promise<void>;
    uploadAsync({ config, context }: TaskUploadOptions): Promise<void>;
}
