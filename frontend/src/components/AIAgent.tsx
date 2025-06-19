import { useState } from "react";
import { invokeAgent } from "../services/agentService";

const AIAgent = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await invokeAgent(message);
      setResponse(result.response);
    } catch (error) {
      console.error("Error invoking agent:", error);
      setResponse("Error invoking agent. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">AI Agent</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          placeholder="Ask the AI something..."
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Thinking..." : "Send"}
        </button>
      </form>
      {response && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p>
            <strong>AI:</strong> {response}
          </p>
        </div>
      )}
    </div>
  );
};

export default AIAgent;
