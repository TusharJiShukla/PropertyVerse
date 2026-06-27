import { useState } from "react";
import { FaMagic } from "react-icons/fa";
import api from "@/utils/api";

type Property = any; // Will use the passed down type

export default function MapMarkerPopup({ property }: { property: Property }) {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    setLoading(true);
    setInsight("AI is thinking...");
    try {
      const res = await api.get(`/ai/neighborhood-insights/${property._id}`);
      if (res.data.success) {
        setInsight(res.data.data.insight);
      } else {
        setInsight("Failed to generate insights.");
      }
    } catch (error) {
      console.error(error);
      setInsight("An error occurred while fetching insights.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-64">
      <h3 className="font-bold text-lg text-[#d6a243] mb-1">{property.title}</h3>
      <p className="text-sm font-semibold text-green-700 mb-2">
        ₹{property.discountedPrice.toLocaleString()}
      </p>
      
      <button 
        onClick={handleAskAI}
        disabled={loading}
        className="w-full bg-[#d6a243] text-white py-2 rounded-md hover:bg-[#b48735] transition text-sm font-semibold shadow-sm flex items-center justify-center gap-2 mb-3 disabled:opacity-70"
      >
        <FaMagic className={loading ? "animate-pulse" : ""} /> {loading ? "Analyzing Area..." : "Ask AI about this area"}
      </button>
      
      {insight && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-sm text-gray-700 italic max-h-40 overflow-y-auto">
          "{insight}"
        </div>
      )}
    </div>
  );
}
