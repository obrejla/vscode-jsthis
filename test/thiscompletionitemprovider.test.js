'use strict';

var assert = require('assert');
var vscode = require('vscode');
var CompletionItemKind = vscode.CompletionItemKind;
var thisCompletionItemProvider = require('../src/ThisCompletionItemProvider');

suite('Test ThisCompletionItemProvider', function () {

    test('Constant defined on "this" in constructor', function (done) {;
        testCompletion(done, 'constantOnThis.js', { line: 5, column: 14 }, [
            {
                label: 'MY_CONSTANT',
                kind: CompletionItemKind.Enum,
                insertText: 'MY_CONSTANT'
            }
        ]);
    });

    test('Method defined on "prototype"', function (done) {
        testCompletion(done, 'methodOnPrototype.js', { line: 5, column: 14 }, [
            {
                label: 'myField',
                kind: CompletionItemKind.Field,
                insertText: 'myField'
            },
            {
                label: 'myPrMethod',
                kind: CompletionItemKind.Method,
                insertText: 'myPrMethod()'
            }
        ]);
    });

    test('Negation before "this" keyword', function (done) {
        testCompletion(done, 'negationBeforeThis.js', { line: 6, column: 27 }, [
            {
                label: 'testProp',
                kind: CompletionItemKind.Field,
                insertText: 'testProp'
            }
        ]);
    });

    test('Method defined on "self" in constructor', function (done) {
        testCompletion(done, 'methodOnSelf.js', { line: 6, column: 14 }, [
            {
                label: 'myMethodSelf',
                kind: CompletionItemKind.Method,
                insertText: 'myMethodSelf()'
            }
        ]);
    });

    test('Method defined on "this" in constructor', function (done) {
        testCompletion(done, 'methodOnThis.js', { line: 5, column: 14 }, [
            {
                label: 'myMethod',
                kind: CompletionItemKind.Method,
                insertText: 'myMethod()'
            }
        ]);
    });

    test('Property defined on "this" in constructor', function (done) {;
        testCompletion(done, 'propertyOnThis.js', { line: 5, column: 14 }, [
            {
                label: 'testProperty',
                kind: CompletionItemKind.Field,
                insertText: 'testProperty'
            }
        ]);
    });

    test('Property defined on "self" in constructor', function (done) {
        testCompletion(done, 'propertyOnSelf.js', { line: 6, column: 14 }, [
            {
                label: 'testPropertySelf',
                kind: CompletionItemKind.Field,
                insertText: 'testPropertySelf'
            }
        ]);
    });

    function testCompletion(done, file, position, expectedItems) {
        var fileUri = vscode.Uri.file(__dirname + '/fixtures/completion/' + file);
        var translatedPosition = new vscode.Position(position.line - 1, position.column - 1);
        vscode.workspace.openTextDocument(fileUri).then(function (textDocument) {
            var completionItems = thisCompletionItemProvider.provideCompletionItems(textDocument, translatedPosition, null).items;
            checkItems(completionItems, expectedItems);
        }, function (error) {
            assert.ok(false, `Error: ${error}`);
        }).then(done, done);
    }

    function checkItems(actual, expected) {
        assert.equal(actual.length, expected.length, 'Wrong length of completion item array!');
        for (var i = 0; i < actual.length; i++) {
            var actualCompletionItem = actual[i];
            var expectedCompletionItem = expected[i];
            assert.equal(actualCompletionItem.label, expectedCompletionItem.label, 'Unexpected label property!');
            assert.equal(actualCompletionItem.kind, expectedCompletionItem.kind, 'Unexpected kind property!');
            assert.equal(actualCompletionItem.insertText, expectedCompletionItem.insertText, 'Unexpected insertText property!');
        }
    };

});