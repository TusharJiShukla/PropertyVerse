"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "@/utils/api";
import Navbar from "../components/navabar/page";
import { AxiosError } from "axios";
import { Phone } from "lucide-react";

type FormData = {
  name: string;
  email: string;
  phone: string;
  message?: string;
};

type Property = {
  _id: string;
  title: string;
  location: string;
  city: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Property[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [inquiryId, setInquiryId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>();

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const response = await api.get<ApiResponse<Property[]>>("/properties");

      if (response.data.success && response.data.data) {
        const filtered = response.data.data.filter(
          (prop) =>
            prop.location.toLowerCase().includes(query.toLowerCase()) ||
            prop.title.toLowerCase().includes(query.toLowerCase()) ||
            (prop.city &&
              prop.city.toLowerCase().includes(query.toLowerCase())),
        );
        setResults(filtered);
        setError(null);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to fetch properties. Please try again.");
      setResults([]);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      setSuccessMessage(null);

      // Validate phone number (10 digits)
      if (!/^\d{10}$/.test(data.phone)) {
        setError("Please enter a valid 10-digit phone number");
        return;
      }

      // In the onSubmit function, change the payload:

      const payload = {
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        businessName: "Website Visitor",
        businessDesc: "General inquiry from homepage",
        inquiryType: "general", // ✅ valid enum
        service: "other", // ✅ changed from "general_inquiry" to "other"
        projectDesc:
          data.message ||
          "No specific message provided. Customer requested callback.",
        websiteType: "other",
        existingWebsite: "",
        existingDesc: "",
      };
      const response = await api.post<ApiResponse<any>>("/send-email", payload);

      if (response.data.success) {
        reset();
        setSuccessMessage(
          response.data.message ||
            "Thank you! We'll get back to you within 24 hours.",
        );
        setInquiryId(response.data.data?.inquiryId || null);

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
          setInquiryId(null);
        }, 5000);
      } else {
        setError(
          response.data.message || "Failed to send message. Please try again.",
        );
      }
    } catch (error: unknown) {
      console.error("Submission error:", error);
      if (error instanceof AxiosError) {
        setError(
          error.response?.data?.message ||
            "Failed to send message. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative min-h-screen sm:min-h-[120vh] bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/image.jpg"
            alt="Building background"
            layout="fill"
            objectFit="cover"
            priority
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-black opacity-30"></div>
        </div>

        <Navbar />

        <div className="relative z-5 flex flex-col items-center justify-center h-full px-4 sm:px-6 pt-24 sm:pt-32 text-center">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 tracking-wide drop-shadow-lg">
              From Dreams to Doorsteps
            </h1>
            <Image
              src="/logo.png"
              alt="Company Logo"
              width={100}
              height={100}
              className="m-4"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide drop-shadow-lg">
            YOUR PROPERTY PARTNER
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white mb-8 font-medium drop-shadow-md">
            Expert guidance in real estate investments
          </p>

          <div className="flex justify-center w-full">
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg w-full max-w-lg">
              <h3 className="text-lg font-bold mb-2 text-gray-900">
                Find Properties
              </h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <input
                  type="text"
                  placeholder="Search for location, city or property name"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value === "") setResults([]);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold"
                >
                  Search
                </button>
              </div>
              <div className="mt-4 text-left">
                {results.length > 0 ? (
                  results.map((property) => (
                    <Link
                      href={`/properties?property=${property._id}`}
                      key={property._id}
                    >
                      <div className="mt-2 text-gray-700 hover:bg-gray-100 p-2 rounded cursor-pointer">
                        <p className="font-semibold">{property.title}</p>
                        <p className="text-sm">
                          {property.location}, {property.city}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : query && results.length === 0 ? (
                  <p className="text-sm text-gray-500 mt-2">
                    No properties found. Try a different search term.
                  </p>
                ) : null}
                {error && results.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">{error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Who We Are Section */}
      <section className="bg-[#f9f1dd] py-20 px-4 sm:px-6">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-6 mx-auto text-center">
          Who We Are
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
              Expertise in real estate solutions
            </h2>
            <p className="text-lg text-gray-800 mb-4">
              At PropertyVerse and Consultancy, we excel in buying and
              renting flats and commercial properties. Our dedicated team offers
              insightful consulting services for property investment
              opportunities and expertly assists with all property documentation
              needs.
            </p>
            <p className="text-lg text-gray-800 mb-6">
              We leverage our extensive market knowledge in Mumbai to ensure
              that every client receives tailored solutions that meet their
              unique requirements. Trust us to navigate your real estate journey
              with confidence and ease.
            </p>
            <div className="flex gap-4 flex-wrap mt-6">
              <span className="bg-[#faeebf] text-[#d6a243] text-sm font-semibold px-4 py-4 rounded-md shadow-sm">
                250+ Satisfied Clients
              </span>
              <a href="#contact">
                <button className="bg-[#d6a243] text-white text-sm font-semibold px-6 py-4 rounded-md hover:bg-[#b48735] transition">
                  Contact Us
                </button>
              </a>
            </div>
          </div>

          <div className="flex justify-center">
            <Image
              src="/hawamahal.png"
              alt="Hawa Mahal Jaipur"
              width={600}
              height={400}
              className="w-full max-w-md sm:max-w-full h-auto rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-[#f9f1dd] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-12 text-left">
            Your gateway to real estate success
          </h2>

          <div className="flex flex-wrap justify-between gap-y-10 gap-x-4">
            {[
              {
                image: "/property-sales.png",
                title: "Property Sales and Rentals",
                desc: "Buy or rent flats and commercial spaces at best prices.",
                link: "/sale-rentals",
                btn: "Explore Properties",
              },
              {
                image: "/property-sales.png",
                title: "Brokerage Services",
                desc: "Expert brokerage for seamless property transactions.",
                link: "/broker",
                btn: "Brokerage and Consulting",
              },
              {
                image: "/investment-consulting.png",
                title: "Loans & Legal",
                desc: "Secure loans and get complete legal help for properties.",
                link: "/loans-legal",
                btn: "Explore Loans & Legal Help",
              },
              {
                image: "/investment-consulting.png",
                title: "Redevelopment & Commercial",
                desc: "We handle society redevelopment and major commercial property deals.",
                link: "/redevelopment-commercial",
                btn: "See Redevelopment Projects",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="w-full sm:w-[48%] lg:w-[23%] flex flex-col items-center text-center bg-white rounded-lg shadow-sm p-4"
              >
                <div className="h-[220px] flex items-center justify-center mb-4">
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={160}
                    height={160}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 min-h-[56px]">
                  {card.title}
                </h3>

                <p className="text-gray-800 mb-4 min-h-[72px]">{card.desc}</p>

                <Link href={card.link}>
                  <button className="bg-[#faeebf] text-[#d6a243] text-sm font-semibold px-4 py-3 rounded-md shadow-sm cursor-pointer hover:bg-[#d6a243] hover:text-white transition">
                    {card.btn}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-[#f9f1dd] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-12">
            We're here to assist you!
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full md:w-1/2">
              <h3 className="text-2xl font-semibold text-[#d6a243] mb-6">
                Send us a message
              </h3>

              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 rounded-lg p-4 mb-4">
                  <p className="font-medium">{successMessage}</p>
                  {inquiryId && (
                    <p className="text-sm mt-1">Reference ID: {inquiryId}</p>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg p-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register("name", { required: "Full name is required" })}
                    type="text"
                    placeholder="John Smith"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-zinc-700
                    ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-yellow-600"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                    type="email"
                    placeholder="johnsmith@example.com"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-zinc-700
                    ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-yellow-600"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Phone Number * (10 digits)
                  </label>
                  <input
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Please enter a valid 10-digit phone number",
                      },
                    })}
                    type="tel"
                    placeholder="9876543210"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-zinc-700
                    ${
                      errors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-yellow-600"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Message / Query
                  </label>
                  <textarea
                    {...register("message")}
                    rows={4}
                    placeholder="Tell us about your requirements..."
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#d6a243] hover:bg-[#b48735] text-white font-semibold px-6 py-3 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="bg-[#fff8e1] p-8 rounded-2xl shadow-xl w-full md:w-1/2">
              <h3 className="text-2xl font-semibold text-[#d6a243] mb-6">
                Get in Touch
              </h3>
              <div className="space-y-6 text-gray-700">
                <div className="flex items-start gap-4">
                  <Image
                    src="/mail.png"
                    alt="Email"
                    width={24}
                    height={24}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-[#d6a243]">Email Us</p>
                    <p>contact@propertyverse.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Image
                    src="/location.png"
                    alt="Location"
                    width={24}
                    height={24}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-[#d6a243]">Location</p>
                    <p>Mumbai, Maharashtra, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Image
                    src="/clock.png"
                    alt="Clock"
                    width={24}
                    height={24}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-[#d6a243]">
                      Opening Hours
                    </p>
                    <p>Mon–Fri: 9:00am - 10:00pm</p>
                    <p>Sat: 9:00am - 6:00pm</p>
                    <p>Sun: 9:00am - 12:00pm</p>
                  </div>
                </div>

                <a
                  href="https://wa.me/918948869808"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-3 rounded-lg transition"
                >
                  <Phone className="mr-2" size={18} />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area Map */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Service Areas
          </h3>
          <p className="mb-4 text-gray-700">
            We serve clients across Mumbai & Gujarat.
          </p>
          <div className="overflow-hidden rounded-lg shadow border border-yellow-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120839.41780136646!2d72.71998658748677!3d19.082197839198506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63d27199f17%3A0x3f08d19c730ecf98!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1628945747182!5m2!1sen!2sin"
              width="100%"
              height="450"
              allowFullScreen
              loading="lazy"
              className="w-full border-none"
              title="Service Area Map"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
