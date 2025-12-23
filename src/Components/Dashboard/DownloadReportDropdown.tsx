import { Download, ChevronDown, Loader2, ChevronRight } from "lucide-react";
import { SelectionDropdown } from "./SelectionDropdown";
import type { SectionVisibility } from "./utils/reportHelpers";
import { useState, useEffect, useRef } from "react";

interface DownloadReportDropdownProps {
  isDownloadingReport: boolean;
  isDownloadDropdownOpen: boolean;
  setIsDownloadDropdownOpen: (open: boolean) => void;
  reportProgress: {
    percentage: number;
    timeRemaining: number;
    status: string;
  };
  selectedSections: SectionVisibility;
  setSelectedSections: (sections: SectionVisibility) => void;
  selectedDepartmentIds: Set<number>;
  setSelectedDepartmentIds: (ids: Set<number>) => void;
  selectedSystemIds: Set<number>;
  setSelectedSystemIds: (ids: Set<number>) => void;
  isDepartmentDropdownOpen: boolean;
  setIsDepartmentDropdownOpen: (open: boolean) => void;
  isSystemDropdownOpen: boolean;
  setIsSystemDropdownOpen: (open: boolean) => void;
  departments: any[] | null;
  systems: any[] | null;
  plantIdNum: number;
  downloadDropdownRef: React.RefObject<HTMLDivElement | null>;
  departmentDropdownRef: React.RefObject<HTMLDivElement | null>;
  systemDropdownRef: React.RefObject<HTMLDivElement | null>;
  departmentChevronRef: React.RefObject<HTMLButtonElement | null>;
  systemChevronRef: React.RefObject<HTMLButtonElement | null>;
  handleDownloadReport: () => void;
}

const sectionOptions = [
  { key: "dashboard", label: "Dashboard Screenshot" },
  { key: "plantDiagram", label: "Plant Diagram" },
  { key: "department", label: "Department Screenshot" },
  { key: "system", label: "System Screenshot" },
  { key: "waterBalance", label: "Water Balance" },
  { key: "waterNeutralityIndex", label: "Water Neutrality Index" },
  { key: "storageAnalysis", label: "Storage Analysis" },
  { key: "detailedReport", label: "Detailed Report" },
];

