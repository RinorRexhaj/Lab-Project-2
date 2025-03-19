import { faArrowLeft, faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const Forbidden = () => {
  return (
    <div className="h-screen w-screen flex flex-col gap-10 items-center justify-center">
      <FontAwesomeIcon icon={faBan} className="text-red-500 w-16 h-16" />
      <div className="flex flex-col items-center">
        <h1 className="font-bold text-3xl">403 Forbidden</h1>
        <p>You do not have access to this page.</p>
      </div>
      <Link to={"/"} replace className="flex items-center gap-2">
        <span>Go back to the Home Page</span>
        <FontAwesomeIcon
          icon={faArrowLeft}
          className="w-5 h-5 text-emerald-500"
        />
      </Link>
    </div>
  );
};

export default Forbidden;
