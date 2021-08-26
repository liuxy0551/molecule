import 'reflect-metadata';
import React, { memo, useRef, useEffect, useLayoutEffect } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { IFolderTree, IFolderTreeSubItem } from 'mo/model';
import { select, getEventPosition } from 'mo/common/dom';
import Tree, { ITreeNodeItemProps } from 'mo/components/tree';
import { IMenuItemProps, Menu } from 'mo/components/menu';
import { Button } from 'mo/components/button';
import { FolderTreeController } from 'mo/controller/explorer/folderTree';
import { useContextView } from 'mo/components/contextView';
import { useContextMenu } from 'mo/components/contextMenu';
import {
    folderTreeClassName,
    folderTreeEditClassName,
    folderTreeInputClassName,
} from './base';
import { classNames } from 'mo/common/className';
import { Scrollable } from 'mo/components';
import { DataBaseProps } from 'mo/components/collapse';

interface IFolderTreeProps extends FolderTreeController, IFolderTree {
    panel: DataBaseProps;
}

const detectHasEditableStatus = (data) => {
    const stack = [...data];
    let res = false;
    while (stack.length) {
        const headElm = stack.pop();
        if (headElm?.isEditable) {
            res = true;
            break;
        } else {
            stack.push(...(headElm?.children || []));
        }
    }
    return res;
};

/**
 * A simple wrapper Input, achieve autoFucus & auto select file name
 */
const Input = React.forwardRef(
    (
        // same as raw input
        props: React.DetailedHTMLProps<
            React.InputHTMLAttributes<HTMLInputElement>,
            HTMLInputElement
        >,
        ref: React.LegacyRef<HTMLInputElement>
    ) => {
        const inputRef = useRef<HTMLInputElement>(null);
        useLayoutEffect(() => {
            if (inputRef.current) {
                const ext = ((props.defaultValue || '') as string).lastIndexOf(
                    '.'
                );
                inputRef.current.selectionStart = 0;
                inputRef.current.selectionEnd =
                    // if period at position of 0, then this period means hidden file
                    ext > 0
                        ? ext
                        : ((props.defaultValue || '') as string).length;
            }
        }, []);
        return <input {...props} ref={inputRef} />;
    }
);

const FolderTree: React.FunctionComponent<IFolderTreeProps> = (props) => {
    const {
        folderTree = {},
        entry,
        panel,
        onUpdateFileName,
        onSelectFile,
        onDropTree,
        onClickContextMenu,
        onRightClick,
        onLoadData,
        createTreeNode,
        ...restProps
    } = props;

    const { data = [], folderPanelContextMenu = [] } = folderTree;

    const handleAddRootFolder = () => {
        createTreeNode('RootFolder');
    };

    const welcomePage = (
        <div data-content={panel.id}>
            {entry ? (
                <>{entry}</>
            ) : (
                <div style={{ padding: '10px 5px' }}>
                    you have not yet opened a folder
                    <Button onClick={handleAddRootFolder}>Add Folder</Button>
                </div>
            )}
        </div>
    );

    if (!data.length) return welcomePage;

    const inputRef = useRef<HTMLInputElement>(null);
    // tree context view
    const contextMenu = useRef<ReturnType<typeof useContextMenu>>();

    // panel context view
    const contextView = useContextView();

    // to detect current tree whether is editable
    const hasEditable = detectHasEditableStatus(data);

    const onClickMenuItem = (e, item) => {
        onClickContextMenu?.(e, item);
        contextMenu.current?.hide();
    };

    // init context menu
    const initContextMenu = () => {
        return useContextMenu({
            anchor: select(`.${folderTreeClassName}`),
            render: () => (
                <Menu onClick={onClickMenuItem} data={folderPanelContextMenu} />
            ),
        });
    };

    const handleMenuClick = (
        item: IMenuItemProps,
        data: IFolderTreeSubItem
    ) => {
        onClickContextMenu(item, data);
        contextView.hide();
    };

    const handleRightClick = ({ event, node }) => {
        const { data } = node;
        const menuItems = onRightClick(data);

        contextView?.show(getEventPosition(event), () => (
            <Menu
                onClick={(_, item) => handleMenuClick(item!, data)}
                data={menuItems}
            />
        ));
    };

    const handleUpdateFile = (
        e: HTMLInputElement,
        node: ITreeNodeItemProps
    ) => {
        const newName = e.value;
        onUpdateFileName?.({
            ...node,
            name: newName,
        });
    };

    /**
     * update file info when input blur
     */
    const handleInputBlur = (
        e: React.FocusEvent<HTMLInputElement>,
        node: ITreeNodeItemProps
    ) => {
        handleUpdateFile(e.target, node);
    };

    /**
     * update file info when press `Enter` or `esc`
     */
    const handleInputKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        node: ITreeNodeItemProps
    ) => {
        if (e.keyCode === 13 || e.keyCode === 27) {
            handleUpdateFile(e.target as EventTarget & HTMLInputElement, node);
        }
    };

    const renderTitle = (node: ITreeNodeItemProps) => {
        const { isEditable, name } = node;

        return isEditable ? (
            <Input
                className={folderTreeInputClassName}
                type="text"
                defaultValue={name}
                ref={inputRef}
                onKeyDown={(e) => handleInputKeyDown(e, node)}
                autoComplete="off"
                autoFocus
                onBlur={(e) => handleInputBlur(e, node)}
            />
        ) : (
            name!
        );
    };

    const handleDropTree = (treeData) => {
        const newFolderTreeData = cloneDeep(data);
        newFolderTreeData[0].children = treeData;
        onDropTree?.(newFolderTreeData);
    };

    useEffect(() => {
        if (folderPanelContextMenu.length > 0) {
            contextMenu.current = initContextMenu();
        }
        return () => {
            contextMenu.current?.dispose();
        };
    }, [data.length]);

    return (
        <Scrollable noScrollX isShowShadow>
            <div data-content={panel.id}>
                <Tree
                    // root folder do not render
                    data={data[0]?.children || []}
                    className={classNames(
                        folderTreeClassName,
                        hasEditable && folderTreeEditClassName
                    )}
                    draggable={!hasEditable}
                    onDropTree={handleDropTree}
                    onSelectNode={onSelectFile}
                    onRightClick={handleRightClick}
                    renderTitle={renderTitle}
                    onLoadData={onLoadData}
                    {...restProps}
                />
            </div>
        </Scrollable>
    );
};
export default memo(FolderTree);
