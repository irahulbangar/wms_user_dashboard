import { ChevronRight } from "lucide-react";
import type { MenuItem } from "./Sidebar";

interface MenuItemComponentProps {
  item: MenuItem;
  level: number;
  isExpanded: boolean;
  isActive: boolean;
  isLastItem: boolean;
  onToggle: (itemId: string) => void;
  onClick: (item: MenuItem) => void;
  renderSubMenu?: (subItem: MenuItem, parentItem: MenuItem, index: number, isLastItem: boolean) => React.ReactNode;
}

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({
  item,
  level,
  isExpanded,
  isActive,
  isLastItem,
  onToggle,
  onClick,
  renderSubMenu,
}) => {
  const hasSubMenu = item.subMenu && item.subMenu.length > 0;
  const textSizeClass =
    level === 0
      ? "text-lg"
      : level === 1
      ? "text-base"
      : "text-sm";
  const iconSizeClass = level === 0 ? "w-5 h-5" : "w-4 h-4";
  const paddingClass = level === 0 ? "px-3" : level === 1 ? "pl-3 pr-3" : "px-3";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasSubMenu) {
      onToggle(item.id);
    }
    onClick(item);
  };

  return (
    <div className="relative">
      <div className="relative flex items-start">
        {level > 0 && (
          <>
            <div className={`absolute left-2 ${level === 1 ? "top-4.5" : "top-4"} w-4 h-px bg-border-primary`}></div>
            {!isLastItem && (
              <div className="absolute left-2 top-3 bottom-0 w-px bg-border-primary"></div>
            )}
          </>
        )}
        <button
          type="button"
          className={`relative z-10 w-full flex items-center ${level === 0 ? "justify-between" : "justify-between"} ${paddingClass} py-1.5 rounded-lg transition-all duration-200 cursor-pointer min-w-0 ${
            isActive
              ? "bg-linear-to-r text-white shadow-lg"
              : level === 0
              ? "text-text-primary hover:bg-hover-bg-primary"
              : "text-text-secondary hover:bg-hover-bg-primary"
          }`}
          onClick={handleClick}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasSubMenu && (
              <ChevronRight
                className={`${iconSizeClass} transition-transform duration-200 shrink-0 ${
                  isExpanded ? "transform rotate-90" : ""
                }`}
              />
            )}
            <span className="shrink-0">{item.icon}</span>
            <span
              className={`font-normal font-roboto text-left ${textSizeClass} truncate flex-1 min-w-0`}
              title={item.label}
            >
              {item.label}
            </span>
          </div>
        </button>
      </div>
      {hasSubMenu && isExpanded && renderSubMenu && (
        <div className="mt-1 ml-6 space-y-1 relative">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-border-primary"></div>
          {item.subMenu?.map((subItem, index) => {
            const isSubLastItem = index === (item.subMenu?.length || 0) - 1;
            return renderSubMenu(subItem, item, index, isSubLastItem);
          })}
        </div>
      )}
    </div>
  );
};

export default MenuItemComponent;

