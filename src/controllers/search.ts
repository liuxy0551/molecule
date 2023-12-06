import React from 'react';
import Search from 'mo/client/slots/search';
import { BaseController } from 'mo/glue';
import { SearchEvent } from 'mo/models/search';
import { ActivityBarService } from 'mo/services/activityBar';
import { BuiltinService } from 'mo/services/builtin';
import { ContextMenuService } from 'mo/services/contextMenu';
import { SidebarService } from 'mo/services/sidebar';
import type { SearchResultItem } from 'mo/types';
import { inject, injectable } from 'tsyringe';

export interface ISearchController extends BaseController {
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    onResultClick?: (item: SearchResultItem) => void;
}

@injectable()
export class SearchController extends BaseController implements ISearchController {
    constructor(
        @inject('builtin') private builtin: BuiltinService,
        @inject('sidebar') private sidebar: SidebarService,
        @inject('activityBar') private activitybar: ActivityBarService,
        @inject('contextMenu') private contextMenu: ContextMenuService
    ) {
        super();
        this.initView();
    }

    private initView() {
        const {
            builtInSearchSidePane,
            builtInSearchActivityItem,
            builtInSearchToolBar,
            builtInSearchContextMenu,
        } = this.builtin.getState().modules;

        this.contextMenu.add('activityBar', builtInSearchContextMenu);
        this.sidebar.add({
            ...builtInSearchSidePane,
            toolbar: builtInSearchToolBar,
            render: () => React.createElement(Search, { ...this }),
        });
        this.activitybar.add(builtInSearchActivityItem);
    }

    public onChange = (value: string) => {
        this.emit(SearchEvent.onChange, value);
    };

    public onSearch = (value: string) => {
        this.emit(SearchEvent.onSearch, value);
    };

    public onResultClick = (item: SearchResultItem) => {
        this.emit(SearchEvent.onResultClick, item);
    };
}