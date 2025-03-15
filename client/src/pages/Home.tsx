import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="w-full">
      <div className="relative w-full h-screen">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="/assets/img/villa.mp4"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/assets/img/villa.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center text-white px-8">
          <div className="w-11/12 flex flex-col items-center justify-center gap-0 text-center">
            <h1 className="text-5xl font-bold">Welcome to Villa Vogue</h1>
            <p className="mt-4 text-lg text-wrap">
              Experience luxury and comfort like never before
            </p>
            <Link
              to={"/rezervo"}
              className="mt-6 bg-white text-primary px-6 py-3 text-lg font-semibold rounded-md hover:bg-primary hover:text-white transition duration-300"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
      <section className="flex flex-col items-center py-16 px-6 tb:px-0 bg-gray-100 text-center">
        <h2 className="text-4xl font-bold text-primary">Why Choose Us?</h2>
        <p className="mt-4 text-base text-gray-600 max-w-3xl mx-auto">
          Our luxury villas offer a perfect blend of comfort, style, and
          tranquility. Enjoy breathtaking views, top-tier amenities, and an
          unforgettable stay.
        </p>
        <div className="max-w-7xl w-full mt-8 flex flex-col tb:flex-row justify-center tb:items-center gap-8">
          <div className="h-32 w-full flex flex-col items-center justify-center gap-0 bg-white p-6 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-primary">
              Scenic Locations
            </h3>
            <p className="text-gray-500 mt-2">
              Enjoy stunning beach and mountain retreats.
            </p>
          </div>
          <div className="h-32 w-full flex flex-col items-center justify-center gap-0 bg-white p-6 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-primary">
              Luxury Amenities
            </h3>
            <p className="text-gray-500 mt-2">
              Spa, infinity pools, and premium interiors.
            </p>
          </div>
          <div className="h-32 w-full flex flex-col items-center justify-center gap-0 bg-white p-6 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-primary">
              Exclusive Experience
            </h3>
            <p className="text-gray-500 mt-2">
              Tailored services for your perfect vacation.
            </p>
          </div>
        </div>
      </section>
      <section className="py-12 px-4 text-center w-full flex flex-col items-center">
        <h2 className="text-4xl font-bold text-primary">Our Location</h2>
        <p className="mt-4 text-base  text-gray-600">
          Find us at the heart of nature, surrounded by breathtaking views.
        </p>
        <div className="mt-8 w-full max-w-7xl flex justify-center">
          <iframe
            className="h-96 max-w-[90vw] w-full rounded-lg shadow-md"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d11898.3852974367!2d20.994152596441378!3d42.36084463647903!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDIxJzM4LjYiTiAyMMKwNTknNDAuOSJF!5e0!3m2!1sen!2sus!4v1708172091584!5m2!1sen!2sus"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
      <footer className="bg-primary text-white py-8 px-6 text-center flex flex-col gap-0">
        <h3 className="text-2xl font-bold">Villa Vogue</h3>
        <p className="mt-2 text-lg text-gray-300">
          Luxury stays for unforgettable experiences.
        </p>
        <div className="flex justify-center gap-6 mt-4 text-lg">
          <a href="#" className="hover:text-gray-400">
            Facebook
          </a>
          <a href="#" className="hover:text-gray-400">
            Instagram
          </a>
          <a href="#" className="hover:text-gray-400">
            Twitter
          </a>
        </div>
        <p className="mt-4 text-gray-400">
          © 2025 Villa Vogue. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;
