import type { ReportData, SectionVisibility } from "./reportHelpers";
import {
  setElementVisibility,
  updateTableRow,
  createChartScript,
  getChartData,
} from "./reportHelpers";

export const setupWaterNeutralityIndexSection = (
  wrapper: HTMLElement,
  neutralityData: Array<{ name: string; value: number; color: string }>,
  neutralityValue: number | null,
  selectedSections: SectionVisibility,
  unit: string = "Ltr."
): void => {
  const hasNeutralityData = neutralityData.some((item) => item.value > 0);
  const shouldShow = selectedSections.waterNeutralityIndex && hasNeutralityData;

  const sectionContainer = wrapper.querySelector(
    ".piechart-section"
  ) as HTMLElement;
  setElementVisibility(sectionContainer, shouldShow);
  setElementVisibility(
    sectionContainer?.querySelector("h2") as HTMLElement,
    shouldShow
  );
  setElementVisibility(
    wrapper.querySelector(".piechart-flow") as HTMLElement,
    shouldShow
  );
  setElementVisibility(
    wrapper.querySelector("#neutralityPieChart") as HTMLElement,
    shouldShow
  );
  setElementVisibility(
    wrapper.querySelector(".piechart-flow table") as HTMLElement,
    shouldShow
  );

  if (shouldShow) {
    const neutralityTableRows = wrapper.querySelectorAll(
      ".piechart-flow table tr:not(:first-child)"
    );

    const dataMap: Record<string, number> = {};
    neutralityData.forEach((item) => {
      dataMap[item.name] = item.value;
    });

    neutralityTableRows.forEach((row) => {
      const cell = row.querySelector("td:first-child");
      if (cell) {
        const category = cell.textContent?.trim();
        if (category && dataMap[category] !== undefined) {
          updateTableRow(row, dataMap[category]);
          const unitCell = row.querySelector("td:nth-child(3)");
          if (unitCell && category !== "Water Neutrality Index") {
            unitCell.textContent = unit;
          }
        } else if (
          category === "Water Neutrality Index" &&
          neutralityValue !== null
        ) {
          const valueCell = row.querySelector("td:nth-child(2)");
          if (valueCell) {
            const percentageValue =
              neutralityValue > 1 ? neutralityValue : neutralityValue * 100;
            valueCell.textContent = `${percentageValue.toFixed(2)}`;
          }
          const unitCell = row.querySelector("td:nth-child(3)");
          if (unitCell) {
            unitCell.textContent = "%";
          }
        }
      }
    });
  }
};

export const setupStorageSection = (
  wrapper: HTMLElement,
  data: ReportData,
  selectedSections: SectionVisibility
): void => {
  const hasStorageData = data.totalStock > 0 || data.availableCapacity > 0;
  const shouldShow = selectedSections.storageAnalysis && hasStorageData;

  const sectionContainer = wrapper.querySelector(
    ".piechart-section-storage"
  ) as HTMLElement;
  setElementVisibility(sectionContainer, shouldShow);
  setElementVisibility(
    sectionContainer?.querySelector("h2") as HTMLElement,
    shouldShow
  );
  setElementVisibility(
    wrapper.querySelector(".piechart-storage") as HTMLElement,
    shouldShow
  );
  setElementVisibility(
    wrapper.querySelector("#storagePieChart") as HTMLElement,
    shouldShow
  );
  setElementVisibility(
    wrapper.querySelector(".piechart-storage table") as HTMLElement,
    shouldShow
  );

  const storageTableRows = wrapper.querySelectorAll(
    ".piechart-storage table tr:not(:first-child)"
  );
  if (storageTableRows.length >= 3 && shouldShow) {
    updateTableRow(storageTableRows[0], data.totalStock);
    updateTableRow(storageTableRows[1], data.availableCapacity);
    updateTableRow(storageTableRows[2], data.totalCapacity);
  }
};

