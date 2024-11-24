# Remove All Comments

A VSCode extension that removes all comments from your code files. This extension supports multiple programming languages and their specific comment syntaxes.

## Features

- Remove comments with a keyboard shortcut (Ctrl+Shift+/ or Cmd+Shift+/ on Mac)
- Option to automatically remove comments when saving files
- Multi-language support with language-specific comment handling
- Removes empty lines created by comment removal
- Cleans up extra whitespace

## Supported Languages

The extension supports various programming languages including:

- Lua (-- and --[[ ]])
- JavaScript/TypeScript (// and /* */)
- Python (# and """)
- HTML (<!-- -->)
- Shell scripts (#)
- Ruby (# and =begin/=end)
- Matlab/Octave (% and %{ %})
- And more (falls back to C-style comments for unsupported languages)

## Usage

### Manual Removal
1. Open any code file
2. Press `Ctrl+Shift+/` (`Cmd+Shift+/` on Mac) to remove all comments
3. The file will be updated with all comments removed

### Automatic Removal on Save
1. Open VSCode Settings
2. Search for "Remove All Comments"
3. Enable the "Remove On Save" option
4. Comments will be automatically removed when saving files

## Extension Settings

This extension contributes the following settings:

* `removeAllComments.removeOnSave`: Enable/disable automatic comment removal when saving files

## Known Issues

- Some languages might have special comment syntaxes that are not yet supported
- Nested comments in some languages might not be handled correctly
- String literals containing comment-like patterns might be affected in some cases

## Release Notes

### 1.0.0

Initial release of Remove All Comments with multi-language support
