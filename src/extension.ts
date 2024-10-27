import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { CompletionItem, CompletionItemKind, type Disposable, Hover, MarkdownString } from 'vscode';

let outputChannel: vscode.OutputChannel;

interface IamActionData {
  access_level: string;
  action_name: string;
  description: string;
  url: string;
  condition_keys: Array<{ name: string; reference_href: string }>;
  resource_types: Array<{ name: string; reference_href: string }>;
}

class IamActionMappings {
  private iamActionsMap: Map<string, IamActionData> = new Map();
  private servicePrefixMap: Map<string, string[]> = new Map();

  constructor() {
    this.loadIamActionsMap();
  }

  private loadIamActionsMap() {
    const filePath = path.join(__dirname, '..', 'snippets', 'iam-actions.json');
    try {
      const rawData = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(rawData);

      for (const service in jsonData) {
        const servicePrefix = jsonData[service].service_prefix;
        this.servicePrefixMap.set(servicePrefix, []);

        for (const action in jsonData[service].actions) {
          const actionData = jsonData[service].actions[action];
          this.iamActionsMap.set(actionData.action_name, {
            ...actionData,
            condition_keys: actionData.condition_keys || [],
            resource_types: actionData.resource_types || [],
          });
          const servicePrefixActions = this.servicePrefixMap.get(servicePrefix);
          if (servicePrefixActions) {
            servicePrefixActions.push(actionData.action_name);
          } else {
            this.servicePrefixMap.set(servicePrefix, [actionData.action_name]);
          }
        }
      }

      outputChannel.appendLine(
        `Loaded ${this.iamActionsMap.size} IAM actions across ${this.servicePrefixMap.size} services`,
      );
    } catch (error) {
      outputChannel.appendLine(`Error loading IAM actions: ${error}`);
    }
  }

  public getIamActionData(action: string): IamActionData | undefined {
    return this.iamActionsMap.get(action);
  }

  public getMatchingActions(wildcardAction: string): string[] {
    const [servicePrefix, actionPattern] = wildcardAction.split(':');
    const regex = new RegExp(`^${actionPattern.replace('*', '.*')}$`);

    const serviceActions = this.servicePrefixMap.get(servicePrefix) || [];
    return serviceActions.filter((action) => regex.test(action.split(':')[1]));
  }

