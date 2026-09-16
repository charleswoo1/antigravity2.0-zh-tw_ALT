'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { replaceArchiveSafely } = require('../localization_engine');

function hash(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function runFailureCase(root, faultInjection, validateReplacement = () => true) {
    const target = path.join(root, `${faultInjection}.asar`);
    const replacement = path.join(root, `${faultInjection}.tmp`);
    fs.writeFileSync(target, 'official-original');
    fs.writeFileSync(replacement, 'localized-candidate');
    const originalHash = hash(target);
    assert.throws(() => replaceArchiveSafely(replacement, target, { faultInjection, validateReplacement }), /fault injection/);
    assert.strictEqual(hash(target), originalHash, `${faultInjection} 後必須 rollback exact original`);
    assert.strictEqual(fs.readFileSync(target, 'utf-8'), 'official-original');
    assert.ok(!fs.existsSync(`${target}.pre-localization`), 'rollback 後不得留下 shadow archive');
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-transaction-test-'));
try {
    runFailureCase(tempRoot, 'after-original-move');
    runFailureCase(tempRoot, 'after-replacement');
    runFailureCase(tempRoot, 'post-verification');

    const target = path.join(tempRoot, 'validation-failure.asar');
    const replacement = path.join(tempRoot, 'validation-failure.tmp');
    fs.writeFileSync(target, 'official-original');
    fs.writeFileSync(replacement, 'invalid-localized-candidate');
    const originalHash = hash(target);
    assert.throws(() => replaceArchiveSafely(replacement, target, { validateReplacement: () => false }), /完整性驗證失敗/);
    assert.strictEqual(hash(target), originalHash, 'post-replacement validation failure 必須 rollback exact original');

    const successTarget = path.join(tempRoot, 'success.asar');
    const successReplacement = path.join(tempRoot, 'success.tmp');
    fs.writeFileSync(successTarget, 'official-original');
    fs.writeFileSync(successReplacement, 'localized-candidate');
    replaceArchiveSafely(successReplacement, successTarget, {
        validateReplacement: filePath => fs.readFileSync(filePath, 'utf-8') === 'localized-candidate'
    });
    assert.strictEqual(fs.readFileSync(successTarget, 'utf-8'), 'localized-candidate');
    assert.ok(!fs.existsSync(`${successTarget}.pre-localization`));
} finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log('Transactional replacement fault-injection tests passed.');
