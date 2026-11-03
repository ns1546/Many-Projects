/**
 * Unit Test: Table Normalization, Session Isolation & Offline QR Engine
 * Conforms to: PRD-OMS-002, ARCH-SEC-001, & openapi.yaml
 */

const assert = require('assert');

// 1. Table Normalization Engine Specification
function normalizeTableNo(raw) {
  if (!raw && raw !== 0) return 'Table 1';
  let clean = String(raw).trim();
  if (!clean) return 'Table 1';

  if (/^\d+$/.test(clean)) {
    return `Table ${parseInt(clean, 10)}`;
  }

  const match = clean.match(/^(?:table|tbl|t)[\s\-_]*(\d+.*)$/i);
  if (match) {
    const suffix = match[1].trim();
    const numOnly = /^\d+$/.test(suffix) ? parseInt(suffix, 10) : suffix;
    return `Table ${numOnly}`;
  }

  if (/^table\s+/i.test(clean)) {
    return `Table ${clean.replace(/^table\s+/i, '').trim()}`;
  }

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function isSameTable(tableA, tableB) {
  if (!tableA || !tableB) return false;
  return normalizeTableNo(tableA).toLowerCase() === normalizeTableNo(tableB).toLowerCase();
}

async function runTests() {
  console.log('========================================================');
  console.log('--- RUNNING TABLE, SESSION & QR CODE ENGINE TESTS ---');
  console.log('========================================================');

  // TEST 1: Table Number Normalization
  console.log('\n[Test 1] Table Number Normalization:');
  const variationsTable1 = ['1', ' 1 ', '01', 'table 1', 'Table 1', 'TABLE 1', 'tbl_1', 'tbl-1', 't1', 't-1', 'table01'];
  variationsTable1.forEach(input => {
    const norm = normalizeTableNo(input);
    assert.strictEqual(norm, 'Table 1', `Input "${input}" should normalize to "Table 1", got "${norm}"`);
  });
  console.log(`  ✔ Passed: All 11 variations of Table 1 normalized correctly to "Table 1".`);

  const variationsTable42 = ['42', 'table 42', 'tbl_42', 'tbl-42', 't42'];
  variationsTable42.forEach(input => {
    const norm = normalizeTableNo(input);
    assert.strictEqual(norm, 'Table 42', `Input "${input}" should normalize to "Table 42", got "${norm}"`);
  });
  console.log(`  ✔ Passed: Multi-digit tables normalize correctly to "Table 42".`);

  // TEST 2: Canonical isSameTable Equality & Discrimination
  console.log('\n[Test 2] Table Comparison Logic:');
  assert.strictEqual(isSameTable('1', 'Table 1'), true, 'Numeric 1 must match Table 1');
  assert.strictEqual(isSameTable('table 2', 'Table 2'), true, 'Lowercase table 2 must match Table 2');
  assert.strictEqual(isSameTable('tbl_3', 'Table 3'), true, 'tbl_3 must match Table 3');
  assert.strictEqual(isSameTable('Table 1', 'Table 2'), false, 'Table 1 must NOT match Table 2');
  assert.strictEqual(isSameTable('Table 3', 'Table 4'), false, 'Table 3 must NOT match Table 4');
  console.log(`  ✔ Passed: isSameTable correctly identifies identical tables and rejects different tables.`);

  // TEST 3: Multi-Table Session Isolation
  console.log('\n[Test 3] Session Isolation Across Multiple Tables:');
  const sessionStore = new Map();
  function initSessionForTable(tableNo) {
    const canonical = normalizeTableNo(tableNo);
    const sessionId = `SES-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    sessionStore.set(canonical, { tableNo: canonical, sessionId, status: 'Occupied', activeOrderId: null });
    return sessionId;
  }

  const s1 = initSessionForTable('1');
  const s2 = initSessionForTable('table 2');
  const s3 = initSessionForTable('tbl_3');

  assert.notStrictEqual(s1, s2, 'Table 1 and Table 2 must have distinct session IDs');
  assert.notStrictEqual(s2, s3, 'Table 2 and Table 3 must have distinct session IDs');
  assert.strictEqual(sessionStore.get('Table 1').tableNo, 'Table 1');
  assert.strictEqual(sessionStore.get('Table 2').tableNo, 'Table 2');
  assert.strictEqual(sessionStore.get('Table 3').tableNo, 'Table 3');
  console.log(`  ✔ Passed: Tables 1, 2, and 3 maintain fully isolated sessions.`);

  // TEST 4: Offline Vector QR Code Generator (Backend /api/v1/qr)
  console.log('\n[Test 4] Offline Vector QR Code Generation API:');
  try {
    const testUrl = 'http://localhost:3000/index.html?table=2';
    const resp = await fetch(`http://localhost:3000/api/v1/qr?text=${encodeURIComponent(testUrl)}`);
    assert.strictEqual(resp.status, 200, 'HTTP status should be 200');
    assert.strictEqual(resp.headers.get('content-type').includes('image/svg+xml'), true, 'Should return SVG image');
    const svgContent = await resp.text();
    assert.strictEqual(svgContent.includes('<svg'), true, 'Response must contain <svg tag');
    assert.strictEqual(svgContent.includes('</svg>'), true, 'Response must close </svg> tag');
    assert.strictEqual(svgContent.includes('viewBox='), true, 'SVG must include viewBox attribute');
    console.log(`  ✔ Passed: High-res vector SVG QR code generated locally (length: ${svgContent.length} bytes).`);
  } catch (err) {
    console.error('  ✘ Failed Test 4:', err.message);
    throw err;
  }

  // TEST 5: Table-Bound Order Placement Handshake
  console.log('\n[Test 5] Zero-Trust Table-Bound Order Placement:');
  try {
    const orderTable2 = {
      tableNo: 'table 2', // passing unnormalized form
      sessionId: s2,
      items: [
        { id: 'item_1', title: 'Spicy Dragon Wings', price: 9999, quantity: 2 } // tampered price
      ]
    };

    const orderResp = await fetch('http://localhost:3000/api/v1/orders/place', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': `unit_test_table2_${Date.now()}`
      },
      body: JSON.stringify(orderTable2)
    });

    assert.strictEqual(orderResp.status, 202, 'Should accept order with HTTP 202');
    const serverOrder = await orderResp.json();
    assert.strictEqual(serverOrder.tableNo, 'Table 2', 'Server must normalize tableNo to "Table 2"');
    assert.strictEqual(serverOrder.items[0].verifiedUnitPrice, 340, 'Server must enforce catalog price (৳340 not ৳9999)');
    console.log(`  ✔ Passed: Order for Table 2 accepted, normalized to "Table 2", catalog verified total: ৳${serverOrder.total}`);
  } catch (err) {
    console.error('  ✘ Failed Test 5:', err.message);
    throw err;
  }

  console.log('\n========================================================');
  console.log('🎉 ALL TABLE, SESSION & QR CODE ENGINE TESTS PASSED!');
  console.log('========================================================\n');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
