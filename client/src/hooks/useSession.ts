import { useNavigate } from "react-router-dom";
import { useSessionStore } from "../store/useSessionStore";
import { useUserStore } from "../store/useUserStore";
import { LoginResponse } from "../types/response/LoginResponse";
import useApi from "./useApi";

const useSession = () => {
  const { setUser, resetUser } = useUserStore();
  const { setAccessToken, setRole } = useSessionStore();
  const { error } = useApi();
  const navigate = useNavigate();

  const setSession = (response: LoginResponse) => {
    if (response) {
      const { user, token, refreshToken } = response;
      setUser(user);
      setRole(user.role);
      setAccessToken(token);
      localStorage.setItem("refreshToken", refreshToken);
    } else if (!response || error) {
      resetSession();
    }
  };

  const resetSession = () => {
    resetUser();
    setAccessToken("");
    setRole("");
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return { setSession, resetSession };
};

export default useSession;
