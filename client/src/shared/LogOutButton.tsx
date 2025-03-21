import useSession from "../hooks/useSession";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

const LogOutButton = () => {
  const { resetSession } = useSession();
  return (
    <button
      className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-700 duration-200 text-white font-semibold flex items-center justify-center gap-2 text-sm"
      onClick={resetSession}
    >
      <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-5 h-5" />
      Log Out
    </button>
  );
};

export default LogOutButton;
