const {dummyDataset} = require("../database/dummyDataset");

const tiMonth = (ipc) => {
    const ti = (((1+(((ipc)/100)))**(1/12))-1);
    return ti;
};

const fuelEnergySelector = (data) => {
    let fuel_info = {}

    if (data === 'diesel' || data === 'Diesel') {
        fuel_info['fuel_price'] = 11795
        fuel_info['fuel_energy'] = 40.7
        fuel_info['emision_factor'] = 74.01
        return fuel_info;
    }

    if (data === 'gasoline' || data === 'Gasoline') {
        fuel_info['fuel_price'] = 16700
        fuel_info['fuel_energy'] = 35.58
        fuel_info['emision_factor'] = 69.25
        return fuel_info;
    }

    if (data != "gasoline" || data != "diesel"){
        return {
            "error": "Tipo de combustible no valido",
            "error_code": 500
        };
    }
};

//  kWh/km
const electricalConsumption = (nominal_energy, autonomy_nominal) => {
    const electrical_consumption = (nominal_energy/(autonomy_nominal*(0.9)));
    return electrical_consumption;
};

//  $/Km
const costElectricalKM = (electrical_consumption, energy_price) => {
    const cost_electrical_km = (energy_price * electrical_consumption);
    return cost_electrical_km;
};

const combustionConsumption = (electrical_consumption) => {
    const combustion_consumption = (electrical_consumption / (0.27) );
    return combustion_consumption;
};

const fuelConsumption = (combustion_consumption, fuel_energy) => {
    const fuel_consumption = (combustion_consumption/fuel_energy);
    return fuel_consumption;
};

const fuelEfficiency = (fuel_consumption) => {
    const fuel_efficiency = (1/fuel_consumption);
    return fuel_efficiency;
};

const fuelCostKm = (fuel_price, fuel_consumption) => {
    const fuel_cost_km = (fuel_price*fuel_consumption);
    return fuel_cost_km;
};

const energyKm = (combustion_consumption) => {
    const energy_km = (combustion_consumption*((3.6)*(10**6)));
    return energy_km;
};

const emisionKm = (emision_factor, energy_km) => {
    const emission_km = ((emision_factor*energy_km)/(1*(10**6)) );
    return emission_km;
};

const savedEnergy = (combustion_consumption, electrical_consumption, annual_use) => {
    const saved_energy = ((combustion_consumption-electrical_consumption)*annual_use);
    return saved_energy;
};

const avoidedEmissions = (emisiones_km, annual_use) => {
    const avoided_emissions = (emisiones_km*annual_use)/(1*(10**6));
    return avoided_emissions;
};

const monthlySavings = (fuel_cost_km, cost_electrical_km, annual_use) => {
    const monthly_savings = (((fuel_cost_km)-(cost_electrical_km))*((annual_use)/12));
    return monthly_savings;
};

const annualSavings = (monthly_savings, ipc_data) => {
    const annual_savings = ( monthly_savings * ((((1+(ipc_data)) **12)-1)/(ipc_data)));
    return annual_savings;
};

const youngTree = async (avoided_emissions) => {
    const tree = ((avoided_emissions*1000)/(dummyDataset['young_tree']));
    return parseInt(tree);
};

const oldTree = async (avoided_emissions) => {
    const tree = ((avoided_emissions*1000)/(dummyDataset['old_tree']));
    return parseInt(tree);
};

const energyH2Cylinders = async (nominal_energy) => {
    const result = (nominal_energy/(dummyDataset['cell_fuel_eficiency_factor']));
    return result;
};

const energyH2LowPresure = async (energy_H2_Cylinders) => {
    const result = (energy_H2_Cylinders/(dummyDataset['compresor_eficiency_factor']));
    return result;
};

const energyConsumed = async (energy_H2_Low_Presure) => {
    const result = (energy_H2_Low_Presure/(dummyDataset['electrolysis_eficiency_factor']));
    return result;
};

const hydrogenMass = async (energy_H2_Low_Presure) => {
    const result = (energy_H2_Low_Presure/(dummyDataset["hydrogen_energy_density"]));
    return result;
};

const litersRequired = async (hydrogen_mass) => {
    const result = (hydrogen_mass*(dummyDataset['water_h2_weight']));
    return result;
};

module.exports = {
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
    tiMonth, 
    fuelEnergySelector,
    energyH2Cylinders,
    energyH2LowPresure,
    energyConsumed,
    hydrogenMass,
    litersRequired
};