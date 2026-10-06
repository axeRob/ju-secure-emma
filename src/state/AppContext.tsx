import { createContext, useContext, useMemo, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import type { Account, AppAction, AppState, SecuritySummary } from '../types/index.ts'
import {
  appReducer,
  createInitialState,
  selectFilteredAccounts,
  selectSecuritySummary,
} from './security.ts'

interface AppContextValue {
  state: AppState
  dispatch: Dispatch<AppAction>
  summary: SecuritySummary
  filteredAccounts: Account[]
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({
  children,
  initialAccounts,
}: {
  children: ReactNode
  initialAccounts?: Account[]
}) {
  const [state, dispatch] = useReducer(appReducer, initialAccounts, createInitialState)
  const value = useMemo(
    () => ({
      state,
      dispatch,
      summary: selectSecuritySummary(state),
      filteredAccounts: selectFilteredAccounts(state),
    }),
    [state],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppState(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppState must be used within AppProvider')
  return context
}
