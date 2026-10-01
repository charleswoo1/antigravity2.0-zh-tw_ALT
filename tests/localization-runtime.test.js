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
assert.strictEqual(
    translateString('The breakdown below shows token usage from customizations like rules, skills, and MCP. If a budget is exceeded, large rules are demoted to path pointers and large customizations are excluded automatically.'),
    '下方明細顯示規則、技能和 MCP 等自訂項目的 Token 使用量。若超出預算，大型規則將降級為路徑指標，大型自訂項目將自動排除。'
);
assert.strictEqual(translateString('Show 2 breakdowns'), '顯示 2 個明細');
assert.strictEqual(translateString('Show 1 breakdown'), '顯示 1 個明細');
assert.strictEqual(translateString('5 tools'), '5 個工具');
assert.strictEqual(translateString('1 demoted'), '1 個已降級');
assert.strictEqual(translateString('2 excluded'), '2 個已排除');
assert.strictEqual(translateString('3 tools excluded'), '3 個工具已排除');
assert.strictEqual(
    translateString('Exceeded the rules token budget. Full rule content (1,234 tokens) was replaced with a lightweight file-path pointer in context.'),
    '超出規則 Token 預算。完整規則內容 (1,234 個 Token) 已在上下文中替換為輕量級檔案路徑指標。'
);
assert.strictEqual(
    translateString('All tools in this MCP server (5,678 tokens) exceeded the customization budget and were excluded from context.'),
    '此 MCP 伺服器中的所有工具 (5,678 個 Token) 超出自訂項目預算，已自上下文排除。'
);
assert.strictEqual(
    translateString('2 tools in this MCP server (890 tokens) exceeded the customization budget and were excluded from context.'),
    '此 MCP 伺服器中的 2 個工具 (890 個 Token) 超出自訂項目預算，已自上下文排除。'
);
assert.strictEqual(
    translateString('Exceeded the customization token budget (3,456 tokens) and was excluded from context.'),
    '超出自訂項目 Token 預算 (3,456 個 Token)，已自上下文排除。'
);
assert.strictEqual(
    translateString('1 rule exceeded the rules budget and was demoted from full inline content to a file-path pointer.'),
    '1 個規則超出規則預算，已由完整內嵌內容降級為檔案路徑指標。'
);
assert.strictEqual(
    translateString('2 items in Skills exceeded the customization budget and were excluded from context.'),
    '技能 中的 2 個項目超出自訂項目預算，已自上下文排除。'
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
