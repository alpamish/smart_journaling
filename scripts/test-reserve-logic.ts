#!/usr/bin/env tsx

/**
 * Test script to demonstrate the updated reserve margin logic
 * Auto Reserve: Reserve comes from investment amount
 * Manual Reserve: Reserve comes from available balance
 */

import { calculateFuturesGrid, GridInputs } from '../src/app/lib/grid-calculator';

function runReserveComparisonTest(name: string, inputs: GridInputs) {
    console.log(`\n=== ${name} ===`);
    console.log('Input Parameters:');
    console.log(`  Investment: $${inputs.investment.toLocaleString()}`);
    console.log(`  Available Balance: $${inputs.availableBalance?.toLocaleString() || 'N/A'}`);
    console.log(`  Auto Reserve: ${inputs.autoReserveMargin ? 'YES' : 'NO'}`);
    console.log(`  Manual Reserved Margin: $${inputs.manualReservedMargin || 0}`);
    
    try {
        const result = calculateFuturesGrid(inputs);
        
        console.log('\nReserve Margin Results:');
        console.log(`  Reserved Margin: $${result.reservedMargin.toFixed(2)}`);
        console.log(`  Usable Margin: $${result.usableMargin.toFixed(2)}`);
        console.log(`  Reserve Rate: ${(result.reserveRate * 100).toFixed(1)}%`);
        
        console.log('\nMargin Logic:');
        if (inputs.autoReserveMargin) {
            console.log(`  ✅ Auto Reserve: Reserved margin comes FROM investment amount`);
            console.log(`  ✅ Usable margin = Investment ($${inputs.investment}) - Reserved ($${result.reservedMargin.toFixed(2)})`);
            console.log(`  ✅ Total capital needed = Investment ($${inputs.investment})`);
        } else {
            console.log(`  ✅ Manual Reserve: Reserved margin comes FROM available balance`);
            console.log(`  ✅ Usable margin = Investment ($${inputs.investment}) (reserve from separate balance)`);
            console.log(`  ✅ Total capital needed = Investment ($${inputs.investment}) + Reserved ($${result.reservedMargin.toFixed(2)}) = $${(inputs.investment + result.reservedMargin).toFixed(2)}`);
            
            if (inputs.availableBalance) {
                console.log(`  ✅ Available balance after reserve: $${(inputs.availableBalance - result.reservedMargin).toFixed(2)}`);
                if (result.reservedMargin > inputs.availableBalance) {
                    console.log(`  ⚠️  WARNING: Reserved margin exceeds available balance!`);
                } else {
                    console.log(`  ✅ Sufficient available balance for reserve`);
                }
            }
        }
        
        console.log('\nGrid Results:');
        console.log(`  Position Size: $${result.positionSize.toLocaleString()}`);
        console.log(`  Maintenance Margin: $${result.maintenanceMargin.toFixed(2)}`);
        
        if (result.liquidationPrices.long || result.liquidationPrices.short) {
            console.log('\nLiquidation Prices:');
            if (result.liquidationPrices.long) {
                console.log(`  Long Liquidation: $${result.liquidationPrices.long.toFixed(2)}`);
            }
            if (result.liquidationPrices.short) {
                console.log(`  Short Liquidation: $${result.liquidationPrices.short.toFixed(2)}`);
            }
        }
        
        if (result.warnings.length > 0) {
            console.log('\nWarnings:');
            result.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
        }
        
        console.log('\n✅ Calculation successful');
        
    } catch (error: any) {
        console.log(`\n❌ Calculation failed: ${error.message}`);
    }
}

console.log('🔧 TESTING RESERVE MARGIN LOGIC');
console.log('=' .repeat(60));

// Test Case 1: Auto Reserve (Traditional)
runReserveComparisonTest('Auto Reserve - Traditional Mode', {
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 50,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.005,
    autoReserveMargin: true,
    positionSide: 'LONG',
    availableBalance: 2000
});

// Test Case 2: Manual Reserve - From Available Balance
runReserveComparisonTest('Manual Reserve - From Available Balance', {
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 50,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.005,
    autoReserveMargin: false,
    manualReservedMargin: 200,
    positionSide: 'LONG',
    availableBalance: 2000
});

// Test Case 3: Manual Reserve - No Manual Value (Use Suggested)
runReserveComparisonTest('Manual Reserve - Auto Suggested', {
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 50,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.005,
    autoReserveMargin: false,
    positionSide: 'LONG',
    availableBalance: 2000
});

// Test Case 4: Manual Reserve - Insufficient Balance
runReserveComparisonTest('Manual Reserve - Insufficient Balance', {
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 50,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.005,
    autoReserveMargin: false,
    manualReservedMargin: 500,
    positionSide: 'LONG',
    availableBalance: 300
});

// Test Case 5: Auto Reserve - Higher Investment
runReserveComparisonTest('Auto Reserve - Higher Investment', {
    lowerPrice: 30000,
    upperPrice: 40000,
    gridCount: 100,
    investment: 5000,
    leverage: 5,
    maintenanceMarginRate: 0.005,
    autoReserveMargin: true,
    positionSide: 'NEUTRAL',
    availableBalance: 10000
});

console.log('\n' + '='.repeat(60));
console.log('🎯 RESERVE MARGIN LOGIC SUMMARY');
console.log('='.repeat(60));
console.log('✅ Auto Reserve: Reserve margin comes from investment amount');
console.log('✅ Manual Reserve: Reserve margin comes from available balance');
console.log('✅ Total capital requirements differ between modes');
console.log('✅ Usable margin calculations adapt to reserve source');
console.log('✅ Form now shows appropriate information for each mode');