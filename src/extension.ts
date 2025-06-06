// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ChecklistProvider } from "./checklistProvider";
import { ChecklistItem } from "./types";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const checklistProvider = new ChecklistProvider(context);
  // register treedata provider with the extension
  vscode.window.registerTreeDataProvider("devchecklistView", checklistProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand("devchecklist.addHeader", async () => {
      const label = await vscode.window.showInputBox({
        prompt: "Enter new header title",
      });
      if (label) {
        checklistProvider.addHeader(label);
      }
    }),

    vscode.commands.registerCommand(
      "devchecklist.addItem",
      async (parent: ChecklistItem) => {
        const label = await vscode.window.showInputBox({
          prompt: "Enter new task",
        });
        if (label) {
          checklistProvider.addItem(label, parent.id);
        }
      }
    ),

    vscode.commands.registerCommand(
      "devchecklist.toggleCheck",
      (item: ChecklistItem) => {
        checklistProvider.toggleItem(item);
      }
    ),

    vscode.commands.registerCommand(
      "devchecklist.deleteItem",
      (item: ChecklistItem) => {
        checklistProvider.deleteItem(item);
      }
    ),

    vscode.commands.registerCommand(
      "devchecklist.addTimer",
      (item: ChecklistItem) => {
        checklistProvider.addTimer(item);
      }
    ),
    vscode.commands.registerCommand(
      "devchecklist.stopTimer",
      (item: ChecklistItem) => {
        checklistProvider.addTimer(item);
      }
    )
  );

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "devchecklist" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "devchecklist.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from devchecklist!");
    }
  );

  // context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
