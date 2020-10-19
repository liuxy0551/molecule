import * as React from 'react';
import { ActivityBarCtx } from 'mo/provider/activityBar';
import ActivityBar from './activityBar';

export default function ActivityBarView(props) {
    const activityBar = React.useContext(ActivityBarCtx);
    return (
        <ActivityBar {...props} {...activityBar}/>
    );
}

export { ActivityBar };
