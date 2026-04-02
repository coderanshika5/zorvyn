import React, { createContext, useContext, useReducer, useEffect } from "react";
import { generateTransactions } from "../data/mockData";

const AppContext = createContext();

const initialState = {
  transactions: [],
  role: "viewer",
  darkMode: false,
  filters: {
    search: "",
    type: "all",
    category: "all",
    dateFrom: "",
    dateTo: "",
    sortBy: "date",
    sortDir: "desc",
  },
  activeTab: "dashboard",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "TOGGLE_DARK":
      return { ...state, darkMode: !state.darkMode };
    case "SET_FILTER":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "RESET_FILTERS":
      return { ...state, filters: { ...initialState.filters } };
    case "SET_TAB":
      return { ...state, activeTab: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const stored = (() => {
    try {
      const s = localStorage.getItem("financeApp");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    transactions: stored?.transactions || generateTransactions(),
    role: stored?.role || "viewer",
    darkMode: stored?.darkMode || false,
  });

  useEffect(() => {
    localStorage.setItem(
      "financeApp",
      JSON.stringify({
        transactions: state.transactions,
        role: state.role,
        darkMode: state.darkMode,
      })
    );
  }, [state.transactions, state.role, state.darkMode]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}