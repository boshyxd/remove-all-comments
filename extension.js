const vscode = require('vscode');

function getLanguageCommentRules(languageId) {
    // Define comment patterns for different languages
    const commentRules = {
        // Default patterns (JavaScript/TypeScript)
        default: {
            line: '//',
            blockStart: '/\\*',
            blockEnd: '\\*/',
            stringEscapes: ['"', "'"]
        },
        // Lua
        lua: {
            line: '--(?!\\[\\[)',  // -- but not --[[
            blockStart: '--\\[\\[',
            blockEnd: '\\]\\]',
            stringEscapes: ['"', "'"]
        },
        // Python
        python: {
            line: '#',
            blockStart: '"""',
            blockEnd: '"""',
            stringEscapes: ['"', "'"]
        },
        // HTML
        html: {
            line: null,
            blockStart: '<!--',
            blockEnd: '-->'
        },
        // Shell scripts
        shellscript: {
            line: '#',
            blockStart: null,
            blockEnd: null
        },
        // Ruby
        ruby: {
            line: '#',
            blockStart: '=begin',
            blockEnd: '=end',
            stringEscapes: ['"', "'"]
        },
        // Matlab/Octave
        matlab: {
            line: '%',
            blockStart: '%{',
            blockEnd: '%}'
        }
    };

    return commentRules[languageId] || commentRules.default;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeComments(text, languageId) {
    const rules = getLanguageCommentRules(languageId);
    let result = text;
    
    // First, extract and store string literals
    const strings = [];
    const stringPlaceholder = '___STRING_PLACEHOLDER___';
    
    // Extract and store strings
    if (rules.stringEscapes) {
        for (const quote of rules.stringEscapes) {
            const stringRegex = new RegExp(`${escapeRegExp(quote)}(?:\\\\${escapeRegExp(quote)}|[^${escapeRegExp(quote)}])*?${escapeRegExp(quote)}`, 'g');
            result = result.replace(stringRegex, (match) => {
                strings.push(match);
                return stringPlaceholder + (strings.length - 1);
            });
        }
    }

    // Remove block comments first (handling multi-line)
    if (rules.blockStart && rules.blockEnd) {
        const blockCommentRegex = new RegExp(`${rules.blockStart}[\\s\\S]*?${rules.blockEnd}`, 'g');
        result = result.replace(blockCommentRegex, '');
    }

    // Now process line by line for single-line comments
    let lines = result.split(/(\r?\n)/);
    result = '';
    
    // Process each line
    for (let i = 0; i < lines.length; i += 2) {
        let line = lines[i];
        const lineEnding = lines[i + 1] || '';
        
        // Check if the line contains only a comment (with optional whitespace)
        let isOnlyComment = false;
        if (rules.line) {
            const lineCommentRegex = new RegExp(`^\\s*${rules.line}.*$`);
            isOnlyComment = lineCommentRegex.test(line);
        }

        if (!isOnlyComment) {
            // If line contains code + comment, remove just the comment
            if (rules.line) {
                const lineCommentRegex = new RegExp(`${rules.line}.*$`, 'g');
                line = line.replace(lineCommentRegex, '');
            }

            // Trim trailing whitespace but preserve indentation
            line = line.replace(/\s+$/, '');

            // Add the processed line and its ending back
            result += line + lineEnding;
        }
    }

    // Restore string literals
    if (strings.length > 0) {
        for (let i = 0; i < strings.length; i++) {
            result = result.replace(stringPlaceholder + i, strings[i]);
        }
    }

    // Clean up multiple blank lines but preserve one blank line
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Remove trailing whitespace at the end of file
    result = result.replace(/\s+$/, '');

    return result;
}

function activate(context) {
    console.log('Remove All Comments extension is now active');

    let disposable = vscode.commands.registerCommand('remove-all-comments.removeComments', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const text = document.getText();
        const cleaned = removeComments(text, document.languageId);

        await editor.edit(editBuilder => {
            const entireRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
            );
            editBuilder.replace(entireRange, cleaned);
        });
    });

    // Register a save event handler
    let saveDisposable = vscode.workspace.onWillSaveTextDocument(async e => {
        const config = vscode.workspace.getConfiguration('removeAllComments');
        const removeOnSave = config.get('removeOnSave');
        console.log('Save triggered, removeOnSave:', removeOnSave);

        if (removeOnSave) {
            const document = e.document;
            const editor = vscode.window.activeTextEditor;
            
            if (editor && editor.document === document) {
                const text = document.getText();
                const cleaned = removeComments(text, document.languageId);

                e.waitUntil(
                    editor.edit(editBuilder => {
                        const entireRange = new vscode.Range(
                            document.positionAt(0),
                            document.positionAt(text.length)
                        );
                        editBuilder.replace(entireRange, cleaned);
                    })
                );
            }
        }
    });

    context.subscriptions.push(disposable, saveDisposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
