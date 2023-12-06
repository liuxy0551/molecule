import { IExtension } from 'mo/types';

import { QuickAccessCommandAction } from '../actions/quickAccessCommandAction';

export const ExtendsMenuBar: IExtension = {
    id: 'ExtendsMenuBar',
    name: 'Extend The Default MenuBar',
    activate: function (molecule, monaco): void {
        molecule.menuBar.onSelect((menuId) => {
            const {
                MENU_VIEW_PANEL,
                MENU_VIEW_MENUBAR,
                MENU_VIEW_SIBEBAR,
                MENU_VIEW_STATUSBAR,
                MENU_VIEW_ACTIVITYBAR,
            } = molecule.builtin.getState().constants;

            switch (menuId) {
                case MENU_VIEW_PANEL: {
                    molecule.layout.setPanelVisibility((prev) => !prev);
                    break;
                }
                case MENU_VIEW_MENUBAR: {
                    molecule.layout.setMenuBarVisibility((prev) => !prev);
                    break;
                }
                case MENU_VIEW_SIBEBAR: {
                    molecule.layout.setSidebarVisibility((prev) => !prev);
                    break;
                }
                case MENU_VIEW_STATUSBAR: {
                    molecule.layout.setStatusBarVisibility((prev) => !prev);
                    break;
                }
                case MENU_VIEW_ACTIVITYBAR: {
                    molecule.layout.setActivityBarVisibility((prev) => !prev);
                    break;
                }
                case QuickAccessCommandAction.ID: {
                    monaco.commandService.executeCommand(QuickAccessCommandAction.ID);
                    break;
                }

                default: {
                    break;
                }
            }
        });
    },
};