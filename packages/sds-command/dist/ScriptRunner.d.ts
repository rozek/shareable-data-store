import { SDSConfig } from './Config.js';
/**** runScript — reads and executes commands from a file or stdin ****/
export declare function runScript(Config: SDSConfig, ScriptPath: string, executeCommand: (Tokens: string[], Config: SDSConfig) => Promise<number>): Promise<number>;
//# sourceMappingURL=ScriptRunner.d.ts.map