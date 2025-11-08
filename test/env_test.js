const assert = require('assert');
const {
    tiMonth,
    fuelEnergySelector,
    electricalConsumption,
    costElectricalKM,
    combustionConsumption,
    fuelConsumption,
    fuelEfficiency,
    fuelCostKm,
    energyKm,
    emisionKm,
    savedEnergy,
    avoidedEmissions,
    monthlySavings,
    annualSavings,
    youngTree,
    oldTree,
    energyH2Cylinders,
    energyH2LowPresure,
    energyConsumed,
    hydrogenMass,
    litersRequired
} = require("../calculators/environment");

describe("Environment Calculations - Complete Test Suite", () => {

    describe("tiMonth - Monthly Interest Calculation", () => {
        it("should calculate monthly interest correctly (PASS)", () => {
            assert.strictEqual(tiMonth(2.8), 0.0023039138595752906);
        });

        it("should return positive value for positive IPC (PASS)", () => {
            const result = tiMonth(5);
            assert.ok(result > 0);
        });

        it("should fail with incorrect expected value (FAIL)", () => {
            assert.strictEqual(tiMonth(3.0), 999.999);
        });

        it.skip("should handle negative IPC (SKIPPED)", () => {
            assert.ok(tiMonth(-2) < 0);
        });

        it.skip("should validate IPC range (SKIPPED)");

        it("should handle timeout scenario (CANCELLED)", { timeout: 1 }, async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            assert.ok(true);
        });
    });

    describe("fuelEnergySelector - Fuel Type Selection", () => {
        it("should return gasoline data correctly (PASS)", () => {
            assert.deepStrictEqual(fuelEnergySelector("gasoline"), {
                "fuel_price": 16700,
                "fuel_energy": 35.58,
                "emision_factor": 69.25
            });
        });

        it("should return diesel data correctly (PASS)", () => {
            assert.deepStrictEqual(fuelEnergySelector("diesel"), {
                "fuel_price": 11795,
                "fuel_energy": 40.7,
                "emision_factor": 74.01
            });
        });

        it("should handle case-insensitive input (PASS)", () => {
            const diesel1 = fuelEnergySelector("Diesel");
            const diesel2 = fuelEnergySelector("diesel");
            assert.deepStrictEqual(diesel1, diesel2);
        });

        it("should return error for invalid fuel type (PASS)", () => {
            const result = fuelEnergySelector("electric");
            assert.strictEqual(result.error, "Tipo de combustible no valido");
            assert.strictEqual(result.error_code, 500);
        });

        it("should fail with wrong fuel price (FAIL)", () => {
            const result = fuelEnergySelector("gasoline");
            assert.strictEqual(result.fuel_price, 99999);
        });

        it.skip("should support biofuel (SKIPPED)", () => {
            //biofuel is not implemented yet
            const result = fuelEnergySelector("biofuel");
            assert.ok(result.fuel_price);
        });

        it("should cancel on abort signal (CANCELLED)", { signal: AbortSignal.timeout(1) }, async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            assert.ok(true);
        });
    });

    describe("electricalConsumption - Electrical Vehicle Consumption", () => {
        it("should calculate consumption correctly (PASS)", () => {
            const result = electricalConsumption(81.14, 200);
            assert.strictEqual(result, 0.4507777777777778);
        });

        it("should return positive values (PASS)", () => {
            const result = electricalConsumption(50, 150);
            assert.ok(result > 0);
        });

        it("should fail with wrong calculation (FAIL)", () => {
            const result = electricalConsumption(81.14, 200);
            assert.strictEqual(result, 1.0);
        });

        it.skip("should handle zero autonomy (SKIPPED)", () => {
            const result = electricalConsumption(100, 0);
            assert.ok(isFinite(result));
        });

        it.skip("should validate input ranges (SKIPPED - TODO)");

        it("should abort on signal (CANCELLED)", { timeout: 1 }, async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            const result = electricalConsumption(100, 200);
            assert.ok(result);
        });
    });

    describe("costElectricalKM - Cost Per Kilometer", () => {
        const consumption = 0.45;
        const energy_price = 978.81;

        it("should calculate cost correctly (PASS)", () => {
            const result = costElectricalKM(consumption, energy_price);
            assert.strictEqual(result, 440.4645);
        });

        it("should return zero when consumption is zero (PASS)", () => {
            assert.strictEqual(costElectricalKM(0, energy_price), 0);
        });

        it("should fail with incorrect calculation (FAIL)", () => {
            const result = costElectricalKM(consumption, energy_price);
            assert.strictEqual(result, 100);
        });

        it.skip("should handle negative prices (SKIPPED)", () => {
            const result = costElectricalKM(consumption, -100);
            assert.ok(result < 0);
        });
    });

    describe("combustionConsumption - Equivalent Combustion Consumption", () => {
        it("should calculate combustion equivalent (PASS)", () => {
            const electrical = electricalConsumption(81.14, 200);
            const result = combustionConsumption(electrical);
            assert.strictEqual(result, 1.669547325102881);
        });

        it("should be higher than electrical consumption (PASS)", () => {
            const electrical = 0.5;
            const combustion = combustionConsumption(electrical);
            assert.ok(combustion > electrical);
        });

        it("should fail with wrong multiplier (FAIL)", () => {
            const result = combustionConsumption(0.5);
            assert.strictEqual(result, 0.5);
        });

        it.skip("should handle very small values (SKIPPED)", () => {
            const result = combustionConsumption(0.0001);
            assert.ok(result > 0);
        });

        it("should timeout with slow operation (CANCELLED)", { timeout: 1 }, async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            combustionConsumption(0.5);
        });
    });

    describe("fuelConsumption - Fuel Consumption in L/km", () => {
        const combustion = combustionConsumption(electricalConsumption(81.14, 200));
        const fuel_energy = 40.7;

        it("should calculate fuel consumption (PASS)", () => {
            const result = fuelConsumption(combustion, fuel_energy);
            assert.strictEqual(result, 0.04102081879859657);
        });

        it("should return positive value (PASS)", () => {
            const result = fuelConsumption(1.5, 35.58);
            assert.ok(result > 0);
        });

        it("should fail with incorrect value (FAIL)", () => {
            const result = fuelConsumption(combustion, fuel_energy);
            assert.strictEqual(result, 0.5);
        });

        it.skip("should handle zero fuel energy (SKIPPED)", () => {
            const result = fuelConsumption(combustion, 0);
            assert.ok(isFinite(result));
        });

        it.skip("should validate fuel energy is positive (SKIPPED - TODO)");
    });

    describe("fuelEfficiency - Fuel Efficiency in km/L", () => {
        it("should calculate efficiency correctly (PASS)", () => {
            const consumption = 0.041;
            const result = fuelEfficiency(consumption);
            assert.ok(Math.abs(result - 24.39) < 0.1);
        });

        it("should be inverse of consumption (PASS)", () => {
            const consumption = 0.05;
            const efficiency = fuelEfficiency(consumption);
            assert.strictEqual(efficiency, 1 / consumption);
        });

        it("should fail with wrong calculation (FAIL)", () => {
            const result = fuelEfficiency(0.041);
            assert.strictEqual(result, 100);
        });

        it.skip("should handle very high consumption (SKIPPED)", () => {
            const result = fuelEfficiency(10);
            assert.ok(result < 1);
        });
    });

    describe("fuelCostKm - Fuel Cost Per Kilometer", () => {
        it("should calculate cost correctly (PASS)", () => {
            const result = fuelCostKm(11795, 0.041);
            assert.ok(Math.abs(result - 483.595) < 0.1);
        });

        it("should return zero for zero consumption (PASS)", () => {
            assert.strictEqual(fuelCostKm(11795, 0), 0);
        });

        it("should fail with incorrect calculation (FAIL)", () => {
            const result = fuelCostKm(11795, 0.041);
            assert.strictEqual(result, 1000);
        });

        it.skip("should handle price changes (SKIPPED)", () => {
            const result1 = fuelCostKm(10000, 0.05);
            const result2 = fuelCostKm(15000, 0.05);
            assert.ok(result2 > result1);
        });

        it("should be cancelled by timeout (CANCELLED)", { timeout: 1 }, async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            fuelCostKm(11795, 0.041);
        });
    });

    describe("energyKm - Energy Per Kilometer in Joules", () => {
        it("should convert kWh to Joules (PASS)", () => {
            const combustion = 1.5;
            const result = energyKm(combustion);
            assert.strictEqual(result, 5400000);
        });

        it("should return positive value (PASS)", () => {
            const result = energyKm(2.0);
            assert.ok(result > 0);
        });

        it("should fail with wrong conversion (FAIL)", () => {
            const result = energyKm(1.5);
            assert.strictEqual(result, 1500);
        });

        it.skip("should handle very large values (SKIPPED)", () => {
            const result = energyKm(1000);
            assert.ok(result > 0);
        });

        it.skip("should validate energy ranges (SKIPPED - TODO)");
    });

    describe("emisionKm - Emissions Per Kilometer", () => {
        it("should calculate emissions correctly (PASS)", () => {
            const energy = energyKm(1.5);
            const result = emisionKm(74.01, energy);
            assert.ok(Math.abs(result - 399.654) < 0.1);
        });

        it("should be proportional to energy (PASS)", () => {
            const energy1 = energyKm(1.0);
            const energy2 = energyKm(2.0);
            const emission1 = emisionKm(74.01, energy1);
            const emission2 = emisionKm(74.01, energy2);
            assert.ok(emission2 > emission1);
        });

        it("should fail with wrong factor (FAIL)", () => {
            const energy = energyKm(1.5);
            const result = emisionKm(74.01, energy);
            assert.strictEqual(result, 1000);
        });

        it.skip("should handle zero emissions (SKIPPED)", () => {
            const result = emisionKm(0, energyKm(1.5));
            assert.strictEqual(result, 0);
        });
    });

    describe("savedEnergy - Annual Energy Savings", () => {
        it("should calculate saved energy (PASS)", () => {
            const combustion = 1.67;
            const electrical = 0.45;
            const annual = 10000;
            const result = savedEnergy(combustion, electrical, annual);
            assert.strictEqual(result, 12200);
        });

        it("should return positive for combustion > electrical (PASS)", () => {
            const result = savedEnergy(2.0, 0.5, 10000);
            assert.ok(result > 0);
        });

        it("should fail with wrong calculation (FAIL)", () => {
            const result = savedEnergy(1.67, 0.45, 10000);
            assert.strictEqual(result, 50000);
        });

        it.skip("should handle negative savings (SKIPPED)", () => {
            const result = savedEnergy(0.5, 2.0, 10000);
            assert.ok(result < 0);
        });

        it.skip("should validate annual use is positive (SKIPPED - TODO)");

        it("should cancel on abort (CANCELLED)", { signal: AbortSignal.timeout(1) }, async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            savedEnergy(1.67, 0.45, 10000);
        });
    });

    describe("avoidedEmissions - Avoided CO2 Emissions", () => {
        it("should calculate avoided emissions in tons (PASS)", () => {
            const emision_km = 400;
            const annual = 10000;
            const result = avoidedEmissions(emision_km, annual);
            assert.strictEqual(result, 4);
        });

        it("should return zero for zero usage (PASS)", () => {
            assert.strictEqual(avoidedEmissions(400, 0), 0);
        });

        it("should fail with wrong unit conversion (FAIL)", () => {
            const result = avoidedEmissions(400, 10000);
            assert.strictEqual(result, 4000000);
        });

        it.skip("should handle very high emissions (SKIPPED)", () => {
            const result = avoidedEmissions(10000, 100000);
            assert.ok(result > 0);
        });
    });

    describe("monthlySavings - Monthly Cost Savings", () => {
        it("should calculate monthly savings (PASS)", () => {
            const fuel_cost = 500;
            const electrical_cost = 450;
            const annual = 12000;
            const result = monthlySavings(fuel_cost, electrical_cost, annual);
            assert.strictEqual(result, 50000);
        });

        it("should return positive when fuel > electrical (PASS)", () => {
            const result = monthlySavings(600, 400, 10000);
            assert.ok(result > 0);
        });

        it("should fail with incorrect division (FAIL)", () => {
            const result = monthlySavings(500, 450, 12000);
            assert.strictEqual(result, 600);
        });

        it.skip("should handle negative savings (SKIPPED)", () => {
            const result = monthlySavings(300, 500, 10000);
            assert.ok(result < 0);
        });
    });

    describe("annualSavings - Annual Savings with IPC", () => {
        it("should calculate annual savings with inflation (PASS)", () => {
            const monthly = 1000;
            const ipc = 0.002;
            const result = annualSavings(monthly, ipc);
            assert.ok(result > 12000);
        });

        it("should be greater than simple multiplication (PASS)", () => {
            const monthly = 1000;
            const ipc = 0.003;
            const result = annualSavings(monthly, ipc);
            assert.ok(result > monthly * 12);
        });

        it("should fail with wrong formula (FAIL)", () => {
            const result = annualSavings(1000, 0.002);
            assert.strictEqual(result, 12000);
        });

        it.skip("should handle zero IPC (SKIPPED)", () => {
            const result = annualSavings(1000, 0);
            assert.ok(isFinite(result));
        });

        it.skip("should validate IPC is not negative (SKIPPED - TODO)");
    });

    describe("youngTree - Young Trees Equivalent", () => {
        // it("should calculate young trees (PASS)", async () => {
        //     const emissions = 2;
        //     const result = await youngTree(emissions);
        //     assert.strictEqual(result, 200);
        // });

        it("should return integer (PASS)", async () => {
            const result = await youngTree(2.567);
            assert.strictEqual(typeof result, 'number');
            assert.strictEqual(result, Math.floor(result));
        });

        it("should fail with wrong calculation (FAIL)", async () => {
            const result = await youngTree(2);
            assert.strictEqual(result, 500);
        });

        it.skip("should handle zero emissions (SKIPPED)", async () => {
            const result = await youngTree(0);
            assert.strictEqual(result, 0);
        });

        it("should cancel async operation (CANCELLED)", { timeout: 1 }, async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            await youngTree(2);
        });
    });

    describe("oldTree - Old Trees Equivalent", () => {
        // it("should calculate old trees (PASS)", async () => {
        //     const emissions = 3;
        //     const result = await oldTree(emissions);
        //     assert.strictEqual(result, 100);
        // });

        // it("should be less than young trees for same emissions (PASS)", async () => {
        //     const emissions = 5;
        //     const young = await youngTree(emissions);
        //     const old = await oldTree(emissions);
        //     assert.ok(old < young);
        // });

        it("should fail with incorrect value (FAIL)", async () => {
            const result = await oldTree(3);
            assert.strictEqual(result, 300);
        });

        it.skip("should handle fractional results (SKIPPED)", async () => {
            const result = await oldTree(0.5);
            assert.ok(result >= 0);
        });

        it.skip("should compare with industry standards (SKIPPED - TODO)");
    });

    // describe("Hydrogen Production Chain", () => {
    //     const nominal_energy = 8.14;

    //     it("should calculate H2 cylinder energy (PASS)", async () => {
    //         const result = await energyH2Cylinders(nominal_energy);
    //         assert.ok(Math.abs(result - 13.566666666666666) < 0.01);
    //     });

    //     it("should calculate low pressure energy (PASS)", async () => {
    //         const cylinders = await energyH2Cylinders(nominal_energy);
    //         const result = await energyH2LowPresure(cylinders);
    //         assert.ok(result > cylinders);
    //         assert.ok(Math.abs(result - 16.958333333333332) < 0.01);
    //     });

    //     it("should calculate total energy consumed (PASS)", async () => {
    //         const cylinders = await energyH2Cylinders(nominal_energy);
    //         const low_pressure = await energyH2LowPresure(cylinders);
    //         const result = await energyConsumed(low_pressure);
    //         assert.ok(result > low_pressure);
    //         assert.ok(Math.abs(result - 22.313596491228072) < 0.01);
    //     });

    //     it("should calculate hydrogen mass (PASS)", async () => {
    //         const cylinders = await energyH2Cylinders(nominal_energy);
    //         const low_pressure = await energyH2LowPresure(cylinders);
    //         const result = await hydrogenMass(low_pressure);
    //         assert.ok(result > 0);
    //         assert.ok(Math.abs(result - 0.5088333333333333) < 0.01);
    //     });

    //     it("should calculate water liters required (PASS)", async () => {
    //         const cylinders = await energyH2Cylinders(nominal_energy);
    //         const low_pressure = await energyH2LowPresure(cylinders);
    //         const h2_mass = await hydrogenMass(low_pressure);
    //         const result = await litersRequired(h2_mass);
    //         assert.ok(result > h2_mass);
    //         assert.ok(Math.abs(result - 4.5795) < 0.01);
    //     });

    //     it("should fail H2 cylinders calculation (FAIL)", async () => {
    //         const result = await energyH2Cylinders(nominal_energy);
    //         assert.strictEqual(result, 100);
    //     });

    //     it.skip("should handle efficiency losses (SKIPPED)", async () => {
    //         const total = await energyConsumed(await energyH2LowPresure(await energyH2Cylinders(10)));
    //         assert.ok(total > 10);
    //     });

    //     it.skip("should optimize hydrogen production chain (SKIPPED - TODO)");

    //     it("should cancel H2 chain calculation (CANCELLED)", { timeout: 1 }, async () => {
    //         await new Promise(resolve => setTimeout(resolve, 100));
    //         await energyH2Cylinders(nominal_energy);
    //     });
    // });



    //ia recommended me to add this 
    describe("Integration Tests - Full Calculation Flow", () => {
        it("should complete full environmental calculation (PASS)", async () => {
            const ipc_annual = 2.8;
            const fuel_type = "diesel";
            
            const ipc = tiMonth(ipc_annual);
            const fes = fuelEnergySelector(fuel_type);
            const elec_consumption = electricalConsumption(81.14, 200);
            const comb_consumption = combustionConsumption(elec_consumption);
            const fuel_cons = fuelConsumption(comb_consumption, fes.fuel_energy);
            
            assert.ok(ipc > 0);
            assert.ok(fes.fuel_energy > 0);
            assert.ok(elec_consumption > 0);
            assert.ok(comb_consumption > elec_consumption);
            assert.ok(fuel_cons > 0);
        });

        it("should calculate complete savings analysis (PASS)", () => {
            const fuel_cost = fuelCostKm(11795, 0.041);
            const elec_cost = costElectricalKM(0.45, 978.81);
            const monthly = monthlySavings(fuel_cost, elec_cost, 10000);
            const annual = annualSavings(monthly, 0.002);
            
            assert.ok(fuel_cost > elec_cost);
            assert.ok(monthly > 0);
            assert.ok(annual > monthly * 12);
        });

        it("should fail integration test (FAIL)", () => {
            const result = tiMonth(2.8) + fuelEfficiency(0.05);
            assert.strictEqual(result, 0);
        });

        it.skip("should handle edge cases in full flow (SKIPPED)", () => {
            assert.ok(true);
        });

        it("should cancel integration flow (CANCELLED)", { timeout: 1 }, async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            const ipc = tiMonth(2.8);
            const fes = fuelEnergySelector("diesel");
            assert.ok(ipc && fes);
        });
    });
});