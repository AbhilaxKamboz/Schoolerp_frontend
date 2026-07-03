import { useEffect, useState } from "react";
import { sendMessage, getChatHistory } from "../../api/aiService";

export default function AIChat() {

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getChatHistory();

            // Sort chats just in case
            const sortedChats = data.chats.sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );

            // Flatten messages
            const formattedMessages = sortedChats.flatMap(chat => [
                { sender: "user", text: chat.userMessage, createdAt: chat.createdAt },
                { sender: "ai", text: chat.aiReply, createdAt: chat.createdAt },
            ]);

            setMessages(formattedMessages);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = input;
        setMessages(prev => [
            ...prev,
            { sender: "user", text: userMessage }
        ]);
        setInput("");

        try {
            setLoading(true);
            const response = await sendMessage(userMessage);
            setMessages(prev => [
                ...prev,
                { sender: "ai", text: response.reply }
            ]);
        }
        catch (error) {

            console.log(error);

        }
        finally {

            setLoading(false);

        }

    };

    return (

        <div className="flex flex-col h-full">

            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-3 ${msg.sender === "user" ? "text-right" : "text-left"
                            }`}
                    >
                        <span
                            className={`inline-block p-3 rounded-lg ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
                                }`}
                        >
                            {msg.text}
                        </span>
                    </div>
                ))
                }
                {
                    loading && (
                        <div>
                            Thinking...
                        </div>
                    )
                }
            </div>

            <div className="p-4 border-t flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask something..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading) {
                            handleSend();
                        }
                    }}
                    className="flex-1 border rounded p-2"
                />

                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="bg-blue-500 px-4 py-2 rounded text-white disabled:opacity-50"
                >
                    {loading ? "..." : "Send"}
                </button>

            </div>
        </div>

    );

}