/**
 * Helper functions for building sidebar menu items
 */

import React from "react";
import { Dock, FolderGit, Factory, Building2 } from "lucide-react";
import type { MenuItem } from "../Components/Layout/Sidebar";
import type { SystemResult } from "../../model/system.interface";
import type { DepartmentResult } from "../../model/department.interface";
import type { PlantResult } from "../../model/plant.interface";

/**
 * Build menu items from plants, departments, and systems
 */
export const buildMenuItems = (
  plants: PlantResult[],
  departments: DepartmentResult[],
  systems: SystemResult[],
  _userRole?: string,
  _user?: any
): MenuItem[] => {
  const baseItems: MenuItem[] = [];

  const organizationsMap = new Map<
    number,
    {
      organization_id: number;
      organization_name: string;
      plants: Map<
        number,
        {
          plant_id: number;
          plant_name: string;
          departments: Map<
            number,
            {
              department_id: number;
              department_name: string;
              systems: SystemResult[];
            }
          >;
        }
      >;
    }
  >();

  const systemsByDepartment = new Map<number, SystemResult[]>();
  systems.forEach((system) => {
    if (!systemsByDepartment.has(system.department_id)) {
      systemsByDepartment.set(system.department_id, []);
    }
    systemsByDepartment.get(system.department_id)?.push(system);
  });

  plants.forEach((plant) => {
    const orgId = plant.organization_id;

    if (!organizationsMap.has(orgId)) {
      organizationsMap.set(orgId, {
        organization_id: orgId,
        organization_name: plant.subdomain,
        plants: new Map(),
      });
    }

    const org = organizationsMap.get(orgId)!;

    if (!org.plants.has(plant.plant_id)) {
      org.plants.set(plant.plant_id, {
        plant_id: plant.plant_id,
        plant_name: plant.address,
        departments: new Map(),
      });
    }
  });

  departments.forEach((department) => {
    const orgId = department.organization_id;
    const plantId = department.plant_id;
    const deptId = department.department_id;

    if (!organizationsMap.has(orgId)) {
      organizationsMap.set(orgId, {
        organization_id: orgId,
        organization_name: department.organization_name,
        plants: new Map(),
      });
    }

    const org = organizationsMap.get(orgId)!;

    if (!org.plants.has(plantId)) {
      org.plants.set(plantId, {
        plant_id: plantId,
        plant_name: department.plant_name,
        departments: new Map(),
      });
    }

    const plant = org.plants.get(plantId)!;

    if (!plant.departments.has(deptId)) {
      plant.departments.set(deptId, {
        department_id: deptId,
        department_name: department.department_name,
        systems: systemsByDepartment.get(deptId) || [],
      });
    }
  });

  Array.from(organizationsMap.values())
    .sort((a, b) => a.organization_name.localeCompare(b.organization_name))
    .forEach((org) => {
      const plantMenuItems: MenuItem[] = [];

      Array.from(org.plants.values())
        .sort((a, b) => a.plant_name.localeCompare(b.plant_name))
        .forEach((plant) => {
          const departmentMenuItems: MenuItem[] = [];

          Array.from(plant.departments.values())
            .sort((a, b) => a.department_id - b.department_id)
            .forEach((dept) => {
              const systemMenuItems: MenuItem[] = dept.systems
                .sort((a, b) => a.system_name.localeCompare(b.system_name))
                .map((system) => ({
                  id: system.system_id.toString(),
                  icon: React.createElement(FolderGit, {
                    className: "w-5 h-5",
                  }),
                  label: system.system_name,
                  href: `/system/device/${system.organization_id}/${system.plant_id}/${system.system_id}`,
                }));

              departmentMenuItems.push({
                id: `dept-${dept.department_id}`,
                icon: React.createElement(Dock, { className: "w-5 h-5" }),
                label: dept.department_name,
                href: `/department/device/${org.organization_id}/${plant.plant_id}/${dept.department_id}`,
                subMenu:
                  systemMenuItems.length > 0 ? systemMenuItems : undefined,
              });
            });

          plantMenuItems.push({
            id: `plant-${plant.plant_id}`,
            icon: React.createElement(Factory, { className: "w-5 h-5" }),
            label: plant.plant_name,
            href: `/plant/${plant.plant_id}`,
            subMenu:
              departmentMenuItems.length > 0 ? departmentMenuItems : undefined,
          });
        });

      baseItems.push({
        id: `org-${org.organization_id}`,
        icon: React.createElement(Building2, { className: "w-5 h-5" }),
        label: org.organization_name,
        href: `/organization/${org.organization_id}`,
        subMenu: plantMenuItems.length > 0 ? plantMenuItems : undefined,
      });
    });

  return baseItems;
};
