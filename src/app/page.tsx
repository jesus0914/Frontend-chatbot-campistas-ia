'use client';

import { useState, useEffect, useRef } from 'react';

type Message = {
  sender: 'user' | 'bot';
  text: string;
};

export default function Page() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: '¡Hola! Soy tu asistente del bootcamp. ¿En qué puedo ayudarte?' },
  ]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(false); // 👈 nuevo estado para mostrar errores
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setServerError(false); // resetear error si existe
    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: input }),
      });

      if (!response.ok) throw new Error('Respuesta no válida del servidor');

      const data = await response.json();
      const botMessage: Message = { sender: 'bot', text: data.respuesta };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setServerError(true);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: '❌ Error: no se pudo contactar al servidor. Intenta más tarde.' },
      ]);
    }

    setInput('');
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-6">
        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Chatbot Campistas IA</h1>
          <div className="flex-1 h-96 overflow-y-auto bg-gray-50 border border-gray-300 p-4 rounded mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <span
                  className={`inline-block px-4 py-2 rounded-lg ${
                    msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && (
              <div className="text-left mb-2">
                <span className="inline-block px-4 py-2 bg-gray-200 text-black rounded-lg">
                  Escribiendo...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {serverError && (
            <div className="mb-4 text-sm text-red-600">
              ⚠️ No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded px-4 py-2"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`px-4 py-2 rounded text-white ${
                loading || !input.trim()
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition`}
            >
              Enviar
            </button>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="md:w-80 bg-gray-50 border border-gray-200 rounded p-4 text-sm">
          <h2 className="font-semibold text-blue-600 mb-2">📝 Instrucciones de uso</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Pregunta: <strong>&quot;Tengo dudas sobre la inscripción&quot;</strong>
            </li>
            <li>
              Responde: <strong>&quot;Sí&quot;</strong> o <strong>&quot;No&quot;</strong>
            </li>
            <li>
              Pregunta:{' '}
              <strong>&quot;¿Cuáles son los horarios si estoy en la modalidad virtual?&quot;</strong>
            </li>
            <li>
              Pregunta:{' '}
              <strong>&quot;¿Puedo recibir certificado si no he terminado todos los módulos?&quot;</strong>
            </li>
            <li>Responde: <strong>&quot;No&quot;</strong></li>
          </ol>
          <p className="mt-3 text-gray-600">
            💡 También puedes preguntar cosas como <em>&quot;¿Qué se ve en HTML?&quot;</em> o{' '}
            <em>&quot;¿Qué es IA?&quot;</em>
          </p>
        </div>
      </div>
    </main>
  );
}
