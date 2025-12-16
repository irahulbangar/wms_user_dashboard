import GroupNode from "./GroupNode";

interface GroupNodeWrapperProps {
  data: any;
  id: string;
}

const GroupNodeWrapper = ({ data, id }: GroupNodeWrapperProps) => {
  return <GroupNode data={data} id={id} />;
};

export default GroupNodeWrapper;
