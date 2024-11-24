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

function getLanguageCommentRules(languageId) {
    const commentRules = {
        javascript: {
            line: '//',
            blockStart: '/\\*',
            blockEnd: '\\*/',
            stringEscapes: ['"', "'", '`']
        },
        python: {
            line: '#',
            docStart: /^\s*('''|""")/, // Docstrings at start of line
            docEnd: /('''|""")$/,      // Docstrings at end of line
            stringEscapes: ['"', "'"]
        },
        lua: {
            line: '--(?!\\[\\[)',
            blockStart: '--\\[\\[',
            blockEnd: '\\]\\]',
            stringEscapes: ['"', "'"]
        }
    };
    return commentRules[languageId] || commentRules.javascript;
}

// Optimized regex-based implementation for large files
function removeCommentsRegex(text, languageId) {
    const rules = getLanguageCommentRules(languageId);
    
    try {
        let result = text;
        
        // Special handling for Python docstrings
        if (languageId === 'python') {
            const lines = result.split(/\r?\n/);
            const processedLines = [];
            let inDocstring = false;
            let docstringQuote = '';
            let indentation = '';
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmedLine = line.trim();
                
                if (!inDocstring) {
                    // Check for docstring start
                    const docMatch = trimmedLine.match(/^('''|""").*?('''|""")$/);
                    const docStartMatch = trimmedLine.match(/^('''|""")/);
                    
                    if (docMatch) {
                        // Single line docstring - skip it
                        continue;
                    } else if (docStartMatch) {
                        // Start of multi-line docstring
                        inDocstring = true;
                        docstringQuote = docStartMatch[1];
                        // Get the indentation level
                        indentation = line.match(/^\s*/)[0];
                    } else {
                        // Regular line, process for # comments
                        let processedLine = '';
                        let inString = false;
                        let stringChar = '';
                        
                        for (let j = 0; j < line.length; j++) {
                            if (!inString) {
                                if (rules.stringEscapes.includes(line[j])) {
                                    inString = true;
                                    stringChar = line[j];
                                    processedLine += line[j];
                                } else if (line[j] === '#') {
                                    break;
                                } else {
                                    processedLine += line[j];
                                }
                            } else {
                                processedLine += line[j];
                                if (line[j] === stringChar && line[j-1] !== '\\') {
                                    inString = false;
                                }
                            }
                        }
                        
                        if (processedLine.trim()) {
                            processedLines.push(processedLine);
                        }
                    }
                } else {
                    // Check for docstring end
                    const docEndMatch = trimmedLine.match(new RegExp(docstringQuote + '$'));
                    if (docEndMatch && line.trim().startsWith(docstringQuote)) {
                        inDocstring = false;
                    }
                }
            }
            
            result = processedLines.join('\n');
        } else {
            // Handle block comments for other languages
            if (rules.blockStart && rules.blockEnd) {
                const blockRegex = new RegExp(rules.blockStart + '[\\s\\S]*?' + rules.blockEnd, 'g');
                result = result.replace(blockRegex, '');
            }

            // Handle line comments
            const lines = result.split(/\r?\n/);
            const processedLines = [];
            
            for (let line of lines) {
                let processedLine = '';
                let inString = false;
                let stringChar = '';
                let i = 0;
                
                while (i < line.length) {
                    if (!inString) {
                        if (rules.stringEscapes && rules.stringEscapes.includes(line[i])) {
                            inString = true;
                            stringChar = line[i];
                            processedLine += line[i];
                        } else if (
                            (languageId === 'lua' && line.startsWith('--', i) && !line.startsWith('--[[', i)) ||
                            (languageId === 'javascript' && line.startsWith('//', i)) ||
                            (languageId === 'cpp' && line.startsWith('//', i))
                        ) {
                            break;
                        } else {
                            processedLine += line[i];
                        }
                    } else {
                        processedLine += line[i];
                        if (line[i] === stringChar && line[i-1] !== '\\') {
                            inString = false;
                        }
                    }
                    i++;
                }
                
                if (processedLine.trim()) {
                    processedLines.push(processedLine);
                }
            }
            
            result = processedLines.join('\n');
        }
        
        // Clean up whitespace
        result = result
            .replace(/\n\s*\n\s*\n/g, '\n\n')  // Collapse multiple blank lines
            .replace(/^\s+|\s+$/g, '')          // Trim start and end
            + '\n';                             // Ensure single trailing newline
        
        return result;
    } catch (error) {
        console.error('Error in regex-based comment removal:', error);
        // Return original text if something goes wrong
        return text;
    }
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
