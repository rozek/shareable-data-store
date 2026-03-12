/*******************************************************************************
*                                                                              *
*                                 InfoParser                                   *
*                                                                              *
*******************************************************************************/
/**** extractInfoEntries — removes --info.key [value] and --info-delete.key pairs from argv ****/
export declare function extractInfoEntries(Argv: readonly string[]): {
    CleanArgv: string[];
    InfoEntries: Record<string, unknown>;
    InfoDeleteKeys: string[];
};
/**** applyInfoToEntry — writes and deletes info entries via the proxy returned by entry.Info ****/
export declare function applyInfoToEntry(InfoProxy: Record<string, unknown>, WholeMap: unknown, InfoEntries: Record<string, unknown>, InfoDeleteKeys?: string[]): void;
//# sourceMappingURL=InfoParser.d.ts.map