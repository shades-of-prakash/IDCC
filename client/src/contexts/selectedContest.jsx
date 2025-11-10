import { createContext, useContext } from "react";

const ContestContext = createContext("");

export const useContestId = () => useContext(ContestContext);

export const ContestProvider = ({ contestId, children }) => {
  return (
    <ContestContext.Provider value={contestId}>
      {children}
    </ContestContext.Provider>
  );
};
