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
    treeItem.id = item.id;

    if (item.isHeader) {
      treeItem.contextValue = "checklistHeader";
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
      treeItem.iconPath = new vscode.ThemeIcon("calendar");
      treeItem.command = undefined;

       // Show the date as a description
    treeItem.description = new Date(item.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    } else {
      treeItem.contextValue = "checklistItem";
      treeItem.iconPath = new vscode.ThemeIcon(item.checked ? "check" : "circle-large-outline");
      treeItem.command = {
        command: "devchecklist.toggleCheck",
        title: "Toggle Check",
        arguments: [item],
      };
    }

    return treeItem;
  }

   getChildren(element?: ChecklistItem): ChecklistItem[] {
    const allItems = this.context.workspaceState.get<ChecklistItem[]>("checklist", []);
    if (!element) {
      // Root level → return only headers
      return allItems.filter((item) => item.isHeader);
    }

    // If a header, return its children
    return allItems.filter((item) => item.parentId === element.id);
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  addHeader(label: string) {
    const allItems = this.context.workspaceState.get<ChecklistItem[]>("checklist", []);

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });


    const newHeader: ChecklistItem = {
      id: `header_${Date.now()}`,
      label,
      isHeader: true,
      createdAt: Date.now(),
      parentId: '0'
    };

    this.context.workspaceState.update("checklist", [...allItems, newHeader]);
    this.refresh();
  }

  addItem(label: string, parentHeaderId: string) {
    console.log("addeditem", label, parentHeaderId);
    
     const allItems = this.context.workspaceState.get<ChecklistItem[]>("checklist", []);

    const newItem: ChecklistItem = {
      id: `item_${Date.now()}`,
      label,
      checked: false,
      createdAt: Date.now(),
      completed: false,
      isHeader: false,
      parentId: parentHeaderId,
    };

    this.context.workspaceState.update("checklist", [...allItems, newItem]);
    this.refresh();
  }

  toggleItem(item: ChecklistItem) {
    console.log("toggleItem", item);
    
    const allItems = this.context.workspaceState.get<ChecklistItem[]>("checklist", []);
    const items = allItems.map((el) =>
      el.id === item.id ? { ...el, checked: !item.checked } : el
    );

    console.log("items", items);
    
    this.context.workspaceState.update("checklist", items ?? []);
    this.refresh();
  }

  deleteItem(item: ChecklistItem) {
    let allItems = this.context.workspaceState.get<ChecklistItem[]>(
      "checklist",
      []
    );

    if (item.isHeader) {
      allItems = allItems.filter(
        (el) => el.id !== item.id && el.parentId !== item.id
      );
    } else {
      allItems = allItems.filter((el) => el.id !== item.id);
    }

    this.context.workspaceState.update("checklist", allItems);
    this.refresh();
  }
}
