import EasCommand from '../../commandUtils/EasCommand';
export default class SimulatorExec extends EasCommand {
    static hidden: boolean;
    static description: string;
    static strict: boolean;
    static contextDefinition: {
        projectDir: import("../../commandUtils/context/ProjectDirContextField").default;
    };
    private isRunningSubprocess;
    runAsync(): Promise<void>;
    protected catch(err: Error): Promise<any>;
}
