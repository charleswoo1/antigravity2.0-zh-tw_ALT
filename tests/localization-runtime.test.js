'use strict';

const assert = require('assert');
const vm = require('vm');
const engine = require('../localization_engine');

class Element {
    attachShadow() { return {}; }
    setAttribute() {}
}

const document = {
    getElementById() { return null; },
    createElement() { return {}; },
    head: { appendChild() {} },
    readyState: 'loading',
    addEventListener() {},
    createTreeWalker(element) {
        const nodes = element.testTextNodes || [];
        let index = -1;
        return {
            get currentNode() { return nodes[index]; },
            nextNode() { return ++index < nodes.length; }
        };
    }
};

const window = { addEventListener() {} };
const source = engine.generateJs().replace(
    'window.__ANTIGRAVITY_ZH_TW_LOADED__ = true;',
    'window.__ANTIGRAVITY_ZH_TW_LOADED__ = true; window.__test = { translateString, translateSplitTextElement, translateNode, isInBlockedZone };'
);

vm.runInNewContext(source, {
    document,
    window,
    Element,
    Node: { ELEMENT_NODE: 1, TEXT_NODE: 3 },
    NodeFilter: { SHOW_TEXT: 4 },
    MutationObserver: class { observe() {} },
    setTimeout() {}
});

const { translateString, translateSplitTextElement, translateNode, isInBlockedZone } = window.__test;

assert.strictEqual(translateString('Gemini Models'), 'Gemini 模型');
assert.strictEqual(translateString('Claude and GPT models'), 'Claude 與 GPT 模型');
assert.strictEqual(translateString('Your Plan:'), '您的方案：');
assert.strictEqual(
    translateString('You can upgrade to a Google AI Ultra plan to receive higher rate limits.'),
    '您可以升級至 Google AI Ultra 方案，以取得更高的速率限制。'
);
assert.strictEqual(
    translateString('You have used some of your weekly limit, it will fully refresh in 4 days, 1 hour.'),
    '您已使用部分每週用量，將於 4 天、1 小時後完全重置。'
);
assert.strictEqual(
    translateString('You have used some of your 5-hour limit, it will fully refresh in 4 hours, 3 minutes.'),
    '您已使用部分五小時用量，將於 4 小時、3 分鐘後完全重置。'
);
assert.strictEqual(
    translateString('You have used some of your weekly limit, it will fully refresh in unknown units.'),
    'You have used some of your weekly limit, it will fully refresh in unknown units.'
);

function element(parentElement = null, editable = null, className = '') {
    return {
        nodeType: 1,
        tagName: 'DIV',
        className,
        parentElement,
        getAttribute(name) { return name === 'contenteditable' ? editable : null; },
        matches() { return false; },
        querySelector() { return null; }
    };
}

const split = element();
const first = { nodeType: 3, nodeValue: 'Your Plan:', parentElement: split };
const second = { nodeType: 3, nodeValue: 'Google AI Pro', parentElement: split };
split.textContent = first.nodeValue + second.nodeValue;
split.testTextNodes = [first, second];
assert.strictEqual(translateSplitTextElement(split), true);
assert.strictEqual(first.nodeValue, '您的方案：Google AI Pro');
assert.strictEqual(second.nodeValue, '');

const projects = element();
const projectsFirst = { nodeType: 3, nodeValue: 'No Projects', parentElement: projects };
const projectsSecond = { nodeType: 3, nodeValue: 'found', parentElement: projects };
projects.textContent = 'No Projects found';
projects.testTextNodes = [projectsFirst, projectsSecond];
assert.strictEqual(translateSplitTextElement(projects), true);
assert.strictEqual(projectsFirst.nodeValue, translateString('No Projects found'));
assert.strictEqual(projectsSecond.nodeValue, '');

let deep = element(null, '', 'monaco-editor');
for (let i = 0; i < 16; i++) deep = element(deep);
assert.strictEqual(isInBlockedZone(deep), true);
assert.strictEqual(isInBlockedZone(element(null, 'plaintext-only')), true);
assert.strictEqual(isInBlockedZone(element(null, 'false')), false);
const protectedText = { nodeType: 3, nodeValue: 'Gemini Models', parentElement: deep };
translateNode(protectedText);
assert.strictEqual(protectedText.nodeValue, 'Gemini Models');
const editableText = { nodeType: 3, nodeValue: 'Gemini Models', parentElement: element(null, '') };
translateNode(editableText);
assert.strictEqual(editableText.nodeValue, 'Gemini Models');
const ordinary = element();
ordinary.textContent = 'Gemini Models';
const ordinaryText = { nodeType: 3, nodeValue: 'Gemini Models', parentElement: ordinary };
translateNode(ordinaryText);
assert.strictEqual(ordinaryText.nodeValue, 'Gemini 模型');

const blocked = element(null, '', 'terminal');
blocked.textContent = 'Your Plan:Google AI Pro';
blocked.testTextNodes = [
    { nodeType: 3, nodeValue: 'Your Plan:', parentElement: blocked },
    { nodeType: 3, nodeValue: 'Google AI Pro', parentElement: blocked }
];
assert.strictEqual(translateSplitTextElement(blocked), false);

console.log('Localization runtime regression tests passed.');
