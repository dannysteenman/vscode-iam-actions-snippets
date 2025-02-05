import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { type Disposable, Hover, MarkdownString } from 'vscode';

const DEBUG_ENABLED = false;
export const outputChannel = vscode.window.createOutputChannel('IAM Action Snippets');

export function log(message: string) {
  if (DEBUG_ENABLED) {
    outputChannel.appendLine(`[DEBUG] ${message}`);
  }
}

interface IamActionData {
  access_level: string;
  action_name: string;
  description: string;
  url: string;
  condition_keys: Array<{ name: string; reference_href: string }>;
  resource_types: Array<{ name: string; reference_href: string }>;
}

class IamActionMappings {
  private iamActionsMap: Map<string, IamActionData> | null = null;
  private servicePrefixMap: Map<string, Set<string>> | null = null;
  private loadingPromise: Promise<void> | null = null;

  private async ensureDataLoaded(): Promise<void> {
    if (!this.loadingPromise) {
      this.loadingPromise = this.loadIamActionsMap();
    }
    await this.loadingPromise;
  }

  private async loadIamActionsMap(): Promise<void> {
    const filePath = path.join(__dirname, '..', 'snippets', 'iam-actions.json');
    try {
      const rawData = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(rawData);

      this.iamActionsMap = new Map();
      this.servicePrefixMap = new Map();

      for (const service in jsonData) {
        const servicePrefix = jsonData[service].service_prefix;
        let servicePrefixSet = this.servicePrefixMap.get(servicePrefix);

        if (!servicePrefixSet) {
          servicePrefixSet = new Set<string>();
          this.servicePrefixMap.set(servicePrefix, servicePrefixSet);
        }

        for (const action in jsonData[service].actions) {
          const actionData = jsonData[service].actions[action];
          this.iamActionsMap.set(actionData.action_name, {
            ...actionData,
            condition_keys: actionData.condition_keys || [],
            resource_types: actionData.resource_types || [],
          });
          servicePrefixSet.add(actionData.action_name);
        }
      }

      log(`Loaded ${this.iamActionsMap.size} IAM actions across ${this.servicePrefixMap.size} services`);
    } catch (error) {
      log(`Error loading IAM actions: ${error}`);
    }
  }

  public async getIamActionData(action: string): Promise<IamActionData | undefined> {
    await this.ensureDataLoaded();
    if (this.iamActionsMap) {
      return this.iamActionsMap.get(action);
    }
    return undefined;
  }

  public async getMatchingActions(wildcardAction: string): Promise<string[]> {
    await this.ensureDataLoaded();

    if (!this.servicePrefixMap) {
      return [];
    }

    const [servicePrefix, actionPattern] = wildcardAction.split(':');
    const regex = new RegExp(`^${actionPattern.replace(/\*/g, '.*')}$`, 'i');

    const serviceActions = this.servicePrefixMap.get(servicePrefix) || new Set<string>();
    return Array.from(serviceActions).filter((action) => {
      const parts = action.split(':');
      return parts.length > 1 && regex.test(parts[1]);
    });
  }

  public async getAllIamActions(): Promise<string[]> {
    await this.ensureDataLoaded();

    if (!this.iamActionsMap) {
      return [];
    }

    return Array.from(this.iamActionsMap.keys());
  }
}

