import { faBars, faUser, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProfileModal from "./ProfileModal";
import { useUserStore } from "../store/useUserStore";
import LogOutButton from "../shared/LogOutButton";

const Navbar = () => {
  const [hasShadow, setHasShadow] = useState(false);
  const [activeLink, setActiveLink] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState(false);
  const { user } = useUserStore();

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
          <h1 className="text-emerald-500 text-3xl tb:text-2xl font-bold">
            Lab Project 2
          </h1>
          <div className="flex md:hidden items-center gap-5">
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
            <button
              id="profile-btn"
              className="w-10 h-10 flex items-center justify-center bg-emerald-500 rounded-full"
              onClick={() => setProfile(!profile)}
            >
              <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-white" />
            </button>
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
            <div className="px-4 py-1 w-10/12 flex gap-5 items-center justify-between">
              <p className="font-semibold text-emerald-500 text-lg">
                {user?.fullName}
              </p>
              <LogOutButton />
            </div>
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
