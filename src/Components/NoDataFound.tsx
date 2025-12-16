import React from "react";

interface NoDataFoundProps {
  icon: React.ReactNode;
  title: string;
}

const NoDataFound: React.FC<NoDataFoundProps> = ({ icon, title }) => {
  return (
    <div className="text-center py-12 bg-primary rounded-lg h-full flex flex-col items-center justify-center w-full">
      {icon}
      <h3 className="text-lg text-text-secondary mb-2 font-roboto">{title}</h3>
    </div>
  );
};

export default NoDataFound;
