import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, Timestamp } from 'firebase/firestore';
import { Send, User } from 'lucide-react';

export function WebinarChat({ webinarId, sessionStart }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef(null);

  // CORREÇÃO: Lazy Initialization
  // O estado já começa com o valor certo, sem precisar de useEffect
  const [username] = useState(() => {
    const savedName = localStorage.getItem('chat_username');
    if (savedName) {
      return savedName;
    }
    const randomName = `Aluno ${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('chat_username', randomName);
    return randomName;
  });

  // FILTRO DE SESSÃO DO FAKE LIVE
  useEffect(() => {
    // Só conecta se tivermos ID e DATA DE INÍCIO
    if (!webinarId || !sessionStart) return;

    try {
        // Converte a string ISO para objeto Date e depois para Timestamp
        const startDateObj = new Date(sessionStart);
        const startTimestamp = Timestamp.fromDate(startDateObj);

        const messagesRef = collection(db, "webinars", webinarId, "messages");
        
        // Traz apenas mensagens criadas DEPOIS que a aula começou
        const q = query(
            messagesRef, 
            where("createdAt", ">=", startTimestamp),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const msgs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(msgs);
        });

        return () => unsubscribe();
        
    } catch (error) {
        console.error("Erro ao configurar chat:", error);
    }
  }, [webinarId, sessionStart]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messagesRef = collection(db, "webinars", webinarId, "messages");
      await addDoc(messagesRef, {
        text: newMessage,
        sender: username,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Cabeçalho do Chat */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shadow-sm z-10">
        <div>
            <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
            Chat ao Vivo
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </h3>
        </div>
        <div className="text-xs text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
            {username}
        </div>
      </div>

      {/* Lista de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40 gap-2">
            <div className="bg-gray-200 p-3 rounded-full">
                <Send size={20} className="-ml-1" />
            </div>
            <p className="text-sm italic">O chat está aberto. Participe!</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === username ? 'items-end' : 'items-start'} animate-fade-in-up`}>
            <div className={`max-w-[85%] rounded-xl p-3 shadow-sm text-sm ${
              msg.sender === username 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
            }`}>
              {msg.sender !== username && (
                  <p className="text-[10px] font-bold mb-1 opacity-60 flex items-center gap-1 uppercase tracking-wider text-blue-600">
                    {msg.sender}
                  </p>
              )}
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input de Envio */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
        <div className="flex gap-2 relative">
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua dúvida..."
                className="flex-1 bg-gray-100 border-0 rounded-lg pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            />
            <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="absolute right-1 top-1 bottom-1 aspect-square bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-md transition-all flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95"
            >
                <Send size={16} />
            </button>
        </div>
      </form>
    </div>
  );
}