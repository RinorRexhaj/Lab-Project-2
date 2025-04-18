import AppRouter from "./routes/AppRouter";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: "#10b981", // emerald-500
              color: "white",
            },
            duration: 3000,
          },
          error: {
            style: {
              background: "#ef4444", // red-500
              color: "white",
            },
            duration: 3000,
          },
        }}
      />
    </>
  );
};

export default App;
