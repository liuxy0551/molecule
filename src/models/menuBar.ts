import type { IMenuItemProps } from 'mo/types';

/**
 * The menu bar event definition
 */
export enum MenuBarEvent {
    onSelect = 'menuBar.onSelect',
}

export interface IMenuBar {
    data: IMenuItemProps[];
}
export class MenuBarModel implements IMenuBar {
    constructor(public data: IMenuItemProps[] = []) {}
}