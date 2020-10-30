import 'mo/workbench/activityBar/style.scss';
import * as React from 'react';
import { prefixClaName } from 'mo/common/className';
import ActivityBarItem, { IActivityBarItem } from 'mo/workbench/activityBar/activityBarItem';
import { ID_ACTIVITY_BAR } from 'mo/common/id';

export interface IActivityBar {
    data?: IActivityBarItem[];
    selected?: string;
    onSelect?: (key: string, item?: IActivityBarItem) => void;
    onClick?: (event: React.MouseEvent, item: IActivityBarItem) => void;
    render?: () => React.ReactNode;
}

export function ActivityBar(props: IActivityBar) {
    const { data = [], render, selected, onClick } = props;

    if (render) {
        return (
            <div className={prefixClaName(ID_ACTIVITY_BAR)}>
                {render()}
            </div>
        );
    }

    const normalBarItems = data?.filter((item: IActivityBarItem) => !item.type || item.type === 'normal') || [];
    const globalBarItems = data?.filter((item: IActivityBarItem) => item.type && item.type === 'global') || [];

    const renderItems = (item: IActivityBarItem, index: number) => (
        <ActivityBarItem key={item.id} {...item} data-index={index} checked={selected === item.id}/>
    );

    const click = (e: React.MouseEvent) => {
        console.log('ActivityBar onClick:', e);
        if (onClick) onClick(e, {} as any );
    };

    return (
        <div className={prefixClaName(ID_ACTIVITY_BAR)} id={ID_ACTIVITY_BAR} onClick={click}>
            <div className={prefixClaName('container', ID_ACTIVITY_BAR)}>
                <ul className={'normal-items'}>
                    {normalBarItems.map(renderItems)}
                </ul>
                <ul className={'global-items'}>
                    {globalBarItems.map(renderItems)}
                </ul>
            </div>
        </div>
    );
};

export default ActivityBar;