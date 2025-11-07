import { useState } from "react";

export default function ContactModal({ isOpen, onClose }) {
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    const formData = new FormData(e.target);

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      setStatus("success");
      e.target.reset();
      setTimeout(() => {
        setStatus("idle");
        onClose();
      }, 2500);
    } else {
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#07172B] border border-white/10 rounded-2xl w-full max-w-md px-8 py-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Request a Demo</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-lg">
            ✕
          </button>
        </div>

        {status === "success" ? (
          <p className="text-center text-green-400 py-4 font-medium">
            ✅ Message Sent! We will contact you shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="access_key" value="ae8da509-c71a-4441-be44-be001cebb458" />

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              required
              className="w-full bg-[#0A1E36] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40"
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              required
              className="w-full bg-[#0A1E36] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40"
            />

            <textarea
              name="message"
              placeholder="Tell us about your data challenges..."
              required
              rows="4"
              className="w-full bg-[#0A1E36] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40"
            ></textarea>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-[#38BDF8] hover:bg-[#67D2FF] text-[#081728] font-semibold rounded-lg py-2 transition"
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
