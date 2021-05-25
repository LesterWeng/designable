import { IEngineProps } from '../types'
import { ITreeNode, TreeNode } from './TreeNode'
import { Workbench } from './Workbench'
import { Cursor } from './Cusor'
import { DragSource, GlobalDragSource } from './DragSource'
import { Keyboard } from './Keyboard'
import { Screen, ScreenType } from './Screen'
import { Event, uid } from '@designable/shared'

/**
 * 设计器引擎
 */

export class Engine extends Event {
  id: string

  source: DragSource = GlobalDragSource

  props: IEngineProps<Engine>

  cursor: Cursor

  workbench: Workbench

  keyboard: Keyboard

  screen: Screen

  constructor(props: IEngineProps<Engine>) {
    super(props)
    this.props = {
      ...Engine.defaultProps,
      ...props,
    }
    this.init()
    this.id = uid()
  }

  init() {
    this.workbench = new Workbench(this)
    this.screen = new Screen(this)
    this.cursor = new Cursor(this)
    this.keyboard = new Keyboard(this)
  }

  setCurrentTree(tree?: ITreeNode) {
    if (this.workbench.currentWorkspace) {
      this.workbench.currentWorkspace.operation.tree.from(tree)
    }
  }

  getCurrentTree() {
    return this.workbench?.currentWorkspace?.operation?.tree
  }

  getAllSelectedNodes() {
    let results: TreeNode[] = []
    for (let i = 0; i < this.workbench.workspaces.length; i++) {
      const workspace = this.workbench.workspaces[i]
      results = results.concat(workspace.operation.getSelectedNodes())
    }
    return results
  }

  findNodeById(id: string) {
    for (let i = 0; i < this.workbench.workspaces.length; i++) {
      const workspace = this.workbench.workspaces[i]
      const node = workspace.operation.tree.findById(id)
      if (node) {
        return node
      }
    }
  }

  findSourceNodeById(id: string) {
    return this.source.tree.findById(id)
  }

  findDraggingNodes(): TreeNode[] {
    const results = []
    this.workbench.eachWorkspace((workspace) => {
      workspace.operation.viewportDragon.dragNodes?.forEach((node) => {
        if (!results.includes(node)) {
          results.push(node)
        }
      })
    })
    return results
  }

  createNode(node: ITreeNode, parent?: TreeNode) {
    return new TreeNode(node, parent)
  }

  mount() {
    this.attachEvents(window)
  }

  unmount() {
    this.destroy()
  }

  static defaultProps: IEngineProps<Engine> = {
    shortcuts: [],
    effects: [],
    drivers: [],
    sourceIdAttrName: 'data-designer-source-id',
    nodeIdAttrName: 'data-designer-node-id',
    nodeHelpersIdAttrName: 'data-designer-node-helpers-id',
    outlineNodeIdAttrName: 'data-designer-outline-node-id',
    defaultScreenType: ScreenType.PC,
  }
}
