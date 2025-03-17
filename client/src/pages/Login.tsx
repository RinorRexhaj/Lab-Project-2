import LogIn from "../components/LogIn";

const Login = () => {
  return (
    <div className="w-screen h-screen flex gap-3 bg-gray-50">
      <div className="w-2/5 md:hidden flex justify-center items-center p-5 bg-emerald-500">
        <h1 className="text-white text-4xl font-bold">Careem</h1>
      </div>
      <div className="w-3/5 md:w-full flex justify-center items-center">
        <LogIn />
      </div>
    </div>
  );
};

export default Login;
