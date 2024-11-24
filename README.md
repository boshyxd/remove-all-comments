# Remove All Comments

A VSCode extension that helps you clean up your code by removing all comments while preserving the functionality of your code. Perfect for preparing production code or cleaning up development files.

## Features

- 🔥 Remove comments with a keyboard shortcut (`Ctrl+Shift+/` or `Cmd+Shift+/`)
- ⚡ Optional automatic comment removal on file save
- 🌍 Multi-language support
- 💪 Preserves string literals and code structure
- ⚙️ Configurable settings

## Supported Languages

- JavaScript/TypeScript
- Python
- Lua
- HTML
- Shell scripts
- Ruby
- Matlab/Octave
- And more! (Falls back to C-style comment removal for unsupported languages)

## Installation

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Remove All Comments"
4. Click Install

Or install from [Open VSX Registry](https://open-vsx.org/extension/boshyxd/remove-all-comments)

## Usage

### Manual Removal
1. Open any supported file
2. Press `Ctrl+Shift+/` (Windows/Linux) or `Cmd+Shift+/` (Mac)
3. All comments will be removed while preserving your code

### Automatic Removal on Save
1. Open Settings (Ctrl+,)
2. Search for "Remove All Comments"
3. Enable "Remove On Save" option
4. Comments will be automatically removed each time you save the file

## Configuration

This extension contributes the following settings:

* `removeAllComments.removeOnSave`: Enable/disable automatic comment removal when saving files (default: `false`)

## Examples

### Before:
```javascript
// This is a comment
function hello() {
    /* Multi-line
       comment */
    console.log("Hello"); // Inline comment
}
```

### After:
```javascript
function hello() {
    console.log("Hello");
}
```

## Features Preserved

- String literals (comments inside strings are preserved)
- Code structure and formatting
- Multi-line strings
- Template literals
- Regular expressions

## Contributing

Found a bug or want to contribute? Visit our [GitHub repository](https://github.com/boshyxd/remove-all-comments)!

## License

This extension is licensed under the [MIT License](LICENSE).
