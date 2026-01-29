#!/usr/bin/env tsx

/**
 * Test script to demonstrate the improved liquidation price calculations
 * using the geometric mean method from plan.md
 */

import { calculateFuturesGrid, GridInputs } from '../src/app/lib/grid-calculator';

function runComparisonTest(name: string, inputs: GridInputs) {
    console.log(`\n=== ${name} ===`);
    console.log('Input Parameters:');
    console.log(`  Price Range: $${inputs.lowerPrice.toLocaleString()} - $${inputs.upperPrice.toLocaleString()}`);
    console.log(`  Grid Count: ${inputs.gridCount}`);
    console.log(`  Investment: $${inputs.investment}`);
    console.log(`  Leverage: ${inputs.leverage}x`);
    console.log(`  Direction: ${inputs.positionSide}`);
    console.log(`  Maintenance Margin Rate: ${(inputs.maintenanceMarginRate * 100).toFixed(2)}%`);
    
    try {
        const result = calculateFuturesGrid(inputs);
        
        // Calculate both methods for comparison
        const oldMethodEntryPrice = (inputs.lowerPrice + inputs.upperPrice) / 2;
        const newMethodEntryPrice = Math.sqrt(inputs.lowerPrice * inputs.upperPrice);
        
        console.log('\nEntry Price Comparison:');
        console.log(`  Old Method (Arithmetic Mean): $${oldMethodEntryPrice.toFixed(2)}`);
        console.log(`  New Method (Geometric Mean): $${newMethodEntryPrice.toFixed(2)}`);
        console.log(`  Difference: $${(newMethodEntryPrice - oldMethodEntryPrice).toFixed(2)}`);
        
        console.log('\nGrid Results:');
        console.log(`  Grid Step: $${result.gridStep.toFixed(2)}`);
        console.log(`  Position Size: $${result.positionSize.toLocaleString()}`);
        console.log(`  Reserved Margin: $${result.reservedMargin.toFixed(2)} (${(result.reserveRate * 100).toFixed(1)}%)`);
        console.log(`  Usable Margin: $${result.usableMargin.toFixed(2)}`);
        console.log(`  Maintenance Margin: $${result.maintenanceMargin.toFixed(2)}`);
        
        console.log('\nLiquidation Prices:');
        if (result.liquidationPrices.long) {
            console.log(`  Long Liquidation: $${result.liquidationPrices.long.toFixed(2)}`);
            const distanceToLower = ((result.liquidationPrices.long - inputs.lowerPrice) / inputs.lowerPrice) * 100;
            console.log(`  Distance to Lower Bound: ${distanceToLower.toFixed(2)}%`);
            
            if (result.liquidationPrices.long >= inputs.lowerPrice) {
                console.log(`  ⚠️  WARNING: Liquidation price is WITHIN grid range!`);
            } else {
                console.log(`  ✅ Safe: Liquidation price is below grid range`);
            }
        }
        if (result.liquidationPrices.short) {
            console.log(`  Short Liquidation: $${result.liquidationPrices.short.toFixed(2)}`);
            const distanceToUpper = ((result.liquidationPrices.short - inputs.upperPrice) / inputs.upperPrice) * 100;
            console.log(`  Distance to Upper Bound: ${distanceToUpper.toFixed(2)}%`);
            
            if (result.liquidationPrices.short <= inputs.upperPrice) {
                console.log(`  ⚠️  WARNING: Liquidation price is WITHIN grid range!`);
            } else {
                console.log(`  ✅ Safe: Liquidation price is above grid range`);
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

// Test Case 1: Plan.md BTC Example (Safe Configuration)
runComparisonTest('Plan.md BTC Example (Safe)', {
    lowerPrice: 50000,
    upperPrice: 60000,
    gridCount: 50,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.005,
    autoReserveMargin: true,
    positionSide: 'LONG'
});

// Test Case 2: High Risk Configuration
runComparisonTest('High Risk BTC Grid', {
    lowerPrice: 55000,
    upperPrice: 65000,
    gridCount: 100,
    investment: 1000,
    leverage: 20,
    maintenanceMarginRate: 0.005,
    autoReserveMargin: true,
    positionSide: 'LONG'
});

// Test Case 3: Short Grid
runComparisonTest('ETH Short Grid', {
    lowerPrice: 3000,
    upperPrice: 3500,
    gridCount: 25,
    investment: 500,
    leverage: 5,
    maintenanceMarginRate: 0.01,
    autoReserveMargin: true,
    positionSide: 'SHORT'
});

// Test Case 4: Neutral Grid
runComparisonTest('BTC Neutral Grid', {
    lowerPrice: 45000,
    upperPrice: 55000,
    gridCount: 40,
    investment: 2000,
    leverage: 3,
    maintenanceMarginRate: 0.005,
    autoReserveMargin: true,
    positionSide: 'NEUTRAL'
});

// Test Case 5: Very Wide Range (Should be very safe)
runComparisonTest('Wide Range Safe Grid', {
    lowerPrice: 40000,
    upperPrice: 80000,
    gridCount: 80,
    investment: 1000,
    leverage: 10,
    maintenanceMarginRate: 0.005,
    autoReserveMargin: true,
    positionSide: 'LONG'
});

console.log('\n' + '='.repeat(60));
console.log('🎯 LIQUIDATION SAFETY SUMMARY');
console.log('='.repeat(60));
console.log('✅ All calculations now use the geometric mean method');
console.log('✅ This provides more accurate liquidation price estimates');
console.log('✅ Always ensure liquidation price stays outside your grid range');
console.log('✅ Use lower leverage or wider ranges for safer configurations');