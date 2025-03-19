import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Loading = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <FontAwesomeIcon
        icon={faSpinner}
        spinPulse
        className="h-20 w-20 text-emerald-500"
      />
    </div>
  );
};

export default Loading;
