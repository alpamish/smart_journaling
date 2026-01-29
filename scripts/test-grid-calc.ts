
import { calculateFuturesGrid, GridInputs } from '../src/app/lib/grid-calculator';

function runTest(name: string, inputs: GridInputs, expected: any) {
    console.log(`\n--- Test: ${name} ---`);
    try {
        const result = calculateFuturesGrid(inputs);
        console.log('Result:', JSON.stringify(result, null, 2));

        // Basic validations
        let passed = true;
        if (expected.positionSize && Math.abs(result.positionSize - expected.positionSize) > 0.1) {
            console.error(`FAIL: Position Size. Expected ${expected.positionSize}, got ${result.positionSize}`);
            passed = false;
        }
        if (expected.reserveRate) {
            if (result.reserveRate < 0.10 || result.reserveRate > 0.35) {
                console.error(`FAIL: Reserve Rate out of bounds: ${result.reserveRate}`);
                passed = false;
            }
        }
        if (expected.liquidationPriceLong && Math.abs((result.liquidationPrices.long || 0) - expected.liquidationPriceLong) > 10) {
            console.error(`FAIL: Liquidation Long. Expected ~${expected.liquidationPriceLong}, got ${result.liquidationPrices.long}`);
            passed = false;
        }

        if (passed) console.log('PASS');

    } catch (e: any) {
        if (expected.shouldFail) {
            console.log('PASS: Failed as expected with:', e.message);
        } else {
            console.error('FAIL: Exception thrown:', e.message);
        }
    }
}

// Test 1: Standard LONG
// Investment: 1000, Leverage: 10x -> Position: 10000
// Grid: 50, Range: 50000-60000. Entry: 55000.
runTest('Standard LONG', {
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 50,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.004, // 0.4%
    autoReserveMargin: true,
    positionSide: 'LONG'
}, {
    positionSize: 10000,
    reserveRate: true
});

// Test 2: Standard SHORT
runTest('Standard SHORT', {
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 50,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.004,
    autoReserveMargin: true,
    positionSide: 'SHORT'
}, {
    positionSize: 10000,
    reserveRate: true
});

// Test 3: NEUTRAL
runTest('NEUTRAL Split', {
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 50,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.004,
    autoReserveMargin: true,
    positionSide: 'NEUTRAL'
}, {
    positionSize: 10000,
    reserveRate: true
});

// Test 4: Validation Fail (Manual Reserve too high)
runTest('Validation Fail', {
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 50,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.004,
    autoReserveMargin: false,
    manualReservedMargin: 999, // Leaves 1 usable margin, likely < maintenance
    positionSide: 'LONG'
}, {
    shouldFail: true
});
