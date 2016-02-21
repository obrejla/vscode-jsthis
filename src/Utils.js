'use strict';

var esprima = require('esprima');
var vscode = require('vscode');

var JAVASCRIPT_LANGUAGE_ID = 'javascript';

var lastValidSyntaxTree = null;
function resolveAst(text) {
    var result;
    try {
        result = esprima.parse(text);
        lastValidSyntaxTree = result;
    } catch (e) {
        result = lastValidSyntaxTree;
    }
    return result;
}

function loadSyntaxTree(document) {
    lastValidSyntaxTree = null;
    if (document.languageId === JAVASCRIPT_LANGUAGE_ID) {
        resolveAst(document.getText());
    }
}

function getThisVarNames() {
    return vscode.workspace.getConfiguration('jsthis.thisVarNames');
}

module.exports = {
    JAVASCRIPT_LANGUAGE_ID: JAVASCRIPT_LANGUAGE_ID,
    resolveAst: resolveAst,
    loadSyntaxTree: loadSyntaxTree,
    getThisVarNames: getThisVarNames
};