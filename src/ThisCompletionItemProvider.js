'use strict';

var estraverse = require('estraverse');
var vscode = require('vscode');
var utils = require('./Utils');

var CompletionItem = vscode.CompletionItem;
var CompletionList = vscode.CompletionList;
var CompletionItemKind = vscode.CompletionItemKind;
var Range = vscode.Range;

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
var thisAliasCompletionItems = [];
var processedLabels = [];
var includeThisAliasItems = false;

function isPrototype(node) {
    return node.object.type === MEMBER_EXPRESSION && node.object.property.type === IDENTIFIER
                && node.object.property.name === PROTOTYPE;
}

function isThisOrThisAlias(node) {
    return node.object.type === THIS_EXPRESSION || (node.object.type === IDENTIFIER && alsoThisVars.indexOf(node.object.name) !== -1);
}

function addCompletionItem(label, kind, insertText) {
    var completionItem;
    if (label && processedLabels.indexOf(label) === -1) {
        processedLabels.push(label);
        completionItem = new CompletionItem(label);
        completionItem.kind = kind;
        completionItem.insertText = insertText;
        completionItems.push(completionItem);
    }
}

function shouldComplete(document, position) {
    var thisVars = alsoThisVars.slice();
    thisVars.push(THIS);
    var regExp = new RegExp('\\W+(' + thisVars.join('|') + ')\\.\\s*\\w*$');
    var splittedText = document.getText(new Range(0, 0, position.line, position.character));
    return splittedText.match(regExp);
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
    if (includeThisAliasItems) {
        completionItems = completionItems.concat(thisAliasCompletionItems);
    }
}

function processVariableDeclarator(node) {
    if (node.id.type === IDENTIFIER && alsoThisVars.indexOf(node.id.name) !== -1) {
        includeThisAliasItems = true;
    }
}

function processAssignmentExpression(node) {
    if (node.left.type === MEMBER_EXPRESSION) {
        var label;
        if (isPrototype(node.left)) {
            label = node.left.property.name;
            var insertText = label;
            var kind = CompletionItemKind.Field;
            if (node.right.type === IDENTIFIER) {
                kind = resolveTypeOfProperty(label);
            } else if (node.right.type === FUNCTION_EXPRESSION) {
                insertText = node.left.property.name + CALLABLE_SUFFIX;
                kind = CompletionItemKind.Method;
            }
            addCompletionItem(label, kind, insertText);
        } else if (isThisOrThisAlias(node.left) && node.right.type === FUNCTION_EXPRESSION) {
            label = node.left.property.name;
            addCompletionItem(label, CompletionItemKind.Method, label + CALLABLE_SUFFIX);
        }
    }
}

function processMemberExpression(node, parent) {
    if (node.computed === false && node.property.type === IDENTIFIER && isThisOrThisAlias(node)) {
        var label = node.property.name;
        var kind = resolveTypeOfProperty(label);
        var insertText = label;
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
        addCompletionItem(label, kind, insertText);
    }
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
        thisAliasCompletionItems = [];
        includeThisAliasItems = false;
        processedLabels = [];

        if (shouldComplete(document, position)) {
            prepareCompletionItems(document);
        } else {
            // try to reload cached AST
            utils.loadSyntaxTree(document);
        }

        return completionItems;
    }
};