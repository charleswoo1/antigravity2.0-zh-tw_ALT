'use strict';

const assert = require('assert');
const engine = require('../localization_engine');

function extractQuotedList(source, constName) {
    const match = source.match(new RegExp('const ' + constName + ' = \\[([^;]+)\\];'));
    assert.ok(match, `找不到 ${constName} 定義`);
    return [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1]);
}

function main() {
    const generated = engine.generateJs();

    const blockedClasses = extractQuotedList(generated, 'BLOCKED_CLASSES');
    const requiredClasses = [
        'monaco-editor',
        'editor-container',
        'terminal',
        'output-view',
        'debug-console',
        'code-view',
        'suggest-widget'
    ];
    for (const className of requiredClasses) {
        assert.ok(
            blockedClasses.includes(className),
            `受保護區域不得移除 class：${className}`
        );
    }

    const blockedTags = extractQuotedList(generated, 'BLOCKED_TAGS');
    const requiredTags = ['CODE', 'PRE', 'INPUT', 'TEXTAREA'];
    for (const tagName of requiredTags) {
        assert.ok(
            blockedTags.includes(tagName),
            `受保護區域不得移除 tag：${tagName}`
        );
    }

    assert.ok(
        generated.includes("curr.getAttribute('contenteditable') === 'true'"),
        'contenteditable 區域必須維持不翻譯保護'
    );

    const translateAttributes = generated.match(
        /function translateAttributes\(el\) \{([\s\S]*?)\n    \}/
    );
    assert.ok(translateAttributes, '找不到 translateAttributes');
    assert.ok(
        translateAttributes[1].includes('if (isInBlockedZone(el)) return;'),
        'attribute 翻譯不得穿透 protected zone'
    );

    assert.ok(
        generated.includes('if (isInBlockedZone(node)) return;'),
        '文字節點翻譯不得穿透 protected zone'
    );

    console.log('Localization protected-zone regression tests passed.');
}

main();
