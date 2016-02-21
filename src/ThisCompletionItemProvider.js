'use strict';

var estraverse = require('estraverse');
var vscode = require('vscode');
var utils = require('./Utils');

var CompletionItem = vscode.CompletionItem;
var CompletionList = vscode.CompletionList;
var CompletionItemKind = vscode.CompletionItemKind;

var ASSIGNMENT_EXPRESSION = 'AssignmentExpression';
var CALL_EXPRESSION = 'CallExpression';
var FUNCTION_EXPRESSION = 'FunctionExpression';
var MEMBER_EXPRESSION = 'MemberExpression';
var THIS_EXPRESSION = 'ThisExpression';
var IDENTIFIER = 'Identifier';
var VARIABLE_DECLARATOR = 'VariableDeclarator';
var THIS = 'this';
var PROTOTYPE = 'prototype';
var CALLABLE_SUFFIX = '()';

var alsoThisVars = utils.getThisVarNames();
var completionItems = [];
var selfCompletionItems = [];
var processedLabels = [];
var includeSelfItems = false;

function shouldComplete(document, position) {
    var currentWordRange = document.getWordRangeAtPosition(position);
    var previousWordDiffOffset = currentWordRange ? (position.character - currentWordRange.start.character + 1) * -1 : -1;
    var previousWord = document.getText(document.getWordRangeAtPosition(position.translate(0, previousWordDiffOffset)));
    return previousWord === THIS || alsoThisVars.indexOf(previousWord) !== -1;
}

function prepareCompletionItems(document) {
    estraverse.traverse(utils.resolveAst(document.getText()), {
        enter: function (node, parent) {
            if (node.type === VARIABLE_DECLARATOR) {
                processVariableDeclarator(node);
            }
            if (node.type === ASSIGNMENT_EXPRESSION) {
                processAssignmentExpression(node);
            }
            if (node.type === MEMBER_EXPRESSION) {
                processMemberExpression(node, parent);
            }
        }
    });
    if (includeSelfItems) {
        completionItems = completionItems.concat(selfCompletionItems);
    }
}

function processVariableDeclarator(node) {
    if (node.id.type === IDENTIFIER && alsoThisVars.indexOf(node.id.name) !== -1) {
        includeSelfItems = true;
    }
}

function processAssignmentExpression(node) {
    if (node.left.type === MEMBER_EXPRESSION && node.left.object.type === MEMBER_EXPRESSION && node.left.object.property.type === IDENTIFIER
            && node.left.object.property.name === PROTOTYPE) {
        var label = node.left.property.name;
        var insertText = label;
        var kind = CompletionItemKind.Field;
        if (node.right.type === IDENTIFIER) {
            kind = resolveTypeOfProperty(label);
        } else if (node.right.type === FUNCTION_EXPRESSION) {
            insertText = node.left.property.name + CALLABLE_SUFFIX;
            kind = CompletionItemKind.Method;
        }
        var completionItem = new CompletionItem(label);
        completionItem.kind = kind;
        completionItem.insertText = insertText;
        completionItems.push(completionItem);
    }
}

function processMemberExpression(node, parent) {
    if (node.computed === false && node.property.type === IDENTIFIER) {
        var completionItem = null;
        if (node.object.type === THIS_EXPRESSION) {
            completionItem = createCompletionItem(node, parent);
            if (completionItem) {
                completionItems.push(completionItem);
            }
        } else if (node.object.type === IDENTIFIER && alsoThisVars.indexOf(node.object.name) !== -1) {
            completionItem = createCompletionItem(node, parent);
            if (completionItem) {
                selfCompletionItems.push(completionItem);
            }
        }
    }
}

function createCompletionItem(node, parent) {
    var completionItem = null;
    var kind = CompletionItemKind.Field;
    var label = node.property.name;
    var insertText = label;
    if (processedLabels.indexOf(label) === -1) {
        processedLabels.push(label);
        completionItem = new CompletionItem(label);
        if (parent.type === MEMBER_EXPRESSION) {
            kind = resolveTypeOfProperty(label);
        } else if (parent.type === CALL_EXPRESSION) {
            if (parent.callee === node) {
                // method call
                kind = CompletionItemKind.Method;
                insertText += CALLABLE_SUFFIX;
            } else {
                // field access as a function param
                kind = resolveTypeOfProperty(label);
            }
        }
        completionItem.insertText = insertText;
        completionItem.kind = kind;
    }
    return completionItem;
}

function resolveTypeOfProperty(label) {
    var result = CompletionItemKind.Field;
    if (label.toUpperCase() === label) {
        result = CompletionItemKind.Enum;
    }
    return result;
}

module.exports = {
    provideCompletionItems: function (document, position, cancellationToken) {
        alsoThisVars = utils.getThisVarNames();
        completionItems = [];
        selfCompletionItems = [];
        includeSelfItems = false;
        processedLabels = [];

        if (shouldComplete(document, position)) {
            prepareCompletionItems(document);
        } else {
            // try to reload cached AST
            utils.loadSyntaxTree(document);
        }

        return new CompletionList(completionItems, false);
    }
};