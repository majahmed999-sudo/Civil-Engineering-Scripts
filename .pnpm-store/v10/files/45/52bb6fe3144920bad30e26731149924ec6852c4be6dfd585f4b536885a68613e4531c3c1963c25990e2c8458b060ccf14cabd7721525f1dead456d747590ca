import { AppPreviewSet, PreviewType } from '@expo/apple-utils';
import { AppleTask, TaskDownloadOptions, TaskPrepareOptions, TaskUploadOptions } from '../task';
/** Locale -> PreviewType -> AppPreviewSet */
export type PreviewSetsMap = Map<string, Map<PreviewType, AppPreviewSet>>;
export type PreviewsData = {
    /** Map of locales to their preview sets */
    previewSets: PreviewSetsMap;
};
/**
 * Task for managing App Store video previews.
 * Downloads existing previews and uploads new ones based on store configuration.
 */
export declare class PreviewsTask extends AppleTask {
    name: () => string;
    prepareAsync({ context }: TaskPrepareOptions): Promise<void>;
    downloadAsync({ config, context }: TaskDownloadOptions): Promise<void>;
    uploadAsync({ config, context }: TaskUploadOptions): Promise<void>;
}
