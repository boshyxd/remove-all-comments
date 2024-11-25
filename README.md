# Remove All Comments

A [VSCode extension](https://open-vsx.org/extension/boshyxd/remove-all-comments) that helps you clean up your code by removing all comments, including docstrings, while preserving the functionality of your code. Perfect for preparing production code or cleaning up development files.

## Features

- 🔥 Remove comments with a keyboard shortcut (`Ctrl+Shift+/` or `Cmd+Shift+/`)
- ⚡ Optional automatic comment removal on file save
- 🌍 Multi-language support with language-specific handling
- 💪 Preserves string literals and code structure
- 🎯 Removes all types of comments including docstrings
- ⚙️ Configurable settings

## Supported Languages

Each language has specialized support for its comment syntax:

### Python
- Single-line comments (#)
- Docstrings (''' and """)
- Multi-line string comments

### JavaScript/TypeScript
- Single-line comments (//)
- Multi-line comments (/* */)
- JSDoc comments

### Lua
- Single-line comments (--)
- Multi-line comments (--[[ ]])

### Additional Languages
- C/C++
- HTML
- Shell scripts
- Ruby
- Matlab/Octave
- And more! (Falls back to language-specific comment detection)

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

### Python
```python
# Single line comment
class Example:
    '''
    This docstring will be removed
    '''
    def method(self):
        """This docstring will also be removed"""
        return "Hello"  # This comment goes away
```
After:
```python
class Example:
    def method(self):
        return "Hello"
```

### JavaScript
```javascript
// Single line comment
function hello() {
    /* Multi-line
       comment */
    console.log("Hello"); // Inline comment
}
```
After:
```javascript
function hello() {
    console.log("Hello");
}
```

### Lua
```lua
-- Single line comment
function hello()
    --[[
        Multi-line comment
        in Lua
    ]]
    print("Hello") -- Inline comment
end
```
After:
```lua
function hello()
    print("Hello")
end
```

## Features Preserved

- String literals (comments inside strings are preserved)
- Code structure and formatting
- Multi-line strings (when not used as comments)
- Template literals
- Regular expressions

## What's New in 1.1.0

- Added support for removing Python docstrings
- Improved language-specific comment detection
- Enhanced string literal preservation
- Better handling of multi-line comments
- Fixed issues with nested comments
- Added more language support

## Contributing

Found a bug or want to contribute? Visit our [GitHub repository](https://github.com/boshyxd/remove-all-comments)!

## License

This extension is licensed under the [MIT License](LICENSE).
