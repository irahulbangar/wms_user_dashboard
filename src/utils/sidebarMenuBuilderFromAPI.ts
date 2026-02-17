/**
 * Helper functions for building sidebar menu items from API data
 */

import React from "react";
import { Dock, FolderGit, Factory, Building2 } from "lucide-react";
import type { MenuItem } from "../Components/Layout/Sidebar";
import type { SidebarMenuResult } from "../../model/sidebar-menu.interface";

/**
 * Build menu items from SidebarMenuResult API data
 */
export const buildMenuItemsFromAPI = (
  sidebarMenuData: SidebarMenuResult[],
): MenuItem[] => {
  if (!sidebarMenuData || sidebarMenuData.length === 0) {
    return [];
  }

  const organizationsMap = new Map<
    string,
    {
      organization_name: string;
      subdomain: string;
      organization_id: number;
      plants: Map<
        string,
        {
          plant_name: string;
          address: string;
          plant_id: number;
          departments: Map<
            string,
            {
              department_name: string;
              department_id: number;
              systems: Array<{
                system_name: string;
                system_id: number;
                organization_id: number;
                plant_id: number;
                department_id: number;
              }>;
            }
          >;
        }
      >;
    }
  >();

  sidebarMenuData.forEach((item) => {
    const orgKey = `org-${item.organization_id}`;
    const orgName = item.subdomain || "Unknown";

    const plantKey = `plant-${item.plant_id}`;
    const plantName = item.address || "Unknown";

    const deptKey = `dept-${item.department_id}`;
    const deptName = item.department_name || "Unknown";

    const systemName = item.system_name;

    if (!organizationsMap.has(orgKey)) {
      organizationsMap.set(orgKey, {
        organization_name: orgName,
        subdomain: item.subdomain || "",
        organization_id: item.organization_id,
        plants: new Map(),
      });
    }

    const org = organizationsMap.get(orgKey)!;

    if (!org.plants.has(plantKey)) {
      org.plants.set(plantKey, {
        plant_name: plantName,
        address: item.address || "",
        plant_id: item.plant_id,
        departments: new Map(),
      });
    }

    const plant = org.plants.get(plantKey)!;

    if (!plant.departments.has(deptKey)) {
      plant.departments.set(deptKey, {
        department_name: deptName,
        department_id: item.department_id,
        systems: [],
      });
    }

    const dept = plant.departments.get(deptKey)!;

    if (systemName && item.system_id) {
      const isDuplicate = dept.systems.some(
        (s) => s.system_id === item.system_id,
      );

      if (!isDuplicate) {
        dept.systems.push({
          system_name: systemName,
          system_id: item.system_id,
          organization_id: item.organization_id,
          plant_id: item.plant_id,
          department_id: item.department_id,
        });
      }
    }
  });

  const baseItems: MenuItem[] = [];

  Array.from(organizationsMap.entries())
    .sort((a, b) =>
      a[1].organization_name.localeCompare(b[1].organization_name),
    )
    .forEach(([, org]) => {
      const orgId = `org-${org.organization_id}`;
      const plantMenuItems: MenuItem[] = [];

      Array.from(org.plants.entries()).forEach(([, plant]) => {
        const plantId = `plant-${plant.plant_id}`;
        const departmentMenuItems: MenuItem[] = [];

        Array.from(plant.departments.entries()).forEach(([, dept]) => {
          const deptId = `dept-${dept.department_id}`;
          const systemMenuItems: MenuItem[] = [];

          dept.systems.forEach((system) => {
            const systemId = `system-${system.system_id}`;

            systemMenuItems.push({
              id: systemId,
              icon: React.createElement(FolderGit, {
                className: "w-5 h-5",
              }),
              label: system.system_name,
              href: `/system/device/${system.organization_id}/${system.plant_id}/${system.system_id}`,
            });
          });

          departmentMenuItems.push({
            id: deptId,
            icon: React.createElement(Dock, { className: "w-5 h-5" }),
            label: dept.department_name,
            href: `/department/device/${org.organization_id}/${plant.plant_id}/${dept.department_id}`,
            subMenu: systemMenuItems.length > 0 ? systemMenuItems : undefined,
          });
        });

        plantMenuItems.push({
          id: plantId,
          icon: React.createElement(Factory, { className: "w-5 h-5" }),
          label: plant.plant_name,
          href: `/plant/${plant.plant_id}`,
          subMenu:
            departmentMenuItems.length > 0 ? departmentMenuItems : undefined,
        });
      });

      baseItems.push({
        id: orgId,
        icon: React.createElement(Building2, { className: "w-5 h-5" }),
        label: org.organization_name,
        href: `/organization/${org.organization_id}`,
        subMenu: plantMenuItems.length > 0 ? plantMenuItems : undefined,
      });
    });

  return baseItems;
};