export function activate(context: vscode.ExtensionContext) {
  if (DEBUG_ENABLED) {
    log('IAM Action Snippets extension activated (debug mode)');
  } else {
    outputChannel.appendLine('IAM Action Snippets extension activated');
  }

  const iamActionMappings = new IamActionMappings();
  const disposable: Disposable[] = [];

  // Register completion provider
  disposable.push(
    vscode.languages.registerCompletionItemProvider(
      ['json', 'yaml', 'yml', 'terraform', 'typescript', 'python'],
      {
        async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
          if (await isBelowActionKey(document, position)) {
            log(`Providing completion items at position: ${position.line}:${position.character}`);
            const allActions = await iamActionMappings.getAllIamActions();
            return Promise.all(
              allActions.map(async (action) => {
                const actionData = await iamActionMappings.getIamActionData(action);
                if (actionData) {
                  const item = new vscode.CompletionItem(action, vscode.CompletionItemKind.Value);
                  item.detail = `IAM Action: ${action.split(':')[1]} (${actionData.access_level})`;
                  item.documentation = new vscode.MarkdownString(`${actionData.description}\n\n${actionData.url}`);

                  if (document.languageId === 'json' || document.languageId === 'terraform') {
                    const lineText = document.lineAt(position.line).text;
                    const currentLineStripped = lineText.trim();
                    const nextLineText =
                      position.line + 1 < document.lineCount ? document.lineAt(position.line + 1).text : '';
                    const nextLineStripped = nextLineText.trim();

                    const isInQuotes =
                      currentLineStripped.indexOf('"') !== -1 &&
                      currentLineStripped.lastIndexOf('"') > currentLineStripped.indexOf('"');
                    const isFirstItem = currentLineStripped.endsWith('[') || currentLineStripped === '';
                    const isLastItem = currentLineStripped.endsWith(']') || nextLineStripped.startsWith(']');

                    if (!isInQuotes) {
                      let insertText = `"${action}"`;
                      if (isFirstItem && currentLineStripped.endsWith('[')) {
                        insertText = '\n  ' + insertText;
                      }
                      if (!isLastItem && !currentLineStripped.endsWith(',') && !currentLineStripped.endsWith('[')) {
                        insertText += ',';
                      }
                      item.insertText = insertText;
                    } else {
                      // When in quotes, just insert the action name
                      item.insertText = action;
                      if (!isLastItem) {
                        // Add only a comma after the action when it's not the last item
                        item.additionalTextEdits = [
                          vscode.TextEdit.insert(
                            new vscode.Position(position.line, position.character + action.length),
                            ',',
                          ),
                        ];
                      }
                    }
                  } else if (document.languageId === 'typescript') {
                    const lineText = document.lineAt(position.line).text;
                    const currentLineStripped = lineText.trim();
                    const nextLineText =
                      position.line + 1 < document.lineCount ? document.lineAt(position.line + 1).text : '';
                    const nextLineStripped = nextLineText.trim();

                    const isInQuotes =
                      currentLineStripped.indexOf("'") !== -1 &&
                      currentLineStripped.lastIndexOf("'") > currentLineStripped.indexOf("'");
                    const isFirstItem = currentLineStripped.endsWith('[') || currentLineStripped === '';
                    const isLastItem = currentLineStripped.endsWith(']') || nextLineStripped.startsWith(']');

                    if (!isInQuotes) {
                      let insertText = `'${action}'`;
                      if (isFirstItem && currentLineStripped.endsWith('[')) {
                        insertText = '\n  ' + insertText;
                      }
                      if (!isLastItem && !currentLineStripped.endsWith(',') && !currentLineStripped.endsWith('[')) {
                        insertText += ',';
                      }
                      item.insertText = insertText;
                    } else {
                      item.insertText = action;
                      if (!isLastItem) {
                        item.additionalTextEdits = [
                          vscode.TextEdit.insert(
                            new vscode.Position(position.line, position.character + action.length),
                            ',',
                          ),
                        ];
                      }
                    }
                  } else if (document.languageId === 'python') {
                    const lineText = document.lineAt(position.line).text;
                    const currentLineStripped = lineText.trim();
                    const nextLineText =
                      position.line + 1 < document.lineCount ? document.lineAt(position.line + 1).text : '';
                    const nextLineStripped = nextLineText.trim();

                    const isInQuotes =
                      currentLineStripped.indexOf('"') !== -1 &&
                      currentLineStripped.lastIndexOf('"') > currentLineStripped.indexOf('"');
                    const isFirstItem = currentLineStripped.endsWith('[') || currentLineStripped === '';
                    const isLastItem = currentLineStripped.endsWith(']') || nextLineStripped.startsWith(']');

                    if (!isInQuotes) {
                      let insertText = `"${action}"`;
                      if (isFirstItem && currentLineStripped.endsWith('[')) {
                        insertText = '\n    ' + insertText; // Use 4 spaces for Python indentation
                      }
                      if (!isLastItem && !currentLineStripped.endsWith(',') && !currentLineStripped.endsWith('[')) {
                        insertText += ',';
                      }
                      item.insertText = insertText;
                    } else {
                      item.insertText = action;
                      if (!isLastItem) {
                        item.additionalTextEdits = [
                          vscode.TextEdit.insert(
                            new vscode.Position(position.line, position.character + action.length),
                            ',',
                          ),
                        ];
                      }
                    }
                  } else {
                    item.insertText = action;
                  }

                  return item;
                }
                return null;
              }),
            ).then((items) => items.filter((item): item is vscode.CompletionItem => item !== null));
          }
          return undefined;
        },
      },
      '"', // Trigger when typing a double quote
      "'", // Trigger when typing a single quote
    ),
  );

  // Register hover provider
  disposable.push(
    vscode.languages.registerHoverProvider(['yaml', 'yml', 'json', 'terraform', 'typescript', 'python'], {
      async provideHover(document: vscode.TextDocument, position: vscode.Position) {
        const actionRegex = /["'][a-zA-Z0-9]+:[a-zA-Z0-9*]+["']|[a-zA-Z0-9]+:[a-zA-Z0-9*]+/;
        const range = document.getWordRangeAtPosition(position, actionRegex);

        if (range) {
          const word = document.getText(range).replace(/^["']|["']$/g, '');
          log(`Providing hover for: ${word}`);

          if (word.includes('*')) {
            const matchingActions = await iamActionMappings.getMatchingActions(word);
            if (matchingActions.length > 0) {
              const content = new MarkdownString();
              content.isTrusted = true;

              content.appendMarkdown(`### Matching IAM Actions for "${word}"\n\n`);
              content.appendMarkdown('| Action | Description | Access Level |\n');
              content.appendMarkdown('|:-------|:------------|:-------------|\n');

              for (const action of matchingActions) {
                const actionData = await iamActionMappings.getIamActionData(action);
                if (actionData) {
                  const description = actionData.description.replace(/\n/g, ' ');
                  const actionColumn = `[${action}](${actionData.url})`;
                  content.appendMarkdown(`| ${actionColumn} | ${description} | ${actionData.access_level} |\n`);
                }
              }

              content.appendMarkdown(`\n**Total matching actions:** ${matchingActions.length}`);

              return new Hover(content);
            }
          } else {
            const actionData = await iamActionMappings.getIamActionData(word);
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
  log('IAM Action Snippets extension deactivated');
}

async function isBelowActionKey(document: vscode.TextDocument, position: vscode.Position): Promise<boolean> {
  // Use the full text from the top of the document until the current position
  const text = document.getText(new vscode.Range(new vscode.Position(0, 0), position));

  // JSON and Terraform
  if (document.languageId === 'json' || document.languageId === 'terraform') {
    const lines = text.split('\n').reverse();
    const jsonRegex = /"action"\s*:\s*\[/i;
    const terraformRegex = /action\s*=\s*\[/i;
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (document.languageId === 'json' && jsonRegex.test(trimmedLine)) {
        return true;
      }
      if (document.languageId === 'terraform' && terraformRegex.test(trimmedLine)) {
        return true;
      }
      if (trimmedLine.startsWith('}') || trimmedLine.startsWith(']')) {
        break;
      }
    }
  }

  // YAML / YML
  if (document.languageId === 'yaml' || document.languageId === 'yml') {
    const allLines = document.getText().split('\n');
    const currentLineIndex = position.line;
    const currentLine = allLines[currentLineIndex] || '';
    const currentIndent = currentLine.search(/\S/);
    log(`[YAML] Current line (${currentLineIndex}): ${currentLine}`);
    log(`[YAML] Current indent: ${currentIndent}`);

    // If the current line itself is a key, disable autocomplete.
    if (/^[-\s]*\w+\s*:/.test(currentLine)) {
      log('[YAML] Current line appears to be a key, disabling autocomplete');
      return false;
    }

    // Scan upward for the nearest parent key with lower indent
    for (let i = currentLineIndex - 1; i >= 0; i--) {
      const line = allLines[i];
      const trimmedLine = line.trim();
      if (trimmedLine === '' || trimmedLine.startsWith('#')) {
        continue;
      }
      if (!line.includes(':')) {
        continue;
      }
      log(`[YAML] Scanning line ${i}: ${line}`);
      const match = line.match(/^([ \t]*)(?:-\s*)?(\w+)\s*:/);
      if (match) {
        const parentIndent = match[1].length;
        if (parentIndent < currentIndent) {
          const parentKey = match[2].toLowerCase();
          log(`[YAML] Found parent key: ${parentKey} at indent: ${parentIndent}`);
          if (parentKey === 'action') {
            log(`[YAML] Position is under 'action' key, enabling autocomplete`);
            return true;
          }
          log(`[YAML] Parent key is not 'action', stopping search.`);
          break;
        }
      }
    }
  }

  // CDK TypeScript
  if (document.languageId === 'typescript') {
    const allLines = document.getText().split('\n');
    const currentLineIndex = position.line;
    const currentLine = allLines[currentLineIndex] || '';
    const currentIndent = currentLine.search(/\S/);
    log(`[TS] Current line (${currentLineIndex}): ${currentLine}`);
    log(`[TS] Current indent: ${currentIndent}`);

    const actionsRegex = /actions\s*:\s*\[/;
    for (let i = currentLineIndex; i >= 0; i--) {
      const line = allLines[i];
      log(`[TS] Scanning line ${i}: ${line}`);
      if (actionsRegex.test(line)) {
        const match = line.match(/^(\s*)/);
        const parentIndent = match ? match[1].length : 0;
        if (currentIndent > parentIndent) {
          log(`[TS] Found actions array starting at line ${i}, enabling autocomplete`);
          return true;
        }
        break;
      }
    }
  }

  // CDK Python
  if (document.languageId === 'python') {
    const allLines = document.getText().split('\n');
    const currentLineIndex = position.line;
    const currentLine = allLines[currentLineIndex] || '';
    const currentIndent = currentLine.search(/\S/);
    log(`[Python] Current line (${currentLineIndex}): ${currentLine}`);
    log(`[Python] Current indent: ${currentIndent}`);

    const actionsRegex = /actions\s*=\s*\[/;
    for (let i = currentLineIndex; i >= 0; i--) {
      const line = allLines[i];
      log(`[Python] Scanning line ${i}: ${line}`);
      if (actionsRegex.test(line)) {
        const match = line.match(/^(\s*)/);
        const parentIndent = match ? match[1].length : 0;
        if (currentIndent > parentIndent) {
          log(`[Python] Found actions list starting at line ${i}, enabling autocomplete`);
          return true;
        }
        break;
      }
    }
  }
  return false;
}
