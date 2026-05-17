"use client";

import { createContext, useContext, type ReactNode } from "react";

type NavScrollContextValue = {
  goContacts: () => void;
  openRequestForm: () => void;
};

const NavScrollContext = createContext<NavScrollContextValue | null>(null);

export function NavScrollProvider({
  children,
  goContacts,
  openRequestForm,
}: {
  children: ReactNode;
  goContacts: () => void;
  openRequestForm: () => void;
}) {
  return (
    <NavScrollContext.Provider value={{ goContacts, openRequestForm }}>
      {children}
    </NavScrollContext.Provider>
  );
}

/** Только для CTA в story-сценах: тот же скролл к ContactSection, без props на SplitCinematicStory. */
export function useNavScrollContacts() {
  return useContext(NavScrollContext)?.goContacts;
}

/** Скролл к контактам + открытие модалки заявки (единая форма на лендинге). */
export function useNavScrollOpenRequestForm() {
  return useContext(NavScrollContext)?.openRequestForm;
}
