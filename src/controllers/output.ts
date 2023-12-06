import { createElement } from 'react';
import Output from 'mo/client/components/output';
import { BaseController } from 'mo/glue';
import type { BuiltinService } from 'mo/services/builtin';
import type { PanelService } from 'mo/services/panel';
import { inject, injectable } from 'tsyringe';

export interface IOutputController extends BaseController {}

@injectable()
export class OutputController extends BaseController implements IOutputController {
    constructor(
        @inject('builtin') private builtin: BuiltinService,
        @inject('panel') private panel: PanelService
    ) {
        super();
        this.initView();
    }

    private initView() {
        const { builtInOutputPanel } = this.builtin.getState().modules;
        this.panel.add({
            ...builtInOutputPanel,
            render: () => createElement(Output, { ...this }),
        });
        this.panel.setActive(builtInOutputPanel.id);
    }
}