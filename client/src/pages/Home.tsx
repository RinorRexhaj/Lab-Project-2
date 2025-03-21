import {
  faCarSide,
  faCartShopping,
  faCreditCard,
  faHamburger,
} from "@fortawesome/free-solid-svg-icons";
import Slider from "../components/Slider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const Home = () => {
  const services = [
    {
      title: "Ride with Us",
      desc: "Book rides instantly",
      icon: faCarSide,
      link: "/rides",
      background: "bg-blue-600",
    },
    {
      title: "Food Delivery",
      desc: "Order from top restaurants",
      icon: faHamburger,
      link: "/eat",
      background: "bg-emerald-100",
    },
    {
      title: "Groceries",
      desc: "Fresh items at your doorstep",
      icon: faCartShopping,
      link: "/groceries",
      background: "bg-indigo-500",
    },
    {
      title: "Payments",
      desc: "Secure and fast transactions",
      icon: faCreditCard,
      link: "/payment",
      background: "bg-blue-800",
    },
  ];

  return (
    <>
      <div className="max-w-7xl flex flex-col p-3 w-11/12 mx-auto space-y-12">
        {/* Hero Section */}
        <section className="text-center py-14 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-lg">
          <h1 className="text-4xl md:text-xl font-bold">
            Your All-in-One Transport, Food, and Payment Solution
          </h1>
          <p className="text-lg md:text-base mt-4">
            Seamless rides, quick food deliveries, groceries at your doorstep,
            and secure online payments—all in one app!
          </p>
        </section>

        {/* Slider */}
        <Slider />

        {/* Services Section */}
        <section className="grid justify-center grid-cols-4 tb:grid-cols-3 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Link
              to={service.link}
              key={"service" + index}
              className={`w-full p-6 ${
                service.background
              } shadow-md rounded-lg flex flex-col items-center text-center duration-200 hover:-translate-y-2.5 hover:shadow-2xl ${
                index === 1 ? "text-slate-900" : "text-white"
              }`}
            >
              <FontAwesomeIcon icon={service.icon} className="w-8 h-8" />
              <h2 className="text-xl font-semibold mt-4">{service.title}</h2>
              <p className="mt-2">{service.desc}</p>
            </Link>
          ))}
        </section>

        {/* About Us Section */}
        <section className="w-9/12 md:w-11/12 md:flex-col mx-auto py-16 text-center flex items-center gap-10">
          <div className="w-1/2 flex flex-col items-start gap-5 md:gap-3 md:w-full md:items-center">
            <h1 className="font-semibold text-3xl md:text-2xl md:text-center">
              About Us
            </h1>
            <p className="w-10/12 text-start md:text-sm md:text-center">
              Your all-in-one platform for effortless bookings, real-time
              updates, and secure transactions. Sign in to experience the future
              of mobility!
            </p>
          </div>
          <img
            src="assets/img/about-us.png"
            alt="About Us"
            className="w-1/2 md:w-full h-64 rounded-2xl object-cover shadow-xl"
          />
        </section>
      </div>
      {/* Footer Section */}
      <footer className="w-full bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl w-11/12 mx-auto flex flex-wrap gap-3 justify-between px-3">
          {/* Company Info */}
          <div className="w-full flex flex-col items-center md:w-1/3">
            <h2 className="text-xl font-semibold">Company</h2>
            <p className="mt-2 text-gray-400">
              Your all-in-one platform for rides, food, groceries, and payments.
            </p>
          </div>

          {/* Quick Links */}
          <div className="w-full flex flex-col items-center md:w-1/3 mt-4 md:mt-0">
            <h2 className="text-xl font-semibold">Quick Links</h2>
            <ul className="mt-2 flex flex-col items-center space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div className="w-full flex flex-col items-center md:w-1/3 mt-4 md:mt-0">
            <h2 className="text-xl font-semibold">Follow Us</h2>
            <div className="flex space-x-4 mt-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          &copy; {new Date().getFullYear()}. All rights reserved.
        </div>
      </footer>
    </>
  );
};

export default Home;
