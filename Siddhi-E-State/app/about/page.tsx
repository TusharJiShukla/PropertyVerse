"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "../components/navabar/page";
import Footer from "../components/footer/page";

type TeamMember = {
  id: number;
  name: string;
  role: string;
  image: string;
  description?: string;
};

const team: TeamMember[] = [
  { 
    id: 1, 
    name: "Eleanor Pena", 
    role: "Founder & CEO", 
    image: "https://res.cloudinary.com/dgvwhfdp0/image/upload/v1752122225/Home/team/zh9izzilkytvdhkfncxl.jpg",
    description: "15+ years of experience in real estate"
  },
  {
    id: 2,
    name: "Vina Rao",
    role: "Co-Founder & Director",
    image: "https://res.cloudinary.com/dgvwhfdp0/image/upload/v1752122225/Home/team/zh9izzilkytvdhkfncxl.jpg",
    description: "Expert in property investments"
  },
  {
    id: 3,
    name: "Ganesh Kumar",
    role: "Sales Manager",
    image: "https://res.cloudinary.com/dgvwhfdp0/image/upload/v1752121911/Home/team/pjyga2pmlc24dxqbqk53.jpg",
    description: "Specializes in residential properties"
  },
  {
    id: 4,
    name: "Jainendra Singh",
    role: "Senior Sales Consultant",
    image: "https://res.cloudinary.com/dgvwhfdp0/image/upload/v1752121911/Home/team/pjyga2pmlc24dxqbqk53.jpg",
    description: "Commercial property expert"
  },
];

const achievements = [
  { number: "50+", label: "Projects Completed", icon: "🏗️" },
  { number: "2000+", label: "Trusted Customers", icon: "👥" },
  { number: "15+", label: "Years of Excellence", icon: "⭐" },
  { number: "100%", label: "Client Satisfaction", icon: "😊" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, ease: "easeOut", duration: 0.5 },
  }),
};

const statsVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="bg-[#f9f1dd] text-gray-900">
        <Navbar />
        
        {/* Hero Banner */}
        <div className="w-full h-[70vh] relative mb-20 mt-10 rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/about-banner.png"
            alt="About PropertyVerse - Real Estate Excellence"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#d6a230]/70 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
                Our Story
              </h1>
              <p className="text-xl text-white max-w-2xl mx-auto px-4">
                Building dreams, creating legacies since 2010
              </p>
            </motion.div>
          </div>
        </div>

        {/* Company Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center space-y-6 mb-20 px-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Who We Are
          </h2>
          <p className="text-lg text-gray-800 leading-relaxed">
            At <strong className="text-[#d6a243]">PropertyVerse</strong>, we believe in crafting homes
            that tell stories — from dreamers to dwellers. With years of
            experience in the real estate market, our mission is to guide your
            journey with integrity, passion, and excellence.
          </p>
          <p className="text-lg text-gray-800 leading-relaxed">
            From bustling urban apartments to luxurious villas, our portfolio
            caters to every lifestyle. We pride ourselves on personalized
            service, industry expertise, and a commitment to long-term
            relationships.
          </p>
        </motion.div>

        {/* Team Section */}
        <div className="max-w-6xl mx-auto px-6 mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12"
          >
            Meet Our Leadership Team
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <motion.div
                key={member.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx}
                className="group relative overflow-hidden rounded-xl shadow-sm bg-white hover:shadow-xl transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-sm text-[#d6a243] font-medium mt-1">
                    {member.role}
                  </p>
                  {member.description && (
                    <p className="text-xs text-gray-600 mt-2">
                      {member.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Our Approach Section */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20 px-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
              Our Approach
            </h2>
            <p className="text-lg text-gray-800 mb-4 leading-relaxed">
              We build relationships based on trust, transparency, and tailored
              solutions.
            </p>
            <p className="text-lg text-gray-800 mb-6 leading-relaxed">
              Each client is unique. We listen first — and then we act. Our team
              works tirelessly to find the best opportunities and ensure smooth
              transactions.
            </p>
            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#d6a243] rounded-full"></div>
                <span className="text-gray-700">Client-First Approach</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#d6a243] rounded-full"></div>
                <span className="text-gray-700">Transparent Process</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-[400px] rounded-lg shadow-xl overflow-hidden"
          >
            <Image
              src="/our-approach.png"
              alt="PropertyVerse - Our Approach to Real Estate"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#d6a243]/80 to-transparent flex items-end justify-center p-8">
              <div className="text-white text-center">
                <h3 className="text-2xl font-extrabold drop-shadow-lg">
                  PropertyVerse
                </h3>
                <p className="text-lg mt-2 drop-shadow-md">
                  Transforming spaces into meaningful homes
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#d6a243] text-white py-16 px-6 rounded-lg shadow-md mx-6 mb-20"
        >
          <h3 className="text-3xl font-extrabold text-center mb-12">
            Our Achievements
          </h3>
          <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
            {achievements.map((achievement, idx) => (
              <motion.div
                key={idx}
                variants={statsVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx}
                className="bg-white text-[#d6a243] w-64 py-8 px-4 rounded-xl shadow-lg text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h4 className="text-4xl font-extrabold">{achievement.number}</h4>
                <p className="mt-2 text-lg font-medium">{achievement.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto px-6 mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-[#f9f1dd] rounded-xl">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Integrity</h3>
              <p className="text-gray-700">We operate with complete honesty and transparency in every transaction.</p>
            </div>
            <div className="text-center p-6 bg-[#f9f1dd] rounded-xl">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-700">We strive for the highest quality in service and property solutions.</p>
            </div>
            <div className="text-center p-6 bg-[#f9f1dd] rounded-xl">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Client First</h3>
              <p className="text-gray-700">Your needs and satisfaction are our top priority.</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#d6a243] to-[#b48735] text-white py-16 px-6 text-center"
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-extrabold mb-4">
              Ready to Start Your Real Estate Journey?
            </h3>
            <p className="text-lg mb-8">
              Let us help you find your dream home or commercial space.
            </p>
            <a href="/#contact">
              <button className="bg-white text-[#d6a243] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg">
                Contact Us Today
              </button>
            </a>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}