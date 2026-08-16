import { PipeOptions, bunyan } from '@expo/logger';
import { SpawnOptions as SpawnAsyncOptions, SpawnPromise, SpawnResult } from '@expo/spawn-async';
type SpawnOptions = SpawnAsyncOptions & PipeOptions & {
    logger?: bunyan;
};
declare function spawn(command: string, args: string[], _options?: SpawnOptions): SpawnPromise<SpawnResult>;
export default spawn;
export { SpawnOptions, SpawnResult, SpawnPromise };
