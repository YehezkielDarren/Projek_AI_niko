import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPaperPlane, FaRobot } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/chat";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(`session_${Date.now()}`); // Session ID sederhana
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Scroll ke pesan terakhir
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Pesan selamat datang dari bot
    setMessages([
      { text: "Halo! Tanyakan saya tentang cuaca atau gempa.", isUser: false },
    ]);
  }, []);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/message`, {
        message: input,
        sessionId: sessionId,
      });
      const botMessage = { text: response.data.reply, isUser: false };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        text: "Maaf, tidak bisa terhubung ke server.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen font-sans">
      <div className="w-full max-w-2xl h-[90vh] flex flex-col bg-white shadow-2xl rounded-2xl">
        <header className="p-4 border-b text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            WeatherBot (MERN)
          </h1>
        </header>

        <main className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.isUser ? "justify-end" : ""
              }`}
            >
              {!msg.isUser && (
                <div className="w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <FaRobot />
                </div>
              )}
              <div
                className={`p-3 rounded-lg max-w-md ${
                  msg.isUser
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <FaRobot />
              </div>
              <div className="p-3 rounded-lg bg-gray-200 text-gray-800">
                <div className="flex gap-1 items-center">
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        <footer className="p-4 border-t">
          <div className="flex items-center gap-3 bg-gray-100 rounded-full p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Tanyakan tentang cuaca..."
              className="w-full bg-transparent border-none focus:ring-0 p-2 text-gray-700"
            />
            <button
              onClick={handleSend}
              className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
              <FaPaperPlane />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
