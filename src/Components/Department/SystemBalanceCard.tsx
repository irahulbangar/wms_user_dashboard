interface SystemBalance {
  id: number;
  name: string;
  balance: number;
  unit: string | undefined;
}

interface SystemBalanceCardProps {
  system: SystemBalance;
}

const SystemBalanceCard = ({ system }: SystemBalanceCardProps) => {
  return (
    <div className="bg-card rounded-lg px-4 py-3 shadow-md cursor-pointer hover:shadow-lg hover:scale-99 hover:bg-card/50 transition-all duration-200">
      <div className="flex flex-col gap-1">
        <h3 className="text-text-primary font-roboto text-base font-normal">
          {system.name}
        </h3>
        <div className="flex items-start flex-col">
          <span className="text-base font-roboto text-text-secondary text-start w-full">
            Un-Accounted Water
          </span>
          <span
            className={`text-lg font-roboto font-normal w-full text-start cursor-pointer ${
              system.balance >= 0 ? "text-status-success" : "text-status-danger"
            }`}
            title={
              system.balance >= 0
                ? "+" +
                  Math.abs(system.balance) +
                  " " +
                  (system.unit === "M^3" ? "m³" : system.unit || "")
                : "- " +
                  Math.abs(system.balance) +
                  " " +
                  (system.unit === "M^3" ? "m³" : system.unit || "")
            }
          >
            {system.balance >= 0 ? "" : "- "}
            {system.unit === "M^3"
              ? (Math.abs(system.balance) / 1000).toFixed(3)
              : Math.abs(system.balance)}{" "}
            <span className="text-lg italic">
              {system.unit === "M^3" ? "m³" : system.unit || ""}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemBalanceCard;
