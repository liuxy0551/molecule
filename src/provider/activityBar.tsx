import * as React from 'react';
import { ActivityBarEvent, IActivityBar } from 'mo/core/workbench/activityBar';
import { BaseProvider } from './base';
import { moleculeService } from 'mo/main';

// const initialState = {
//     activityBar: moleculeService.activityBar,
// };
// type IActivityBarState = typeof initialState;

const initialState = moleculeService.activityBar;
export const ActivityBarCtx = React.createContext<IActivityBar>(initialState);

export class ActivityBarProvider extends BaseProvider<any, IActivityBar> {
    state: IActivityBar;
    constructor(props) {
        super(props);
        this.events = [
            ActivityBarEvent.DataChanged,
        ];
        this.state = initialState;
    }
    public render() {
        return (
            <ActivityBarCtx.Provider
                value={this.state}>
                { this.props.children }
            </ActivityBarCtx.Provider>
        );
    }
}
