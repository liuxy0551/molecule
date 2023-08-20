import { Children, cloneElement, isValidElement } from 'react';
import type { UniqueId } from 'mo/types';

export function searchById<T extends { id: UniqueId; [key: string]: any }>(id: UniqueId) {
    return (item: T) => item.id === id;
}

type sortIndexRequired = { sortIndex?: number; [key: string]: any };
export function sortByIndex(a: sortIndexRequired, b: sortIndexRequired) {
    return a.sortIndex !== undefined && b.sortIndex !== undefined ? a.sortIndex - b.sortIndex : 0;
}

/**
 * Access dataset values
 */
export function getDataAttributionsFromProps(props: Record<string, any>) {
    return Object.keys(props).reduce<Record<string, any>>((pre, cur) => {
        if (cur.startsWith('data-')) {
            pre[cur] = props[cur];
        }
        return pre;
    }, {});
}

/**
 * Clone react children props
 * @param children React.ReactNode
 * @param props Parent props
 */
export function cloneReactChildren<P>(children: React.ReactNode, props: P): React.ReactNode {
    return Children.map(children, (child) => {
        if (isValidElement(child)) {
            return cloneElement(child, props);
        }
        return child;
    });
}
