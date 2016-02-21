'use strict';

var vscode = require('vscode');
var utils = require('./Utils');
var thisCompletionItemProvider = require('./ThisCompletionItemProvider');

function activate(context) {

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(utils.JAVASCRIPT_LANGUAGE_ID, thisCompletionItemProvider));

    vscode.window.onDidChangeActiveTextEditor(function (event) {
        utils.loadSyntaxTree(event.document);
    }, null, context.subscriptions);

    var editor = vscode.window.activeTextEditor;
    if (editor) {
        var document = editor.document;
        // can not check languageId, document.languageId returns "vs.editor.modes.nullMode" even though the active file is javascript
        utils.resolveAst(document.getText());
    }

}
exports.activate = activate;

function deactivate() {
    // not implemented
}
exports.deactivate = deactivate;