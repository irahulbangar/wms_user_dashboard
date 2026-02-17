import type { ReportData } from "./reportHelpers";

interface BalanceData {
  name: string;
  value: number;
}

export function prepareReportData(
  flowBalanceData: BalanceData[],
  storageBalanceData: BalanceData[],
  waterBalanceData: BalanceData[],
): ReportData {
  const getValue = (data: BalanceData[], name: string) =>
    data.find((d) => d.name === name)?.value || 0;

  const totalIn = getValue(flowBalanceData, "Total In");
  const totalOut = getValue(flowBalanceData, "Total Out");
  const totalStock = getValue(storageBalanceData, "Total Stock");
  const availableCapacity = getValue(storageBalanceData, "Available Capacity");
  const flowIn = getValue(waterBalanceData, "Flow In");
  const flowOut = getValue(waterBalanceData, "Flow Out");
  const percolation = getValue(waterBalanceData, "Percolation");
  const evaporation = getValue(waterBalanceData, "Evaporation");
  const consumption = getValue(waterBalanceData, "Consumption");
  const wastage = getValue(waterBalanceData, "Wastage");
  const regeneration = getValue(waterBalanceData, "Regeneration");
  const reuse = getValue(waterBalanceData, "Re-use");
  const rainfall = getValue(waterBalanceData, "Rainfall");

  // Calculate totalIn for water balance: flowIn + evaporation + wastage + consumption
  const waterBalanceTotalIn = flowIn + regeneration + reuse + rainfall;

  // Calculate totalOut for water balance: flowOut + percolation + regeneration + reuse
  const waterBalanceTotalOut =
    flowOut + percolation + consumption + wastage + evaporation;

  return {
    totalIn,
    totalOut,
    totalBalance: totalIn - totalOut,
    totalStock,
    availableCapacity,
    totalCapacity: totalStock + availableCapacity,
    flowIn,
    flowOut,
    percolation,
    evaporation,
    consumption,
    wastage,
    regeneration,
    reuse,
    rainfall,
    netBalance: waterBalanceTotalIn - waterBalanceTotalOut,
  };
}