  public getAllIamActions(): string[] {
    return Array.from(this.iamActionsMap.keys());
  }
}

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('IAM Action Snippets');
  outputChannel.appendLine('IAM Action Snippets extension activated');

  const iamActionMappings = new IamActionMappings();
  const disposable: Disposable[] = [];

  // Register completion provider
  disposable.push(
    vscode.languages.registerCompletionItemProvider(['yaml', 'yml', 'json'], {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        if (isBelowActionKey(document, position)) {
          outputChannel.appendLine(`Providing completion items at position: ${position.line}:${position.character}`);
          return iamActionMappings
            .getAllIamActions()
            .map((action) => {
              const actionData = iamActionMappings.getIamActionData(action);
              if (actionData) {
                const item = new CompletionItem(action, CompletionItemKind.Value);
                item.detail = `IAM Action: ${action.split(':')[1]} (${actionData.access_level})`;
                item.documentation = new MarkdownString(`${actionData.description}\n\n${actionData.url}`);

                if (document.languageId === 'json') {
                  const lineText = document.lineAt(position.line).text;
                  const currentLineStripped = lineText.replace(/\s/g, '');
                  const nextLineText =
                    position.line + 1 < document.lineCount ? document.lineAt(position.line + 1).text : '';
                  const nextLineStripped = nextLineText.replace(/\s/g, '');

                  const isLastItem = currentLineStripped.endsWith(']') || nextLineStripped.startsWith(']');
                  const isFirstItem = currentLineStripped.endsWith('[') || lineText.trim() === '';

                  item.insertText = isFirstItem || isLastItem ? `"${action}"` : `"${action}",`;

                  if (!isFirstItem && !isLastItem && !currentLineStripped.endsWith(',')) {
                    item.insertText = `${!isFirstItem && !isLastItem && !currentLineStripped.endsWith(',') ? ',' : ''}${item.insertText}`;
                  }
                } else {
                  item.insertText = action;
                }

                return item;
              }
              return null;
            })
            .filter((item): item is CompletionItem => item !== null);
        }
        return undefined;
      },
    }),
  );

  // Register hover provider
  disposable.push(
    vscode.languages.registerHoverProvider(['yaml', 'yml', 'json'], {
      provideHover(document: vscode.TextDocument, position: vscode.Position) {
        const actionRegex = /[a-zA-Z0-9]+:[a-zA-Z0-9*]+/;
        const range = document.getWordRangeAtPosition(position, actionRegex);

        if (range) {
          const word = document.getText(range).replace(/^["']|["']$/g, '');
          outputChannel.appendLine(`Providing hover for: ${word}`);

          if (word.includes('*')) {
            const matchingActions = iamActionMappings.getMatchingActions(word);
            if (matchingActions.length > 0) {
              const content = new MarkdownString();
              content.isTrusted = true;

              content.appendMarkdown('| Matching IAM Actions | Description |\n');
              content.appendMarkdown('|:-------|:------------|\n');

              for (const action of matchingActions) {
                const actionData = iamActionMappings.getIamActionData(action);
                if (actionData) {
                  const description = actionData.description.replace(/\n/g, ' ');
                  const actionColumn = `[${action}](${actionData.url}) (${actionData.access_level})`;
                  content.appendMarkdown(`| ${actionColumn} | ${description} |\n`);
                }
              }
              return new Hover(content);
            }
          } else {
            const actionData = iamActionMappings.getIamActionData(word);
            if (actionData) {
              const content = new MarkdownString();
              content.isTrusted = true;

              const columns = [
                { header: 'IAM Action', data: `[${word}](${actionData.url}) (${actionData.access_level})` },
                { header: 'Description', data: actionData.description.replace(/\n/g, ' ') },
              ];

              // Add Resource Types with hyperlinks if not empty
              if (actionData.resource_types.length > 0) {
                const resourceLinks = actionData.resource_types
                  .map((resource) => `[${resource.name}](${resource.reference_href})`)
                  .join(', ');
                columns.push({ header: 'Resources', data: resourceLinks });
              }

              // Add Condition Keys with hyperlinks if not empty
              if (actionData.condition_keys.length > 0) {
                const conditionLinks = actionData.condition_keys
                  .map((condition) => `[${condition.name}](${condition.reference_href})`)
                  .join(', ');
                columns.push({ header: 'Condition Keys', data: conditionLinks });
              }

              // Create table headers
              content.appendMarkdown(`| ${columns.map((col) => col.header).join(' | ')} |\n`);
              content.appendMarkdown(`| ${columns.map(() => ':---').join(' | ')} |\n`);

              // Create table row
              content.appendMarkdown(`| ${columns.map((col) => col.data).join(' | ')} |\n`);

              return new Hover(content);
            }
          }
        }
        return null;
      },
    }),
  );

  context.subscriptions.push(...disposable);
}

export function deactivate() {
  outputChannel.appendLine('IAM Action Snippets extension deactivated');
}

function isBelowActionKey(document: vscode.TextDocument, position: vscode.Position): boolean {
  const maxLinesUp = 10;
  const startLine = Math.max(0, position.line - maxLinesUp);

  for (let i = position.line; i >= startLine; i--) {
    const line = document.lineAt(i).text.trim().toLowerCase();

    if (document.languageId === 'json') {
      if (line.includes('"action":') && line.includes('[')) {
        return true;
      }
      if (line.includes(']')) break;
    } else if (document.languageId === 'yaml' || document.languageId === 'yml') {
      if (
        line.startsWith('action:') ||
        line.startsWith('- action:') ||
        line.startsWith('notaction:') ||
        line.startsWith('- notaction:')
      ) {
        return true;
      }
      if (line !== '' && !line.startsWith('-') && !line.startsWith('- ') && !line.startsWith('#')) {
        break;
      }
    }
  }

  return false;
}
