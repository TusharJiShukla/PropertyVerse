"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaMapMarkerAlt, FaBed, FaBath, FaVectorSquare, FaCheckCircle, FaUserTie, FaPhoneAlt, FaMagic } from "react-icons/fa";
import Navbar from "../../components/navabar/page";
import Footer from "../../components/footer/page";
import PropertyMap from "../../../components/PropertyMap";
import api from "@/utils/api";

export default function PropertyDetailsClient({ id }: { id: string }) {
  const [property, setProperty] = useState<any>(null);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [formData, setFormData] = useState({
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Match score state
  const [matchInput, setMatchInput] = useState("");
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [matchReason, setMatchReason] = useState("");
  const [isMatching, setIsMatching] = useState(false);

  // Insights state
  const [insight, setInsight] = useState("");
  const [isFetchingInsight, setIsFetchingInsight] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch property
        const propRes = await api.get(`/properties/${id}`);
        if (propRes.data.success) {
          const fetchedProp = propRes.data.data;
          setProperty(fetchedProp);
          
          // Fetch matching brokers by city
          const cityQuery = fetchedProp.city || fetchedProp.location || "Mumbai";
          const brokerRes = await api.get(`/brokers?city=${cityQuery}&verified=true&limit=4`);
          if (brokerRes.data.success) {
            setBrokers(brokerRes.data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch property details", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleMatchScore = async () => {
    if (!matchInput.trim()) return;
    setIsMatching(true);
    setMatchScore(null);
    try {
      const res = await api.post("/ai/match-score", {
        userRequirements: matchInput,
        propertyDetails: property,
      });
      if (res.data.success) {
        setMatchScore(res.data.data.score);
        setMatchReason(res.data.data.reason);
      }
    } catch (error) {
      console.error("Match score failed", error);
      alert("Failed to analyze match score.");
    } finally {
      setIsMatching(false);
    }
  };

  const handleFetchInsight = async () => {
    setIsFetchingInsight(true);
    try {
      const res = await api.get(`/ai/neighborhood-insights/${id}`);
      if (res.data.success) {
        setInsight(res.data.data.insight);
      }
    } catch (error) {
      console.error("Neighborhood insight failed", error);
      alert("Failed to analyze neighborhood.");
    } finally {
      setIsFetchingInsight(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const brokerDetails = selectedBroker ? ` (Selected Broker: ${selectedBroker.name})` : "";
      // Map property type to requirement type
      let requirementType = "residential";
      if (property.type === "office" || property.type === "industrial") {
        requirementType = "commercial";
      }

      const payload = {
        title: `Visit Request: ${property.title}`,
        details: `Requested a site visit on ${formData.date} for ${property.title} located in ${property.location}.${brokerDetails}`,
        location: property.city || property.location,
        type: requirementType,
        budget: { 
          min: property.discountedPrice || 0, 
          max: property.discountedPrice || 0 
        },
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        urgency: "high"
      };

      await api.post("/property-requirements", payload);
      setSubmitted(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting requirement", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f1dd] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#d6a243]"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#f9f1dd]">
        <Navbar />
        <div className="text-center py-20 text-2xl font-bold text-gray-700">Property not found.</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f1dd] text-gray-900">
      <Navbar />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-10">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-[#d6a243] mb-2">{property.title}</h1>
              <p className="flex items-center text-gray-600 text-lg">
                <FaMapMarkerAlt className="mr-2 text-red-500" /> 
                {property.location} {property.city ? `, ${property.city}` : ""}
              </p>
            </div>
            <div className="text-left md:text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
              <p className="text-3xl font-bold text-green-700">₹{property.discountedPrice.toLocaleString()}</p>
              {property.originalPrice > property.discountedPrice && (
                <p className="text-lg text-red-400 line-through">₹{property.originalPrice.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Images & Details) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <Image 
                src={property.image} 
                alt={property.title} 
                fill 
                className="object-cover"
                priority
              />
              <div className="absolute top-4 right-4 bg-[#d6a243] text-white px-4 py-2 rounded-lg font-bold shadow-md uppercase">
                {property.availability}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 bg-white p-6 rounded-2xl shadow-md border-t-4 border-[#d6a243]">
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl flex-1 min-w-[120px]">
                <FaBed className="text-3xl text-[#d6a243]" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Bedrooms</p>
                  <p className="text-xl font-bold">{property.bedrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl flex-1 min-w-[120px]">
                <FaBath className="text-3xl text-[#d6a243]" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Bathrooms</p>
                  <p className="text-xl font-bold">{property.bathrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl flex-1 min-w-[120px]">
                <FaVectorSquare className="text-3xl text-[#d6a243]" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Area</p>
                  <p className="text-xl font-bold">{property.area} <span className="text-sm">{property.areaUnit}</span></p>
                </div>
              </div>
            </div>

            {/* AI Match Score Analyzer */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl shadow-md border border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#d6a243] p-2 rounded-lg text-white">
                  <FaMagic />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">AI Match Score</h2>
              </div>
              <p className="text-gray-600 mb-4">Describe what you are looking for, and our AI will tell you if this property is a good fit.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={matchInput}
                  onChange={(e) => setMatchInput(e.target.value)}
                  placeholder="e.g., I need a quiet place for my family with kids..."
                  className="flex-1 px-4 py-3 rounded-lg border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-[#d6a243] bg-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleMatchScore()}
                />
                <button 
                  onClick={handleMatchScore}
                  disabled={isMatching || !matchInput.trim()}
                  className="bg-[#d6a243] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#b48735] transition disabled:opacity-70 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {isMatching ? "Analyzing..." : "Analyze"}
                </button>
              </div>

              {matchScore !== null && (
                <div className="mt-6 bg-white p-6 rounded-xl border border-yellow-100 shadow-sm flex flex-col sm:flex-row items-start gap-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className={`text-4xl font-black ${matchScore >= 80 ? 'text-green-500' : matchScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {matchScore}%
                    </div>
                    <span className="text-xs text-gray-500 font-bold uppercase mt-1">Match</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">AI Analysis:</h4>
                    <p className="text-gray-600 text-sm italic">"{matchReason}"</p>
                  </div>
                </div>
              )}
            </div>

            {/* AI Neighborhood Insights */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl shadow-md border border-yellow-200 mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#d6a243] p-2 rounded-lg text-white">
                  <FaMagic />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">AI Neighborhood Insights</h2>
              </div>
              <p className="text-gray-600 mb-4">Get an instant AI analysis of the neighborhood vibe, walkability, and lifestyle.</p>
              
              {!insight ? (
                <button 
                  onClick={handleFetchInsight}
                  disabled={isFetchingInsight}
                  className="bg-[#d6a243] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#b48735] transition disabled:opacity-70 flex items-center gap-2"
                >
                  {isFetchingInsight ? "Analyzing Neighborhood..." : "Generate AI Insights"}
                </button>
              ) : (
                <div className="bg-white p-6 rounded-xl border border-yellow-100 shadow-sm">
                  <p className="text-gray-700 leading-relaxed italic">"{insight}"</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">About this Property</h2>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                {property.description || "A beautiful property located in a prime location. Contact our expert brokers to learn more and schedule a site visit today."}
              </p>
            </div>
          </div>

          {/* Right Column (Map & Brokers) */}
          <div className="space-y-8">
            
            {/* Interactive Map */}
            <div className="bg-white p-2 rounded-2xl shadow-md overflow-hidden relative z-0 border-t-4 border-[#d6a243]">
              <h3 className="text-lg font-bold p-3 text-gray-800">Location Map</h3>
              <div className="h-[300px] w-full rounded-xl overflow-hidden relative z-0">
                <PropertyMap properties={[property]} />
              </div>
            </div>

            {/* Broker Matching Block */}
            <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-[#d6a243]">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Verified Local Brokers</h2>
              <p className="text-sm text-gray-500 mb-6">Experts operating in {property.city || property.location}</p>
              
              {brokers.length > 0 ? (
                <div className="space-y-4">
                  {brokers.map(broker => (
                    <div key={broker._id} className="border border-gray-100 p-4 rounded-xl hover:shadow-md transition bg-gray-50">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="bg-gray-200 h-12 w-12 rounded-full flex items-center justify-center text-[#d6a243] text-xl">
                          <FaUserTie />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 flex items-center gap-1">
                            {broker.name} <FaCheckCircle className="text-blue-500 text-xs" title="Verified" />
                          </h4>
                          <p className="text-xs text-gray-500">{broker.experience} yrs exp</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <a href={`tel:${broker.phone}`} className="flex-1 bg-white border border-[#d6a243] text-[#d6a243] py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-50 transition text-sm font-semibold">
                          <FaPhoneAlt /> Call
                        </a>
                        <button 
                          onClick={() => { setSelectedBroker(broker); setIsModalOpen(true); }}
                          className="flex-1 bg-[#d6a243] text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#b48735] transition text-sm font-semibold"
                        >
                          Book Visit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">No verified brokers found for this city yet.</p>
                  <button 
                    onClick={() => { setSelectedBroker(null); setIsModalOpen(true); }}
                    className="w-full bg-[#d6a243] text-white py-3 rounded-lg font-bold shadow-md hover:bg-[#b48735] transition"
                  >
                    Contact Admin Directly
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      
      <Footer />

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {submitted ? (
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  <FaCheckCircle />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Request Sent!</h3>
                <p className="text-gray-600">We have received your site visit request. {selectedBroker ? `${selectedBroker.name}` : "Our team"} will contact you shortly.</p>
              </div>
            ) : (
              <>
                <div className="bg-[#d6a243] p-6 text-white relative">
                  <h3 className="text-xl font-bold">Request a Site Visit</h3>
                  <p className="text-sm opacity-90 mt-1">{property.title}</p>
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white text-2xl hover:scale-110 transition">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                    <input required type="text" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6a243] outline-none" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input required type="tel" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6a243] outline-none" placeholder="9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <input required type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6a243] outline-none" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Date</label>
                    <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d6a243] outline-none" min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <button disabled={submitting} type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold shadow-md hover:bg-gray-800 transition mt-6 disabled:opacity-70">
                    {submitting ? "Sending Request..." : "Confirm Booking"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
