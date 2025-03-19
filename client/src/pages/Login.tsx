import LogIn from "../components/LogIn";

const Login = () => {
  return (
    <div className="w-screen h-screen flex gap-3 bg-gray-50">
      <div className="w-5/12 md:hidden flex flex-col gap-8 justify-center items-center p-5 bg-emerald-500">
        <h1 className="text-white text-4xl font-bold">Lab Project 2</h1>
        <p className="text-white w-3/4 tb:text-sm text-center font-medium leading-relaxed">
          Your all-in-one platform for effortless bookings, real-time updates,
          and secure transactions. Sign in to experience the future of mobility!
        </p>
        <img
          src="assets/img/login.png"
          alt="Login Banner"
          className="object-cover rounded-xl shadow-md w-2/3"
        />
      </div>
      <div className="w-3/5 md:w-full flex justify-center items-center">
        <LogIn />
      </div>
    </div>
  );
};

export default Login;
