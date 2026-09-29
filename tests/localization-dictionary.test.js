'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const dictionaryDir = path.join(__dirname, '..', 'dicts');
const seen = new Map();
const splitSeen = new Map();
let entryCount = 0;

function normalize(text) {
    return text.replace(/\s+/g, ' ').trim()
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"');
}

for (const file of fs.readdirSync(dictionaryDir).filter(name => name.endsWith('.json')).sort()) {
    const dictionary = JSON.parse(fs.readFileSync(path.join(dictionaryDir, file), 'utf-8'));
    for (const [key, value] of Object.entries(dictionary)) {
        assert.strictEqual(typeof value, 'string', `${file}: ${key} 必須對應文字`);
        const normalized = normalize(key);
        assert.ok(normalized, `${file}: 字典鍵不可為空`);
        const earlier = seen.get(normalized);
        if (earlier) {
            assert.strictEqual(value, earlier.value, `${file}: ${key} 與 ${earlier.file} 的正規化鍵衝突`);
        }
        seen.set(normalized, { value, file });
        if (normalized.length >= 12 && normalized !== value) {
            const splitKey = normalized.replace(/\s+/g, '').toLowerCase();
            const priorSplit = splitSeen.get(splitKey);
            if (priorSplit) {
                assert.strictEqual(value, priorSplit.value, `${file}: ${key} 與 ${priorSplit.file} 的拆分文字鍵衝突`);
            }
            splitSeen.set(splitKey, { value, file });
        }
        entryCount++;
    }
}

assert.ok(entryCount > 900, '字典詞條數量異常下降');
console.log(`Localization dictionary audit passed: ${entryCount} entries, ${seen.size} unique keys.`);