export const setupWaterBalanceSection = (
  wrapper: HTMLElement,
  data: ReportData,
  selectedSections: SectionVisibility
): void => {
  const hasWaterBalanceData =
    data.flowIn > 0 ||
    data.flowOut > 0 ||
    data.percolation > 0 ||
    data.evaporation > 0 ||
    data.consumption > 0 ||
    data.wastage > 0 ||
    data.regeneration > 0 ||
    data.reuse > 0;
  const shouldShow = selectedSections.waterBalance && hasWaterBalanceData;

  const sectionContainer = wrapper.querySelector(
    ".piechart-section.water-balance-section"
  ) as HTMLElement;
  setElementVisibility(sectionContainer, shouldShow);
  setElementVisibility(
    sectionContainer?.querySelector("h2") as HTMLElement,
    shouldShow
  );
  setElementVisibility(
    wrapper.querySelector(".piechart-balance") as HTMLElement,
    shouldShow
  );
  setElementVisibility(
    wrapper.querySelector("#balancePieChart") as HTMLElement,
    shouldShow
  );
  setElementVisibility(
    wrapper.querySelector(".piechart-balance table") as HTMLElement,
    shouldShow
  );

  const balanceTableRows = wrapper.querySelectorAll(
    ".piechart-balance table tr:not(:first-child)"
  );
  if (balanceTableRows.length >= 9 && shouldShow) {
    const balanceValues = [
      data.flowIn,
      data.flowOut,
      data.percolation,
      data.evaporation,
      data.consumption,
      data.wastage,
      data.regeneration,
      data.reuse,
      data.netBalance,
    ];
    balanceValues.forEach((value, index) => {
      updateTableRow(balanceTableRows[index], value);
    });
  }
};

export const setupDetailedReportSection = (
  wrapper: HTMLElement,
  data: ReportData,
  neutralityValue: number | null,
  selectedSections: SectionVisibility
): void => {
  const hasDetailedReportData =
    data.totalCapacity > 0 || data.netBalance !== 0 || neutralityValue !== null;
  const shouldShow = selectedSections.detailedReport && hasDetailedReportData;

  const section = wrapper.querySelector(
    ".detailed-report-section"
  ) as HTMLElement;
  setElementVisibility(section, shouldShow);
  setElementVisibility(section?.querySelector("h2") as HTMLElement, shouldShow);

  if (shouldShow) {
    const flowSection = wrapper.querySelector(
      ".detailed-report-section .detailed-report-table:nth-of-type(1)"
    ) as HTMLElement;
    if (flowSection) {
      flowSection.style.display = "none";
    }

    const storageBalance = wrapper.querySelector(
      ".detailed-report-section .detailed-report-table:nth-of-type(1) table td:nth-child(2)"
    );
    if (storageBalance) {
      storageBalance.textContent = `${data.totalCapacity.toFixed(2)} Ltr`;
    }

    const waterBalance = wrapper.querySelector(
      ".detailed-report-section .detailed-report-table:nth-of-type(2) table td:nth-child(2)"
    );
    if (waterBalance) {
      const formattedValue =
        data.netBalance < 0
          ? `-${Math.abs(data.netBalance).toFixed(2)} Ltr`
          : `${data.netBalance.toFixed(2)} Ltr`;
      waterBalance.textContent = formattedValue;
    }

    const neutralityIndex = wrapper.querySelector(
      ".detailed-report-section .detailed-report-table:nth-of-type(3) table td:nth-child(2)"
    );
    if (neutralityIndex && neutralityValue !== null) {
      const percentageValue =
        neutralityValue > 1 ? neutralityValue : neutralityValue * 100;
      neutralityIndex.textContent = `${percentageValue.toFixed(2)}%`;
    }

    const statusText = wrapper.querySelector(
      ".detailed-report-section .detailed-report-table:nth-of-type(3) .neutrality-status-text"
    ) as HTMLElement;
    if (statusText && neutralityValue !== null) {
      const ratioValue =
        neutralityValue > 1 ? neutralityValue / 100 : neutralityValue;
      if (Math.abs(ratioValue - 1) < 0.01) {
        statusText.textContent = "The system is Water Neutral.";
      } else if (ratioValue > 1) {
        statusText.textContent =
          "The system is Water Positive (replenishes more than it consumes).";
      } else {
        statusText.textContent =
          "The system is Water Negative (consumes more than it replenishes).";
      }
    }
  }
};

