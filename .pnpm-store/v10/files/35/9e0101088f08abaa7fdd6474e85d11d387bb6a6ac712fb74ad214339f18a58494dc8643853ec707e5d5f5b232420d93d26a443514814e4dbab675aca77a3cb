import EasCommand from '../../../commandUtils/EasCommand';
import { EmbeddedUpdateFragment } from '../../../graphql/queries/EmbeddedUpdateQuery';
export default class UpdateEmbeddedView extends EasCommand {
    static description: string;
    static args: {
        id: import("@oclif/core/lib/interfaces").Arg<string, Record<string, unknown>>;
    };
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static contextDefinition: {
        loggedIn: import("../../../commandUtils/context/LoggedInContextField").default;
        projectId: import("../../../commandUtils/context/ProjectIdContextField").ProjectIdContextField;
    };
    runAsync(): Promise<void>;
}
export declare function formatEmbeddedUpdate(embeddedUpdate: EmbeddedUpdateFragment): string;
