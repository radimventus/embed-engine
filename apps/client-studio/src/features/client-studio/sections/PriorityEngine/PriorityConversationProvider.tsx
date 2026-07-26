import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

import {
  usePriorityConversation,
  type PriorityConversationView,
} from './usePriorityConversation';

const PriorityConversationContext =
  createContext<PriorityConversationView | null>(null);

type PriorityConversationProviderProps = {
  readonly children: ReactNode;
};

/**
 * Shares Priority coaching dialogue state across panel + chapter bridge.
 * Presentation only — no Runtime.
 */
export function PriorityConversationProvider({
  children,
}: PriorityConversationProviderProps) {
  const conversation = usePriorityConversation();
  return (
    <PriorityConversationContext.Provider value={conversation}>
      {children}
    </PriorityConversationContext.Provider>
  );
}

export function usePriorityConversationContext(): PriorityConversationView {
  const value = useContext(PriorityConversationContext);
  if (value === null) {
    throw new Error(
      'usePriorityConversationContext must be used within PriorityConversationProvider',
    );
  }
  return value;
}
