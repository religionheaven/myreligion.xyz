import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface RequestsPageProps {
  onBack: () => void;
}

export function RequestsPage({ onBack }: RequestsPageProps) {
  const { user } = useAuth();
  const [requestType, setRequestType] = useState<"General" | "Add Religion">("General");
  const [requestText, setRequestText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !requestText.trim()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("user_requests").insert({
        user_id: user.id,
        request_type: requestType,
        request_text: requestText.trim(),
      });

      if (error) {
        console.error("Error submitting request:", error);
        alert("Failed to submit request. Please try again.");
      } else {
        setSubmitted(true);
        setRequestText("");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="min-h-screen relative overflow-hidden bg-white"
        style={{
          backgroundImage: "url(https://i.imgur.com/ocIai0k.gif)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Back button */}
        <div className="absolute top-8 left-8 z-20">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {/* Success message */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 max-w-md w-full text-center">
            <div className="relative z-10">
              <h2
                className="text-2xl text-white mb-4"
                style={{ fontFamily: "Poiret One, sans-serif" }}
              >
                Request Submitted
              </h2>
              <p className="text-white/80 mb-6">
                Thank you for your request. We'll review it and get back to you soon.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-medium hover:bg-black/90 transition-all duration-300 hover:scale-105 border border-white/20"
                style={{ fontFamily: "Poiret One, sans-serif" }}
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Desktop background */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage:
            "url(https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGNkanZobTJ2Y3FhNmJxdXdzaGw5NGl0aTh6bmVydHJ4aDB3MzRpOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FESFit0BwFBkk9rkLb/giphy.gif)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Mobile background */}
      <div
        className="absolute inset-0 block md:hidden"
        style={{
          backgroundImage: "url(https://i.imgur.com/llHxOih.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Back button */}
      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 max-w-lg w-full">
          {/* Radiance effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none rounded-3xl"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2
              className="text-2xl text-white mb-6 text-center"
              style={{ fontFamily: "Poiret One, sans-serif" }}
            >
              Submit a Request
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request Type */}
              <div>
                <label
                  className="block text-white/80 text-sm font-medium mb-3"
                  style={{ fontFamily: "Poiret One, sans-serif" }}
                >
                  Type of Request
                </label>
                <div className="flex bg-white/20 backdrop-blur-sm rounded-2xl p-1 border border-white/20">
                  <button
                    type="button"
                    onClick={() => setRequestType("General")}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                      requestType === "General"
                        ? "bg-black/80 text-white shadow-lg backdrop-blur-sm border border-white/20"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                    style={{ fontFamily: "Poiret One, sans-serif" }}
                  >
                    General
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType("Add Religion")}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                      requestType === "Add Religion"
                        ? "bg-black/80 text-white shadow-lg backdrop-blur-sm border border-white/20"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                    style={{ fontFamily: "Poiret One, sans-serif" }}
                  >
                    Add Religion
                  </button>
                </div>
              </div>

              {/* Request Text */}
              <div>
                <label
                  className="block text-white/80 text-sm font-medium mb-3"
                  style={{ fontFamily: "Poiret One, sans-serif" }}
                >
                  Your Request
                </label>
                <div className="relative">
                  <textarea
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="Please describe your request..."
                    maxLength={200}
                    rows={4}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-300 text-white placeholder-white/60 hover:bg-white/15 resize-none"
                    required
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-white/50">
                    {requestText.length}/200
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !requestText.trim()}
                className="w-full bg-black/80 backdrop-blur-sm text-white py-4 rounded-2xl font-medium hover:bg-black/90 transform hover:scale-[1.02] transition-all duration-500 shadow-2xl hover:shadow-white/20 border border-white/20 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ fontFamily: "Poiret One, sans-serif" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
