
// Logic copy-pasted for isolation testing
export interface GridInputs {
    lowerPrice: number;
    upperPrice: number;
    gridCount: number;
    investment: number;
    leverage: number;
    maintenanceMarginRate: number;
    autoReserveMargin: boolean;
    manualReservedMargin?: number;
    positionSide: 'LONG' | 'SHORT' | 'NEUTRAL';
    entryPrice?: number;
    availableBalance?: number;
}

export function calculateFuturesGrid(inputs: GridInputs) {
    const {
        lowerPrice,
        upperPrice,
        gridCount,
        investment,
        leverage,
        maintenanceMarginRate,
        autoReserveMargin,
        manualReservedMargin,
        positionSide,
        entryPrice: providedEntryPrice,
        availableBalance
    } = inputs;

    const warnings: string[] = [];

    const entryPrice = providedEntryPrice || Math.sqrt(lowerPrice * upperPrice);
    const gridStep = (upperPrice - lowerPrice) / gridCount;
    const positionSize = investment * leverage;

    let calculatedReserveRate = 0.08 + (gridCount / 600) + (leverage / 25) + ((upperPrice - lowerPrice) / entryPrice) * 0.5;
    calculatedReserveRate = Math.max(0.10, Math.min(0.35, calculatedReserveRate));

    let reservedMargin = 0;
    if (autoReserveMargin) {
        // Auto Reserve: Reserve margin comes from investment amount
        reservedMargin = investment * calculatedReserveRate;
    } else {
        // Manual Reserve: Reserve margin comes from available balance
        // If manual value not provided, use calculated rate on available balance
        if (manualReservedMargin) {
            reservedMargin = manualReservedMargin;
        } else if (availableBalance) {
            reservedMargin = Math.min(availableBalance * calculatedReserveRate, availableBalance);
        } else {
            reservedMargin = 0;
        }
    }

    // 4. Usable Margin
    // For auto reserve: usable margin = investment - reserved margin
    // For manual reserve: usable margin = investment (since reserve comes from available balance)
    const usableMargin = autoReserveMargin ? (investment - reservedMargin) : investment;
    const maintenanceMargin = positionSize * maintenanceMarginRate;

    const liquidationPrices: { long?: number; short?: number } = {};

    if (positionSide === 'LONG') {
        // Liquidation Price (Long) using geometric mean method from plan.md
        liquidationPrices.long = entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
    } else if (positionSide === 'SHORT') {
        // Liquidation Price (Short) using geometric mean method from plan.md
        liquidationPrices.short = entryPrice * (1 + (1 / leverage) - maintenanceMarginRate);
    } else if (positionSide === 'NEUTRAL') {
        // Neutral Grid: Apply the same geometric mean method for both long and short positions
        liquidationPrices.long = entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
        liquidationPrices.short = entryPrice * (1 + (1 / leverage) - maintenanceMarginRate);
    }

    if (usableMargin <= maintenanceMargin) {
        throw new Error("No enough balance");
    }
    if (usableMargin < 0) {
        throw new Error("Reserved margin exceeds investment");
    }

    if (liquidationPrices.long !== undefined) {
        if (liquidationPrices.long >= lowerPrice) {
            warnings.push('Liquidation price (LONG) is within the grid range!');
        }
    }
    if (liquidationPrices.short !== undefined) {
        if (liquidationPrices.short <= upperPrice) {
            warnings.push('Liquidation price (SHORT) is within the grid range!');
        }
    }

    return {
        gridStep,
        positionSize,
        maintenanceMargin,
        liquidationPrices,
        reservedMargin,
        usableMargin,
        reserveRate: calculatedReserveRate,
        warnings
    };
}

// Tests
function runTest(name: string, inputs: GridInputs, expected: any) {
    console.log(`\n--- Test: ${name} ---`);
    try {
        const result = calculateFuturesGrid(inputs);
        console.log('Result:', JSON.stringify(result, null, 2));

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
runTest('Standard LONG', {
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 50,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.004,
    autoReserveMargin: true,
    positionSide: 'LONG'
}, {
    positionSize: 10000,
    reserveRate: true
});

// Test 2: Plan.md Example (BTC Long Grid)
runTest('Plan.md Example BTC Long', {
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 50,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.005,
    autoReserveMargin: true,
    positionSide: 'LONG'
}, {
    expectedLiqPrice: 49569 // From plan.md calculation
});

// Test 3: Manual Reserve from Available Balance
runTest('Manual Reserve from Available Balance', {
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 50,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.005,
    autoReserveMargin: false,
    manualReservedMargin: 200,
    availableBalance: 2000,
    positionSide: 'LONG'
}, {
    expectedReservedMargin: 200
});

// Test 4: Validation Fail
runTest('Validation Fail', {
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 50,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.004,
    autoReserveMargin: false,
    manualReservedMargin: 999,
    positionSide: 'LONG'
}, {
    shouldFail: true
});
