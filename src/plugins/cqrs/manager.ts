export interface XcomObject {
  retData: any[]; // Stores the results of previous command executions
  params: Array<{
    commandName: string;
    commandParams: any;
  }>;
}

export interface Command<TParams, TResult, TCtx> {
  params: TParams;
  handler(params: TParams, xcomObject: XcomObject, ctx: TCtx): Promise<TResult>;
}

export class CQRSManager<TCtx> {
  constructor(private ctx: TCtx) {}

  async exec(
    // Command <Params:any, Return:any  TCtx>
    commands: Command<any, any, TCtx>[],
  ): Promise<XcomObject> {
    const xcomObject: XcomObject = { retData: [], params: [] };

    for (const command of commands) {
      const result = await command.handler(
        command.params,
        xcomObject,
        this.ctx,
      );

      // Update xcomObject with result and command details
      xcomObject.retData.push(result);
      xcomObject.params.push({
        commandName: command.constructor.name,
        commandParams: command.params,
      });
    }
    // Return the final state after all commands have been executed
    return xcomObject;
  }
}