export const setupCharts = (
  wrapper: HTMLElement,
  data: ReportData,
  neutralityData: Array<{ name: string; value: number; color: string }>,
  selectedSections: SectionVisibility
): void => {
  const scriptTag = wrapper.querySelector("script:last-of-type");
  if (!scriptTag) return;

  const chartScripts: string[] = [];

  const hasNeutralityData = neutralityData.some((item) => item.value > 0);
  if (selectedSections.waterNeutralityIndex && hasNeutralityData) {
    const labels = neutralityData.map((item) => item.name);
    const values = neutralityData.map((item) => item.value);
    if (labels.length > 0 && values.some((v) => v > 0)) {
      chartScripts.push(
        createChartScript("neutralityPieChart", labels, values)
      );
    }
  }

  const hasStorageData = data.totalStock > 0 || data.availableCapacity > 0;
  if (selectedSections.storageAnalysis && hasStorageData) {
    const storageChart = getChartData(data, "storage");
    if (storageChart.labels.length > 0) {
      chartScripts.push(
        createChartScript(
          "storagePieChart",
          storageChart.labels,
          storageChart.values
        )
      );
    }
  }

  const hasWaterBalanceData =
    data.flowIn > 0 ||
    data.flowOut > 0 ||
    data.percolation > 0 ||
    data.evaporation > 0 ||
    data.consumption > 0 ||
    data.wastage > 0 ||
    data.regeneration > 0 ||
    data.reuse > 0;
  if (selectedSections.waterBalance && hasWaterBalanceData) {
    const balanceChart = getChartData(data, "waterBalance");
    if (balanceChart.labels.length > 0) {
      chartScripts.push(
        createChartScript(
          "balancePieChart",
          balanceChart.labels,
          balanceChart.values
        )
      );
    }
  }

  const neutralityColorMap: Record<string, string> = {};
  neutralityData.forEach((item) => {
    neutralityColorMap[item.name] = item.color;
  });

  scriptTag.textContent = `
      // Consistent color mapping for report types
      const neutralityColorMap = ${JSON.stringify(neutralityColorMap)};
      const getReportTypeColor = (reportTypeName) => {
        const defaultColors = [
          "#5070de", "#b6d733", "#505472", "#fe994e", 
          "#0ca9df", "#ffd209", "#fa6488", "#7a5db0",
          "#b8322d", "#40bf96", "#515670", "#7da6d2", "#a2eac6"
        ];
        const colorMap = {
          "Flow In": 0,
          "Total In": 0,
          "Flow Out": 1,
          "Total Out": 1,
          "Percolation": 2,
          "Evaporation": 3,
          "Consumption": 4,
          "Wastage": 5,
          "Regeneration": 6,
          "Re-use": 7,
          "Rainfall": 9,
          "Total Stock": 0,
          "Available Capacity": 11,
          "Water Neutrality Index": 12,
        };
        
        // Use colors from neutrality data if available
        if (neutralityColorMap[reportTypeName]) {
          return neutralityColorMap[reportTypeName];
        }
        
        const colorIndex = colorMap[reportTypeName] !== undefined 
          ? colorMap[reportTypeName] 
          : (reportTypeName.charCodeAt(0) % defaultColors.length);
        return defaultColors[colorIndex];
      };

      const createPieChart = (id, labels, values) => {
        const chartElement = document.getElementById(id);
        if (!chartElement) return;
        
        // Use consistent colors based on report type names
        const colors = labels.map(label => getReportTypeColor(label));
        
        // Calculate total for percentage calculation
        const total = values.reduce((sum, val) => sum + (val || 0), 0);
        
        new Chart(chartElement, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [
              {
                data: values,
                backgroundColor: colors,
                hoverOffset: 6,
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'right',
                align: 'center',
                labels: {
                  usePointStyle: false,
                  boxWidth: 20,
                  boxHeight: 15,
                  padding: 8,
                  font: {
                    family: 'Roboto',
                    size: 12,
                    weight: 'normal'
                  },
                  color: '#222',
                  generateLabels: function(chart) {
                    const data = chart.data;
                    if (data.labels.length && data.datasets.length) {
                      return data.labels.map((label, i) => {
                        const dataset = data.datasets[0];
                        const value = dataset.data[i] || 0;
                        const color = dataset.backgroundColor[i];
                        return {
                          text: label,
                          fillStyle: color,
                          hidden: false,
                          index: i,
                          fontColor: '#222',
                          strokeStyle: color,
                          lineWidth: 0
                        };
                      });
                    }
                    return [];
                  }
                }
              },
            },
          },
          plugins: [{
            id: 'percentageLabels',
            afterDraw: (chart) => {
              const ctx = chart.ctx;
              const total = chart.data.datasets[0].data.reduce((sum, val) => sum + (val || 0), 0);
              
              if (total === 0) return;
              
              chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((element, index) => {
                  const value = dataset.data[index] || 0;
                  const percentage = ((value / total) * 100).toFixed(1);
                  
                  // Only show percentage if it's greater than 0 and segment is visible
                  if (value > 0 && percentage > 0) {
                    try {
                      const { x, y } = element.tooltipPosition();
                      
                      // Get the center of the chart
                      const chartArea = chart.chartArea;
                      const centerX = (chartArea.left + chartArea.right) / 2;
                      const centerY = (chartArea.top + chartArea.bottom) / 2;
                      
                      // Calculate angle from center to element position
                      const dx = x - centerX;
                      const dy = y - centerY;
                      const angle = Math.atan2(dy, dx);
                      
                      // Calculate position at 60% of radius from center
                      const radius = Math.min(
                        (chartArea.right - chartArea.left) / 2,
                        (chartArea.bottom - chartArea.top) / 2
                      ) * 0.6;
                      
                      const xPos = centerX + Math.cos(angle) * radius;
                      const yPos = centerY + Math.sin(angle) * radius;
                      
                      // Draw percentage text with shadow for better visibility
                      ctx.save();
                      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                      ctx.shadowBlur = 2;
                      ctx.shadowOffsetX = 1;
                      ctx.shadowOffsetY = 1;
                      ctx.fillStyle = '#fff';
                      ctx.font = 'normal 14px Roboto';
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillText(percentage + '%', xPos, yPos);
                      ctx.restore();
                    } catch (e) {
                      // Fallback if tooltipPosition is not available
                      console.warn('Could not draw percentage label:', e);
                    }
                  }
                });
              });
            }
          }],
        });
      };

      ${chartScripts.join("\n      ")}
    `;
};