export const DownloadReportDropdown = ({
  isDownloadingReport,
  isDownloadDropdownOpen,
  setIsDownloadDropdownOpen,
  selectedSections,
  setSelectedSections,
  selectedDepartmentIds,
  setSelectedDepartmentIds,
  selectedSystemIds,
  setSelectedSystemIds,
  isDepartmentDropdownOpen,
  setIsDepartmentDropdownOpen,
  isSystemDropdownOpen,
  setIsSystemDropdownOpen,
  departments,
  systems,
  plantIdNum,
  downloadDropdownRef,
  departmentDropdownRef,
  systemDropdownRef,
  departmentChevronRef,
  systemChevronRef,
  handleDownloadReport,
}: DownloadReportDropdownProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isWrapping, setIsWrapping] = useState(false);

  useEffect(() => {
    const checkWrapping = () => {
      if (wrapperRef.current) {
        let parentContainer = wrapperRef.current.parentElement;

        while (parentContainer) {
          const computedStyle = window.getComputedStyle(parentContainer);
          const isFlex =
            computedStyle.display === "flex" ||
            computedStyle.display === "inline-flex";

          if (isFlex) {
            const flexWrap = computedStyle.flexWrap;
            const hasFlexWrap = flexWrap !== "nowrap";

            if (hasFlexWrap) {
              const children = Array.from(
                parentContainer.children
              ) as HTMLElement[];

              if (children.length < 2) {
                setIsWrapping(false);
                return;
              }

              const firstChildTop = children[0].offsetTop;

              const hasWrapping = children.some(
                (child) => Math.abs(child.offsetTop - firstChildTop) > 10
              );

              setIsWrapping(hasWrapping);
              return;
            }
          }
          parentContainer = parentContainer.parentElement;
        }

        setIsWrapping(false);
      }
    };

    checkWrapping();

    window.addEventListener("resize", checkWrapping);

    if (isDownloadDropdownOpen) {
      setTimeout(checkWrapping, 100);
    }

    let resizeObserver: ResizeObserver | null = null;
    if (wrapperRef.current) {
      let parentContainer = wrapperRef.current.parentElement;
      while (parentContainer) {
        const computedStyle = window.getComputedStyle(parentContainer);
        const isFlex =
          computedStyle.display === "flex" ||
          computedStyle.display === "inline-flex";
        const flexWrap = computedStyle.flexWrap;

        if (isFlex && flexWrap !== "nowrap") {
          resizeObserver = new ResizeObserver(() => {
            checkWrapping();
          });
          resizeObserver.observe(parentContainer);
          break;
        }
        parentContainer = parentContainer.parentElement;
      }
    }

    return () => {
      window.removeEventListener("resize", checkWrapping);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isDownloadDropdownOpen]);

  return (
    <div ref={wrapperRef} className="relative flex items-center gap-3">
      <div className="relative" ref={downloadDropdownRef}>
        <button
          onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
          disabled={isDownloadingReport}
          className="bg-primary text-text-primary px-4 py-1.5 rounded-md flex items-center font-roboto text-base font-normal gap-2 cursor-pointer hover:bg-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Download className="w-4 h-4 text-text-primary" />
          Download Report
          <ChevronDown
            className={`w-4 h-4 text-text-primary transition-transform ${
              isDownloadDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isDownloadDropdownOpen && (
          <div
            className={`absolute mt-2 w-60 bg-input-bg border border-border-primary rounded-lg shadow-lg z-50 ${
              isWrapping ? "left-0" : "right-0"
            }`}
          >
            <div className="p-2 pb-4">
              <div className="text-sm border-b border-border-secondary font-normal text-text-secondary mb-2 px-2 py-1">
                Select Sections
              </div>
              <div className="space-y-1 max-h-[350px] overflow-y-auto">
                {sectionOptions.map((section) => (
                  <div key={section.key}>
                    <label className="flex items-center gap-2 px-2 py-1.5 bg-primary border-b border-border-secondary hover:shadow-sm cursor-pointer justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={
                              selectedSections[
                                section.key as keyof SectionVisibility
                              ]
                            }
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setSelectedSections({
                                ...selectedSections,
                                [section.key]: isChecked,
                              });
                              if (section.key === "department" && departments) {
                                if (isChecked) {
                                  const plantDepartments = departments.filter(
                                    (d) => d.plant_id === plantIdNum
                                  );
                                  setSelectedDepartmentIds(
                                    new Set(
                                      plantDepartments.map(
                                        (d) => d.department_id
                                      )
                                    )
                                  );
                                } else {
                                  setSelectedDepartmentIds(new Set());
                                }
                              } else if (section.key === "system" && systems) {
                                if (isChecked) {
                                  const plantSystems = systems.filter(
                                    (s) => s.plant_id === plantIdNum
                                  );
                                  setSelectedSystemIds(
                                    new Set(
                                      plantSystems.map((s) => s.system_id)
                                    )
                                  );
                                } else {
                                  setSelectedSystemIds(new Set());
                                }
                              }
                            }}
                            className="w-4 h-4 text-primary bg-input-bg border-border-primary rounded focus:ring-primary focus:ring-2"
                          />
                          <div className="text-sm font-roboto text-text-primary whitespace-nowrap">
                            {section.label}
                          </div>
                        </div>
                        <span className="text-sm font-roboto text-text-secondary whitespace-nowrap">
                          {section.key === "department" &&
                            selectedDepartmentIds.size > 0 &&
                            departments &&
                            departments.length > 0 && (
                              <span className="text-xs text-text-secondary">
                                ({selectedDepartmentIds.size} selected)
                              </span>
                            )}
                          {section.key === "system" &&
                            selectedSystemIds.size > 0 &&
                            systems &&
                            systems.length > 0 && (
                              <span className="text-xs text-text-secondary">
                                ({selectedSystemIds.size} selected)
                              </span>
                            )}
                        </span>
                      </div>

                      {section.key === "department" && departments && (
                        <button
                          ref={departmentChevronRef}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDepartmentDropdownOpen(
                              !isDepartmentDropdownOpen
                            );
                          }}
                          className="p-1 hover:bg-secondary rounded"
                        >
                          <ChevronRight
                            className={`w-4 h-4 text-text-secondary transition-transform ${
                              isDepartmentDropdownOpen ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                      )}
                      {section.key === "system" && systems && (
                        <button
                          ref={systemChevronRef}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsSystemDropdownOpen(!isSystemDropdownOpen);
                          }}
                          className="p-1 hover:bg-secondary rounded"
                        >
                          <ChevronRight
                            className={`w-4 h-4 text-text-secondary transition-transform ${
                              isSystemDropdownOpen ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                      )}
                    </label>
                    {section.key === "department" &&
                      departments &&
                      isDepartmentDropdownOpen && (
                        <SelectionDropdown
                          items={departments.filter(
                            (d) => d.plant_id === plantIdNum
                          )}
                          selectedIds={selectedDepartmentIds}
                          onSelectionChange={(newIds) => {
                            setSelectedDepartmentIds(newIds);
                            if (newIds.size === 0) {
                              setSelectedSections({
                                ...selectedSections,
                                department: false,
                              });
                            } else {
                              setSelectedSections({
                                ...selectedSections,
                                department: true,
                              });
                            }
                          }}
                          isOpen={isDepartmentDropdownOpen}
                          getItemId={(dept) => dept.department_id}
                          getItemName={(dept) => dept.department_name}
                          dropdownRef={departmentDropdownRef}
                        />
                      )}
                    {section.key === "system" &&
                      systems &&
                      isSystemDropdownOpen && (
                        <SelectionDropdown
                          items={systems.filter(
                            (s) => s.plant_id === plantIdNum
                          )}
                          selectedIds={selectedSystemIds}
                          onSelectionChange={(newIds) => {
                            setSelectedSystemIds(newIds);
                            if (newIds.size === 0) {
                              setSelectedSections({
                                ...selectedSections,
                                system: false,
                              });
                            } else {
                              setSelectedSections({
                                ...selectedSections,
                                system: true,
                              });
                            }
                          }}
                          isOpen={isSystemDropdownOpen}
                          getItemId={(sys) => sys.system_id}
                          getItemName={(sys) => sys.system_name}
                          dropdownRef={systemDropdownRef}
                        />
                      )}
                  </div>
                ))}
                <div className="border-t border-border-secondary mt-2 pt-2 flex items-center justify-center">
                  <button
                    onClick={() => {
                      setIsDownloadDropdownOpen(false);
                      handleDownloadReport();
                    }}
                    disabled={isDownloadingReport}
                    className="bg-secondary hover:bg-secondary/80 cursor-pointer text-text-primary px-3 py-1.5 rounded-md text-sm font-roboto font-normal transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDownloadingReport ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Download Selected"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
