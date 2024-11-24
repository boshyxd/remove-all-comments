const vscode = require('vscode');
// Size threshold for large files (in bytes)
const LARGE_FILE_THRESHOLD = 1024 * 1024; // 1MB
async function getDocumentTokens(text, languageId) {
    // Create a temporary untitled document with the text
    const document = await vscode.workspace.openTextDocument({
        content: text,
        language: languageId
    });
    // Get the semantic tokens legend and provider
    const provider = vscode.languages.getTokenProvider(languageId);
    if (!provider) {
        throw new Error('No token provider available for this language');
    }
    // Get the tokens
    const tokens = await provider.provideDocumentTokens(document, null);
    return { tokens, document };
}
async function removeComments(text, languageId) {
    try {
        // Check file size first
        if (text.length > LARGE_FILE_THRESHOLD) {
            console.log(`File size (${text.length} bytes) exceeds threshold. Using regex-based removal.`);
            return removeCommentsRegex(text, languageId);
        }
        // Get the document's semantic tokens
        const { tokens, document } = await getDocumentTokens(text, languageId);
        if (!tokens || !tokens.data || tokens.data.length === 0) {
            console.log('No semantic tokens available. Using regex-based removal.');
            return removeCommentsRegex(text, languageId);
        }
        // Convert the text to an array of characters for manipulation
        const chars = text.split('');
        const mask = new Array(chars.length).fill(true);
        // Process each token
        for (let i = 0; i < tokens.data.length; i += 5) {
            const tokenType = tokens.data[i + 3];
            // Check if this token is a comment
            if (tokenType === 1) { // 1 is typically the token type for comments
                const line = tokens.data[i];
                const char = tokens.data[i + 1];
                const length = tokens.data[i + 2];
                try {
                    // Convert line/char position to offset
                    const startPos = document.offsetAt(new vscode.Position(line, char));
                    const endPos = startPos + length;
                    // Mark the range for removal
                    for (let pos = startPos; pos < endPos && pos < mask.length; pos++) {
                        mask[pos] = false;
                    }
                } catch (posError) {
                    console.error('Error processing token position:', posError);
                    // Continue with other tokens
                }
            }
        }
        // Keep only the non-comment characters
        let result = chars.filter((char, index) => mask[index]).join('');
        // Clean up multiple blank lines but preserve one blank line
        result = result.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/\s+$/, '');
        return result;
    } catch (error) {
        console.error('Error in comment removal:', error);
        // Fallback to regex-based removal
        return removeCommentsRegex(text, languageId);
    }
}
// Keep the original regex-based implementation as fallback
function removeCommentsRegex(text, languageId) {
    const rules = getLanguageCommentRules(languageId);
    let result = text;
    // Store string literals (except triple-quoted strings in Python)
    const strings = [];
    let stringCount = 0;
    if (rules.stringEscapes) {
        // For Python, handle triple-quoted strings first
        if (rules.isPython && rules.docString) {
            result = result.replace(rules.docString, '');
        }
        // Now handle regular strings
        for (const quote of rules.stringEscapes) {
            const regex = new RegExp(`${quote}(?:[^${quote}\\\\]|\\\\.)*${quote}`, 'g');
            result = result.replace(regex, (match) => {
                strings.push(match);
                return `___STRING_${stringCount++}___`;
            });
        }
    }
    // Handle block comments
    if (rules.customBlockRegex) {
        result = result.replace(new RegExp(rules.customBlockRegex, 'g'), '');
    } else if (rules.blockStart && rules.blockEnd) {
        const blockRegex = new RegExp(`${rules.blockStart}[\\s\\S]*?${rules.blockEnd}`, 'g');
        result = result.replace(blockRegex, '');
    }
    // Handle single-line comments
    if (rules.line) {
        const lines = result.split('\n');
        result = lines
            .map(line => {
                // Remove comments at the end of lines
                return line.replace(new RegExp(`\\s*${rules.line}.*$`), '');
            })
            .join('\n');
    }
    // Restore strings in reverse order
    for (let i = strings.length - 1; i >= 0; i--) {
        result = result.replace(`___STRING_${i}___`, strings[i]);
    }
    // Clean up whitespace
    result = result
        .split('\n')
        .map(line => line.trimRight()) // Remove trailing spaces
        .join('\n')
        .replace(/\n{3,}/g, '\n\n') // Collapse multiple blank lines into two
        .replace(/^\s*\n/, '') // Remove leading blank lines
        .replace(/\n\s*$/, '\n'); // Ensure single trailing newline
    return result;
}
function getLanguageCommentRules(languageId) {
    const commentRules = {
        'javascript': { 
            line: '//', 
            blockStart: '/\\*', 
            blockEnd: '\\*/', 
            stringEscapes: ['"', "'", '`'] 
        },
        'python': { 
            line: '#',
            stringEscapes: ['"', "'"],
            docString: /'''[\s\S]*?'''|"""[\s\S]*?"""/g,
            isPython: true
        },
        'lua': { 
            line: '--(?!\\[\\[)',
            blockStart: '--\\[\\[',
            blockEnd: '\\]\\]',
            stringEscapes: ['"', "'"],
            customBlockRegex: '--\\[\\[[\\s\\S]*?\\]\\]'
        }
    };
    return commentRules[languageId] || commentRules.javascript;
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
        const cleaned = await removeComments(text, document.languageId);
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
                const cleaned = await removeComments(text, document.languageId);
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