export const setupScreenshotSections = (
  wrapper: HTMLElement,
  selectedSections: SectionVisibility,
  screenshots: {
    dashboard?: string | null;
    plantDiagram?: string | null;
    systems?: Array<{
      systemId: number;
      systemName: string;
      screenshot: string | null;
    }>;
    departments?: Array<{
      departmentId: number;
      departmentName: string;
      screenshot: string | null;
    }>;
  },
  defaultImages: {
    dashboard: string;
    plantDiagram: string;
    system: string;
    department: string;
  }
): void => {
  const sections = [
    { key: "dashboard", selector: ".dashboard" },
    { key: "plantDiagram", selector: ".daigram-section" },
  ];

  sections.forEach(({ key, selector }) => {
    const section = wrapper.querySelector(selector) as HTMLElement;
    setElementVisibility(
      section,
      selectedSections[key as keyof SectionVisibility]
    );
  });

  const systemSection = wrapper.querySelector(".system-section") as HTMLElement;
  if (systemSection) {
    const shouldShow = Boolean(
      selectedSections.system &&
        screenshots.systems &&
        screenshots.systems.length > 0
    );
    setElementVisibility(systemSection, shouldShow);

    if (shouldShow && screenshots.systems && screenshots.systems.length > 0) {
      const systemsWithScreenshots = screenshots.systems.filter(
        (sys) => sys.screenshot && sys.screenshot.trim() !== ""
      );

      if (systemsWithScreenshots.length === 0) {
        setElementVisibility(systemSection, false);
        return;
      }

      const systemContent = systemSection.querySelector(".system-content");
      if (systemContent) {
        systemContent.innerHTML = "";

        const systemTitle = systemSection.querySelector("h1.system-title");
        if (systemTitle) {
          systemTitle.textContent = "Systems Report";
        }

        if (systemsWithScreenshots.length === 1) {
          const h2Element = systemSection.querySelector("h2");
          if (h2Element) {
            h2Element.textContent = systemsWithScreenshots[0].systemName;
          }
          const img = document.createElement("img");
          const screenshotSrc = systemsWithScreenshots[0].screenshot!;
          img.setAttribute("src", screenshotSrc);
          img.setAttribute("alt", systemsWithScreenshots[0].systemName);
          img.className = "system-image";
          img.style.maxWidth = "100%";
          img.style.height = "auto";
          systemContent.appendChild(img);
        } else {
          let lastInsertedNode: Node = systemSection;

          systemsWithScreenshots.forEach((sys, index) => {
            if (index === 0) {
              const h2Element = systemSection.querySelector("h2");
              if (h2Element) {
                h2Element.textContent = sys.systemName;
              }
              const img = document.createElement("img");
              const screenshotSrc = sys.screenshot!;
              img.setAttribute("src", screenshotSrc);
              img.setAttribute("alt", sys.systemName);
              img.className = "system-image";
              img.style.maxWidth = "100%";
              img.style.height = "auto";
              systemContent.appendChild(img);
            } else if (lastInsertedNode.parentNode) {
              const newSection = systemSection.cloneNode(true) as HTMLElement;

              const newH1 = newSection.querySelector(
                "h1.system-title"
              ) as HTMLElement;
              if (newH1) {
                newH1.style.display = "none";
              }

              const newH2 = newSection.querySelector("h2");
              if (newH2) {
                newH2.textContent = sys.systemName;
              }

              const newContent = newSection.querySelector(".system-content");
              if (newContent) {
                newContent.innerHTML = "";
                const img = document.createElement("img");
                const screenshotSrc = sys.screenshot!;
                img.setAttribute("src", screenshotSrc);
                img.setAttribute("alt", sys.systemName);
                img.className = "system-image";
                img.style.maxWidth = "100%";
                img.style.height = "auto";
                newContent.appendChild(img);
              }
              if (
                lastInsertedNode.parentNode &&
                lastInsertedNode.parentNode.contains(lastInsertedNode)
              ) {
                try {
                  const nextSibling = lastInsertedNode.nextSibling;
                  if (
                    nextSibling &&
                    lastInsertedNode.parentNode.contains(nextSibling)
                  ) {
                    lastInsertedNode.parentNode.insertBefore(
                      newSection,
                      nextSibling
                    );
                  } else {
                    lastInsertedNode.parentNode.appendChild(newSection);
                  }
                  lastInsertedNode = newSection;
                } catch (error) {
                  console.warn(
                    "insertBefore failed, appending instead:",
                    error
                  );
                  try {
                    if (
                      lastInsertedNode.parentNode &&
                      lastInsertedNode.parentNode.contains(lastInsertedNode)
                    ) {
                      lastInsertedNode.parentNode.appendChild(newSection);
                    } else {
                      const parent = lastInsertedNode.parentNode;
                      if (parent) {
                        parent.appendChild(newSection);
                      }
                    }
                  } catch (appendError) {
                    console.warn("appendChild also failed:", appendError);
                  }
                  lastInsertedNode = newSection;
                }
              }
            }
          });
        }
      }
    }
  }

  const departmentSection = wrapper.querySelector(
    ".department-section"
  ) as HTMLElement;
  if (departmentSection) {
    const shouldShow = Boolean(
      selectedSections.department &&
        screenshots.departments &&
        screenshots.departments.length > 0
    );
    setElementVisibility(departmentSection, shouldShow);

    if (
      shouldShow &&
      screenshots.departments &&
      screenshots.departments.length > 0
    ) {
      const departmentsWithScreenshots = screenshots.departments.filter(
        (dept) => dept.screenshot && dept.screenshot.trim() !== ""
      );
      const departmentContent = departmentSection.querySelector(
        ".department-content"
      );
      if (departmentContent) {
        departmentContent.innerHTML = "";

        const departmentTitle = departmentSection.querySelector(
          "h1.department-title"
        );
        if (departmentTitle) {
          departmentTitle.textContent = "Departments Report";
        }

        if (departmentsWithScreenshots.length === 1) {
          const h2Element = departmentSection.querySelector("h2");
          if (h2Element) {
            h2Element.textContent =
              departmentsWithScreenshots[0].departmentName;
          }
          const img = document.createElement("img");
          const screenshotSrc = departmentsWithScreenshots[0].screenshot!;
          img.setAttribute("src", screenshotSrc);
          img.setAttribute("alt", departmentsWithScreenshots[0].departmentName);
          img.className = "department-image";
          img.style.maxWidth = "100%";
          img.style.height = "auto";
          departmentContent.appendChild(img);
        } else {
          let lastInsertedNode: Node = departmentSection;

          departmentsWithScreenshots.forEach((dept, index) => {
            if (index === 0) {
              const h2Element = departmentSection.querySelector("h2");
              if (h2Element) {
                h2Element.textContent = dept.departmentName;
              }
              const img = document.createElement("img");
              const screenshotSrc = dept.screenshot!;
              img.setAttribute("src", screenshotSrc);
              img.setAttribute("alt", dept.departmentName);
              img.className = "department-image";
              img.style.maxWidth = "100%";
              img.style.height = "auto";
              departmentContent.appendChild(img);
            } else if (lastInsertedNode.parentNode) {
              const newSection = departmentSection.cloneNode(
                true
              ) as HTMLElement;

              const newH1 = newSection.querySelector(
                "h1.department-title"
              ) as HTMLElement;
              if (newH1) {
                newH1.style.display = "none";
              }

              const newH2 = newSection.querySelector("h2");
              if (newH2) {
                newH2.textContent = dept.departmentName;
              }

              const newContent = newSection.querySelector(
                ".department-content"
              );
              if (newContent) {
                newContent.innerHTML = "";
                const img = document.createElement("img");
                const screenshotSrc = dept.screenshot!;
                img.setAttribute("src", screenshotSrc);
                img.setAttribute("alt", dept.departmentName);
                img.className = "department-image";
                img.style.maxWidth = "100%";
                img.style.height = "auto";
                newContent.appendChild(img);
              }
              if (
                lastInsertedNode.parentNode &&
                lastInsertedNode.parentNode.contains(lastInsertedNode)
              ) {
                try {
                  const nextSibling = lastInsertedNode.nextSibling;
                  if (
                    nextSibling &&
                    lastInsertedNode.parentNode.contains(nextSibling)
                  ) {
                    lastInsertedNode.parentNode.insertBefore(
                      newSection,
                      nextSibling
                    );
                  } else {
                    lastInsertedNode.parentNode.appendChild(newSection);
                  }
                  lastInsertedNode = newSection;
                } catch (error) {
                  console.warn(
                    "insertBefore failed, appending instead:",
                    error
                  );
                  try {
                    if (
                      lastInsertedNode.parentNode &&
                      lastInsertedNode.parentNode.contains(lastInsertedNode)
                    ) {
                      lastInsertedNode.parentNode.appendChild(newSection);
                    } else {
                      const parent = lastInsertedNode.parentNode;
                      if (parent) {
                        parent.appendChild(newSection);
                      }
                    }
                  } catch (appendError) {
                    console.warn("appendChild also failed:", appendError);
                  }
                  lastInsertedNode = newSection;
                }
              }
            }
          });
        }
      }
    }
  }

  const dashboardImg = wrapper.querySelector(
    '.dashboard img.dashboard-image, img[src="images/dashboard.png"]'
  ) as HTMLImageElement | null;
  if (dashboardImg) {
    const screenshotSrc =
      selectedSections.dashboard && screenshots.dashboard
        ? screenshots.dashboard
        : defaultImages.dashboard;
    dashboardImg.src = screenshotSrc;
    dashboardImg.style.maxWidth = "100%";
    dashboardImg.style.height = "auto";
  } else {
    console.warn(
      "[Report] Dashboard image element not found in report template"
    );
  }

  const plantDiagramImg = wrapper.querySelector(
    '.daigram-section img.daigram-image, img[src="images/daigram.png"]'
  ) as HTMLImageElement | null;
  if (plantDiagramImg) {
    const screenshotSrc =
      selectedSections.plantDiagram && screenshots.plantDiagram
        ? screenshots.plantDiagram
        : defaultImages.plantDiagram;
    plantDiagramImg.src = screenshotSrc;
    plantDiagramImg.style.maxWidth = "100%";
    plantDiagramImg.style.height = "auto";
  } else {
    console.warn(
      "[Report] Plant diagram image element not found in report template"
    );
  }

  const footer = wrapper.querySelector("footer.sustain-text");
  if (footer) {
    footer.textContent = "Sustaining Every Drop with Bulfro";
  }
};
