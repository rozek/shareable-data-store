import { SDSConfig } from './Config.js';
/**** printLine — writes one line to stdout ****/
export declare function printLine(Text?: string): void;
/**** printJSON — pretty-prints a value as JSON to stdout ****/
export declare function printJSON(Value: unknown): void;
/**** printError — writes a formatted error line to stderr ****/
export declare function printError(Config: SDSConfig, Message: string, Code?: number): void;
/**** printResult — prints a command result in the configured format ****/
export declare function printResult(Config: SDSConfig, Value: unknown): void;
export interface ItemDisplayOptions {
    showLabel?: boolean;
    showMIME?: boolean;
    showValue?: boolean;
    showInfo?: boolean;
    InfoKey?: string;
}
/**** formatItemLine — one-line text representation of an item entry ****/
export declare function formatItemLine(Id: string, Label: string, MIMEType: string, Value: unknown, Info: Record<string, unknown>, Options: ItemDisplayOptions): string;
/**** TreeLines — returns an array of pre-formatted tree lines ****/
export declare function TreeLines(Id: string, Label: string, Kind: 'item' | 'link', TargetId: string | undefined, Children: TreeNode[], Prefix: string, IsLast: boolean): string[];
export interface TreeNode {
    Id: string;
    Kind: 'item' | 'link';
    Label: string;
    TargetId?: string;
    Children: TreeNode[];
}
//# sourceMappingURL=Output.d.ts.map