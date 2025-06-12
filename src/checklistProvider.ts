import * as vscode from "vscode";
import { ChecklistItem } from "./types";

export class ChecklistProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<
    ChecklistItem | undefined
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private isTimerRunning = false;
  private currentTimerItem?: ChecklistItem = undefined;
  private timerInterval: any;

  constructor(private context: vscode.ExtensionContext) {}

  getTreeItem(item: ChecklistItem): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(item.label);
    treeItem.id = item.id;

    if (item.isHeader) {
      treeItem.contextValue = "checklistHeader";
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;

   const iconBasePath = this.context.asAbsolutePath("media/icons");

switch (item.progressStatus) {
  case "complete":
    treeItem.iconPath = {
      light: vscode.Uri.file(`${iconBasePath}/complete.svg`),
      dark: vscode.Uri.file(`${iconBasePath}/complete.svg`),
    };
    break;
  case "incomplete":
    treeItem.iconPath = {
      light: vscode.Uri.file(`${iconBasePath}/incomplete.svg`),
      dark: vscode.Uri.file(`${iconBasePath}/incomplete.svg`),
    };
    break;
  case "empty":
    treeItem.iconPath = {
      light: vscode.Uri.file(`${iconBasePath}/empty.svg`),
      dark: vscode.Uri.file(`${iconBasePath}/empty.svg`),
    };
    break;

    default:
      treeItem.iconPath = new vscode.ThemeIcon("calendar");
      break;
}

      treeItem.command = undefined;
      treeItem.description = item.liveDescription ?? ""; // Show the date as a description
    } else {
      treeItem.iconPath = new vscode.ThemeIcon(
        item.checked ? "check" : "circle-large-outline"
      );
      treeItem.command = {
        command: "devchecklist.toggleCheck",
        title: "Toggle Check",
        arguments: [item],
      };

      const isRunning =
        this.isTimerRunning && this.currentTimerItem?.id === item.id;

      treeItem.contextValue = isRunning
        ? "checklistItemTimer"
        : "checklistItem";

      treeItem.description = item.liveDescription ?? "";
    }

    return treeItem;
  }

  getChildren(element?: ChecklistItem): ChecklistItem[] {
    const allItems = this.context.workspaceState.get<ChecklistItem[]>(
      "checklist",
      []
    );

    // Inject live timer updates into items before rendering
    const itemsWithLiveTimers = allItems.map((item) => {
      if (item.timer) {
        const elapsed = Date.now() - item.timer;
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        return {
          ...item,
          label: item.label,
          liveDescription: `${hours}h ${minutes}m ${seconds}s`,
        };
      } else if (item.startTime && item.endTime) {
        const elapsed = item.endTime - item.startTime;
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        return {
          ...item,
          label: item.label,
          liveDescription: `${hours}h ${minutes}m ${seconds}s`,
        };
      }
      return {
        ...item,
        label: item.label,
        liveDescription: "",
      };
    });

    if (!element) {
      // Root level → return only headers
      return itemsWithLiveTimers.filter((item) => item.isHeader).map((item)=> {
        const completed = itemsWithLiveTimers.filter(child => child.parentId === item.id && child.checked).length;
        const total = itemsWithLiveTimers.filter(child => child.parentId === item.id).length;
        const descDate = new Date(item.createdAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      // const status = total > 0 ? Math.round((completed / total) * 100) : 0;
      // const progressIcon = status === 100 ? "✅" : status > 0 ? "🟡" : "⬜";
        return { 
          ...item,
          label: item.label ,
          liveDescription: descDate,
          progressStatus:
        total === 0 ? "none" : completed === total ? "complete" : completed > 0 ? "incomplete" : "empty",
        };
      });
    }

    // If a header, return its children
    return itemsWithLiveTimers.filter((item) => item.parentId === element.id);
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  addHeader(label: string) {
    const allItems = this.context.workspaceState.get<ChecklistItem[]>(
      "checklist",
      []
    );

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
      parentId: "0",
    };

    this.context.workspaceState.update("checklist", [...allItems, newHeader]);
    this.refresh();
  }

  addItem(label: string, parentHeaderId: string) {
    console.log("addeditem", label, parentHeaderId);

    const allItems = this.context.workspaceState.get<ChecklistItem[]>(
      "checklist",
      []
    );

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

    const allItems = this.context.workspaceState.get<ChecklistItem[]>(
      "checklist",
      []
    );
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

  addTimer(item: ChecklistItem) {
    if (this.isTimerRunning && this.currentTimerItem?.id !== item.id) {
      vscode.window.showInformationMessage(
        "You can only have one timer running at a time"
      );
      return;
    }

    let allItems = this.context.workspaceState.get<ChecklistItem[]>(
      "checklist",
      []
    );

    if (this.currentTimerItem && this.currentTimerItem.id === item.id) {
      this.isTimerRunning = false;
      item.endTime = Date.now();
      item.timer = undefined;
      this.currentTimerItem = undefined;

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    } else {
      this.isTimerRunning = true;
      item.timer = Date.now();
      item.startTime = item.timer;
      this.currentTimerItem = item;

      this.timerInterval = setInterval(() => {
        if (this.isTimerRunning) {
          this._onDidChangeTreeData.fire(undefined);
        }
      }, 1000);
    }

    const items = allItems.map((el) => {
      if (el.id === item.id) {
        return { ...item };
      }

      return el;
    });

    this.context.workspaceState.update("checklist", items);
    this.refresh();
  }
}
