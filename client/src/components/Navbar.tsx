import { faBars, faUser, faXmark, faUserShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { useSessionStore } from "../store/useSessionStore";
import { Link } from "react-router-dom";
import ProfileModal from "./Profile/ProfileModal";
import Chat from "./Chat/Chat";

interface NavbarProps {
  activeLink: number;
  setActiveLink: (active: number) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeLink, setActiveLink }) => {
  const { role } = useSessionStore();
  const isAdmin = role === "Admin";
  const [hasShadow, setHasShadow] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState(false);

  const links = ["Home", "Rides", "Eat", "Groceries", "Payment"];

  useEffect(() => {
    const handleScroll = () => {
      setHasShadow(window.scrollY > 0.5);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profile &&
        !document
          .getElementById("profile-modal")
          ?.contains(event.target as Node) &&
        !document.getElementById("profile-btn")?.contains(event.target as Node)
      ) {
        setProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profile]);

  return (
    <>
      <div
        className={`w-screen flex justify-center fixed top-0 z-50 transition-shadow duration-200 bg-white ${
          hasShadow ? "shadow-sm shadow-gray-400" : ""
        }`}
      >
        <div className="max-w-7xl w-11/12 h-20 px-3 py-2 flex items-center justify-between">
          <Link
            to={"/"}
            key={"Home Title"}
            className="text-emerald-500 text-3xl tb:hidden font-bold cursor-pointer"
            onClick={() => setActiveLink(0)}
          >
            Lab Project 2
          </Link>
          <Link
            to={"/"}
            key={"Home Title Mobile"}
            className="text-emerald-500 hidden text-2xl tb:flex font-bold cursor-pointer"
            onClick={() => setActiveLink(0)}
          >
            Lab 2
          </Link>
          <div className="flex gap-6 items-center">
            <div className="flex md:hidden items-center gap-5 tb:gap-3">
              {links.map((link, index) => (
                <Link
                  to={link === "Home" ? "/" : "/" + link.toLowerCase()}
                  className={`px-3 py-2 tb:px-2 tb:py-1.5 tb:text-base font-semibold rounded-lg ${
                    activeLink === index && "bg-emerald-500 text-white"
                  } hover:bg-emerald-500 hover:text-white duration-200`}
                  key={link + index}
                  onClick={() => setActiveLink(index)}
                >
                  {link}
                </Link>
              ))}
            </div>
            <div className="flex gap-5 items-center md:absolute md:right-24 md:gap-3">
              <Chat />
              {isAdmin && (
                <Link to="/admin-dashboard">
                  <button
                    className="w-10 h-10 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 duration-150 rounded-lg"
                  >
                    <FontAwesomeIcon icon={faUserShield} className="w-5 h-5 text-white" />
                  </button>
                </Link>
              )}
              <button
                id="profile-btn"
                className="w-10 h-10 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 duration-150 rounded-full"
                onClick={() => setProfile(!profile)}
              >
                <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <button
            className="hidden md:flex p-2 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FontAwesomeIcon
              icon={isMenuOpen ? faXmark : faBars}
              className="w-6 h-6"
            />
          </button>
          <div
            className={`absolute hidden top-20 left-0 w-full z-50 bg-white flex-col items-center gap-3 py-5 border-t transition-transform duration-200 md:flex ${
              isMenuOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-10 opacity-0 pointer-events-none"
            }`}
          >
            {links.map((link, index) => (
              <Link
                to={link === "Home" ? "/" : "/" + link.toLowerCase()}
                className={`px-4 py-3 w-10/12 text-center font-semibold rounded-lg ${
                  activeLink === index && "bg-emerald-500 text-white"
                } hover:bg-emerald-500 hover:text-white duration-200`}
                key={link + index}
                onClick={() => {
                  setActiveLink(index);
                  setIsMenuOpen(false);
                }}
              >
                {link}
              </Link>
            ))}
          </div>
          {profile && <ProfileModal setProfile={setProfile} />}
        </div>
      </div>
      {isMenuOpen && (
        <div
          className="fixed hidden inset-0 bg-black bg-opacity-50 z-40 md:flex"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;
