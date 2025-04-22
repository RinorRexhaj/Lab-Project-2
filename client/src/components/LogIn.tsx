import { ChangeEvent, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../utils/validation";
import useApi from "../hooks/useApi";
import useSession from "../hooks/useSession";

const LogIn = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    fullname: "",
  });
  const { post, loading, error, setError } = useApi();
  const { setSession } = useSession();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({
      ...prev,
      email: validateEmail(value) ? "" : "Invalid email format!",
    }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setError("");
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(value)
        ? ""
        : "Password must be at least 8 characters!",
    }));
  };

  const isDisabled = () => {
    return isLogin
      ? !email || !password || !!errors.email || !!errors.password
      : !email ||
          !password ||
          !fullname ||
          !!errors.email ||
          !!errors.password ||
          !!errors.fullname;
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullname(value);
    setErrors((prev) => ({
      ...prev,
      fullname: value.length ? "" : "Name can't be empty!",
    }));
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
  };

  const logIn = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!errors.email && !errors.password && email && password) {
      const response = await post("/auth/login", { email, password });
      setSession(response);
    }
  };

  const register = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !errors.email &&
      !errors.password &&
      !errors.fullname &&
      email &&
      password &&
      fullname
    ) {
      const response = await post("/auth/register", {
        fullname,
        email,
        address,
        password,
      });
      setSession(response);
    }
  };

  return (
    <form
      className="w-96 flex flex-col gap-4"
      onSubmit={isLogin ? logIn : register}
    >
      <div className="w-full flex flex-col gap-6 border border-gray-300 bg-white rounded-lg px-8 py-10 shadow-md">
        <h1 className="text-center text-xl font-semibold">
          {isLogin ? "Log In" : "Register"}
        </h1>
        <div className="w-full flex flex-col gap-1">
          {!isLogin && (
            <div>
              <input
                type="text"
                placeholder="Full Name..."
                value={fullname}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500"
                onChange={handleNameChange}
              />
              <p className="text-red-500 font-semibold h-4 text-sm">
                {errors.fullname && errors.fullname}
              </p>
            </div>
          )}
          <div>
            <input
              type="email"
              placeholder="Email..."
              value={email}
              onChange={handleEmailChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-red-500 font-semibold h-4 text-sm">
              {errors.email && errors.email}
            </p>
          </div>
          {!isLogin && (
            <div>
              <input
                type="text"
                placeholder="Address... (Optional)"
                value={address}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 mb-4"
                onChange={handleAddressChange}
              />
            </div>
          )}
          <div>
            <input
              type="password"
              placeholder="Password..."
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-red-500 font-semibold h-4 text-sm">
              {errors.password ? errors.password : error && error}
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={isDisabled()}
          className="h-10 px-3 py-2 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-200 disabled:cursor-not-allowed duration-150 rounded-md text-white font-semibold"
        >
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} spinPulse className="text-lg" />
          ) : isLogin ? (
            "Log In"
          ) : (
            "Register"
          )}
        </button>
        <button
          type="button"
          className="text-sm text-gray-500"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span className="text-emerald-600 font-semibold">
            {isLogin ? "Register" : "Log In"}
          </span>
        </button>
      </div>
    </form>
  );
};

export default LogIn;
