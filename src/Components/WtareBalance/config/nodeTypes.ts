import type { NodeTypes } from "@xyflow/react";
import TankNode from "../Diagram/TankNode";
import FMNode from "../Diagram/FMNode";
import BRWHMSNode from "../Diagram/BRWHMSNode";
import PHMCNode from "../Diagram/PHMCNode";
import ARGNode from "../Diagram/ARGNode";
import DwlrNode from "../Diagram/DwlrNode";
import SourceNode from "../Diagram/SourceNode";
import SinkNode from "../Diagram/SinkNode";
import GroupNodeWrapper from "../Diagram/GroupNodeWrapper";
import VirtualNode from "../Diagram/VirtualNode";
import ResultantNode from "../Diagram/ResultantNode";

export const nodeTypes: NodeTypes = {
  tank: TankNode,
  fm: FMNode,
  brwhms: BRWHMSNode,
  phmc: PHMCNode,
  arg: ARGNode,
  dwlr: DwlrNode,
  source: SourceNode,
  sink: SinkNode,
  virtual: VirtualNode,
  group: GroupNodeWrapper,
  resultant: ResultantNode,
};
