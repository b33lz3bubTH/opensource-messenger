import { create } from "zustand";

const authInitilizers = {
  email: "",
  id: "",
  username: "",
  createdAt: "",
  isLoggedIn: false,
};
export type IAuth = Omit<typeof authInitilizers, "isLoggedIn">;
interface AuthState {
  auth: typeof authInitilizers;
  login: (auth: IAuth) => void;
}

export const useAuth = create<AuthState>((set) => ({
  auth: authInitilizers,
  login: (auth) =>
    set((state) => ({ ...state, auth: { ...auth, isLoggedIn: true } })),
}));
