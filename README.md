# Better IntelliSense for JavaScript "this" keyword

[![Build Status](https://travis-ci.org/obrejla/vscode-jsthis.svg?branch=master)](https://travis-ci.org/obrejla/vscode-jsthis)

This extension adds a better IntelliSense of the "this" keyword in JavaScript files. It tries to collect all `this.<property>` usages, assignments to a `prototype` property and then suggest them in the IntelliSense popup.

For simplicity no context resolving is applied, all `this` usages are considered to be of one object.

You can also define an extra variable names to be treated the same way (e.g. `self`, `that`, etc.) in options.

## IDE Feature

![IntelliSense - Code Completion](http://s7.postimg.org/v6m1n9juj/vscode_jsthis_example.png)

## Using

You will need to install [Visual Studio Code](https://code.visualstudio.com/) `0.10`. In the command palette select `Install Extension` and choose `JsThis`.

### Options

The following Visual Studio Code settings are available for the JsThis extension.  These can be set in user preferences or workspace settings (`.vscode/settings.json`).

```javascript
{
	"jsthis.thisVarNames": ["self"]
}
```

## License

[MIT](LICENSE)