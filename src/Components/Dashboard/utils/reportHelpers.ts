import * as htmlFile from "../../../assets/Report.html?raw";

export interface SectionVisibility {
  dashboard: boolean;
  plantDiagram: boolean;
  system: boolean;
  department: boolean;
  waterNeutralityIndex: boolean;
  storageAnalysis: boolean;
  waterBalance: boolean;
  detailedReport: boolean;
}

export interface ReportData {
  totalIn: number;
  totalOut: number;
  totalBalance: number;
  totalStock: number;
  availableCapacity: number;
  totalCapacity: number;
  flowIn: number;
  flowOut: number;
  percolation: number;
  evaporation: number;
  consumption: number;
  wastage: number;
  regeneration: number;
  reuse: number;
  rainfall: number;
  netBalance: number;
}

export const createReportWrapper = () => {
  const wrapper = document.createElement("html");
  wrapper.innerHTML = htmlFile.default;

  const baseHref = window.location.origin + (import.meta.env.BASE_URL || "/");
  const head = wrapper.querySelector("head");
  if (head && !head.querySelector("base")) {
    const base = document.createElement("base");
    base.setAttribute("href", baseHref);
    head.insertBefore(base, head.firstChild);
  }

  return { wrapper, baseHref };
};

export interface OrganizationInfo {
  organizationName: string;
  organizationLogo: string;
  organizationIntroduction: string;
  organizationGovernance: string;
  plantName: string;
}

export const updateDateElement = (wrapper: HTMLElement, date: Date): void => {
  const dateElement = wrapper.querySelector(".date-text");
  if (dateElement) {
    dateElement.innerHTML = `<strong>Date:</strong> ${date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    )}`;
  }
};

export const updateOrganizationInfo = (
  wrapper: HTMLElement,
  orgInfo: OrganizationInfo
): void => {
  const orgNameElement = wrapper.querySelector(".header-content h1");
  if (orgNameElement && orgInfo.organizationName) {
    orgNameElement.textContent = orgInfo.organizationName;
  }

  const logoElement = wrapper.querySelector(
    ".header-content .logo"
  ) as HTMLImageElement;
  if (logoElement && orgInfo.organizationLogo) {
    logoElement.src = orgInfo.organizationLogo;
    logoElement.alt = orgInfo.organizationName || "Organization Logo";
  }

  const plantNameElement = wrapper.querySelector(".plant-text");
  if (plantNameElement && orgInfo.plantName) {
    const orgName = orgInfo.organizationName || "";
    plantNameElement.textContent = orgName
      ? `${orgInfo.plantName}`
      : orgInfo.plantName;
  }

  const introSection = wrapper.querySelector(".section:first-of-type");
  if (introSection && orgInfo.organizationIntroduction) {
    const introParagraph = introSection.querySelector("p");
    if (introParagraph) {
      introParagraph.textContent = orgInfo.organizationIntroduction;
    }
  }

  const governanceSection = wrapper.querySelector(".section:nth-of-type(2)");
  if (governanceSection && orgInfo.organizationGovernance) {
    const governanceList = governanceSection.querySelector("ul");
    if (governanceList) {
      let governanceItems: string[] = [];

      if (orgInfo.organizationGovernance.includes("\n")) {
        governanceItems = orgInfo.organizationGovernance
          .split("\n")
          .filter((item) => item.trim().length > 0)
          .map((item) => item.trim());
      } else {
        governanceItems = orgInfo.organizationGovernance
          .split(/\.(?=\s[A-Z])|\.(?=\n)/)
          .filter((item) => item.trim().length > 0)
          .map((item) => item.trim() + (item.trim().endsWith(".") ? "" : "."));
      }

      if (governanceItems.length > 0) {
        governanceList.innerHTML = governanceItems
          .map((item) => `<li>${item}</li>`)
          .join("");
      }
    }
  }
};

export const setElementVisibility = (
  element: HTMLElement | null,
  visible: boolean
): void => {
  if (element) {
    element.style.display = visible ? "" : "none";
  }
};

export const updateTableRow = (row: Element, value: number): void => {
  const cell = row.querySelector(`td:nth-child(2)`);
  if (cell) {
    const formattedValue =
      value < 0 ? `-${Math.abs(value).toFixed(2)}` : value.toFixed(2);
    cell.textContent = formattedValue;
  }
};

export const createChartScript = (
  id: string,
  labels: string[],
  values: number[]
): string => {
  return `createPieChart(
          "${id}",
          ${JSON.stringify(labels)},
          ${JSON.stringify(values)}
        );`;
};

export const getChartData = (
  data: ReportData,
  type: "flow" | "storage" | "waterBalance"
): { labels: string[]; values: number[]; colors: string[] } => {
  const labels: string[] = [];
  const values: number[] = [];
  const colors: string[] = [];

  if (type === "flow") {
    if (data.totalIn > 0) {
      labels.push("Total In");
      values.push(data.totalIn);
      colors.push("#5070de");
    }
    if (data.totalOut > 0) {
      labels.push("Total Out");
      values.push(data.totalOut);
      colors.push("#b6d733");
    }
  } else if (type === "storage") {
    if (data.totalStock > 0) {
      labels.push("Total Stock");
      values.push(data.totalStock);
      colors.push("#505472");
    }
    if (data.availableCapacity > 0) {
      labels.push("Available Capacity");
      values.push(data.availableCapacity);
      colors.push("#fe994e");
    }
  } else if (type === "waterBalance") {
    const balanceData = [
      { label: "Flow In", value: data.flowIn, color: "#5070de" },
      { label: "Flow Out", value: data.flowOut, color: "#b6d733" },
      { label: "Percolation", value: data.percolation, color: "#505472" },
      { label: "Evaporation", value: data.evaporation, color: "#fe994e" },
      { label: "Consumption", value: data.consumption, color: "#0ca9df" },
      { label: "Wastage", value: data.wastage, color: "#ffd209" },
      { label: "Regeneration", value: data.regeneration, color: "#fa6488" },
      { label: "Re-use", value: data.reuse, color: "#7a5db0" },
    ];

    balanceData.forEach((item) => {
      if (item.value > 0) {
        labels.push(item.label);
        values.push(item.value);
        colors.push(item.color);
      }
    });
  }

  return { labels, values, colors };
};
