import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSessionStore } from "../store/useSessionStore";

const Loading = () => {
  const { accessToken } = useSessionStore();
  return (
    <div
      className={`${
        accessToken ? "h-96 mt-20" : "h-screen"
      } w-full flex items-center justify-center`}
    >
      <FontAwesomeIcon
        icon={faSpinner}
        spinPulse
        className="h-20 w-20 mb-20 text-emerald-500"
      />
    </div>
  );
};

export default Loading;
