import * as vscode from "vscode";
import { ChecklistItem } from "./types";

export class ChecklistProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<
    ChecklistItem | undefined
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {}

  getTreeItem(item: ChecklistItem): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(item.label);

    if (item.isHeader) {
    treeItem.id = item.id;
    treeItem.iconPath = new vscode.ThemeIcon("calendar");
    treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
    treeItem.contextValue = "checklistHeader";
    return treeItem;
  }


    treeItem.id = item.id;
    treeItem.contextValue = "checklistItem";
    treeItem.iconPath = new vscode.ThemeIcon(
      item.checked ? "check" : "circle-large-outline"
    );
    treeItem.command = {
      command: "devchecklist.toggleCheck",
      title: "Toggle Check",
      arguments: [item],
    };
    return treeItem;
  }

  getChildren(): ChecklistItem[] {
    const storedItems = this.context.workspaceState.get<ChecklistItem[]>(
      "checklist",
      []
    );

    const items = storedItems.filter(i => !i.isHeader);
    const today = new Date().toLocaleDateString(undefined, {
         year: "numeric",
    month: "short",
    day: "numeric",
    });

    const header: ChecklistItem = {
        id: "header_" + new Date().getTime().toString(),
        label: `Today's Tasks (${today})`,
        isHeader: true,
        createdAt: Date.now(),

    };
    return [header, ...items];
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  addItem(label: string) {
    const items = this.getChildren();

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      label,
      checked: false,
      createdAt: Date.now(),
      completed: false,
    };

    this.context.workspaceState.update("checklist", [...items, newItem]);
    this.refresh();
  }

  toggleItem(item: ChecklistItem) {
    const items = this.getChildren().map((el) =>
      el.id === item.id ? { ...el, checked: !item.checked } : el
    );
    this.context.workspaceState.update("checklist", items ?? []);
    this.refresh();
  }

  deleteItem(item: ChecklistItem) {
    const items = this.getChildren().filter((i) => i.id !== item.id);
    this.context.workspaceState.update("checklist", items);
    this.refresh();
  }
}
