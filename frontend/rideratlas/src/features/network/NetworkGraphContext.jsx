import React, { createContext, useMemo } from "react";
import { buildNetworkGraph } from "./buildNetworkGraph";

export const NetworkGraphContext = createContext(null);

export const NetworkGraphProvider = ({ children }) => {

  const graph = useMemo(() => buildNetworkGraph(), []);

  return (
    <NetworkGraphContext.Provider value={graph}>
      {children}
    </NetworkGraphContext.Provider>
  );

};