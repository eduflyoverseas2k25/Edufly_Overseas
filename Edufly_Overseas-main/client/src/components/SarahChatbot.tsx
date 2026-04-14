import { useState, useEffect, useRef } from "react";
import { X, Send, MessageCircle, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sarahKnowledge, type Program } from "@/data/sarahKnowledge";

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  buttons?: Array<{ label: string; action: string; data?: any }>;
  timestamp: Date;
}

interface LeadData {
  studentName?: string;
  parentPhone?: string;
  studentGrade?: string;
  program?: string;
}

export function SarahChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [leadData, setLeadData] = useState<LeadData>({});
  const [currentFlow, setCurrentFlow] = useState<string>('main');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(
        "Hi 👋 I'm Sarah, your Edufly Assistant.\n\nI can help you explore programs, upcoming trips, and guide you through registration and payment.\n\nWhat would you like to do?",
        [
          { label: "🚀 Explore Programs", action: "explore_programs" },
          { label: "🛸 NASA Trip (Upcoming)", action: "nasa_trip" },
          { label: "📝 Register Now", action: "register" },
          { label: "💳 Make Payment", action: "payment" },
          { label: "💬 Talk on WhatsApp", action: "whatsapp" }
        ]
      );
    }
  }, [isOpen]);

  const addBotMessage = (text: string, buttons?: Array<{ label: string; action: string; data?: any }>) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'bot',
      text,
      buttons,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleAction = (action: string, data?: any) => {
    switch (action) {
      case 'explore_programs':
        handleExplorePrograms();
        break;
      case 'nasa_trip':
        handleNASATrip();
        break;
      case 'program_details':
        handleProgramDetails(data);
        break;
      case 'register':
        handleRegisterStart();
        break;
      case 'payment':
        handlePaymentStart();
        break;
      case 'whatsapp':
        handleWhatsApp();
        break;
      case 'back_to_main':
        handleBackToMain();
        break;
      case 'download_brochure':
        handleDownloadBrochure(data);
        break;
      case 'register_interest':
        handleRegisterInterest(data);
        break;
      case 'pay_now':
        handlePayNow(data);
        break;
      default:
        break;
    }
  };

  const handleExplorePrograms = () => {
    addUserMessage("Explore Programs");
    const programsText = "Here are our available programs:\n\n" + 
      sarahKnowledge.programs.map((p, i) => 
        `${i + 1}. **${p.name}**\n   ${p.duration} | ${p.eligibility}\n   ₹${p.price.toLocaleString('en-IN')}`
      ).join('\n\n');
    
    addBotMessage(
      programsText,
      sarahKnowledge.programs.map(p => ({
        label: p.name,
        action: 'program_details',
        data: p
      })).concat([{ label: "← Back to Main Menu", action: "back_to_main" }])
    );
  };

  const handleNASATrip = () => {
    addUserMessage("NASA Trip (Upcoming)");
    const nasa = sarahKnowledge.programs.find(p => p.id === 'nasa-trip');
    if (nasa) {
      const text = `🚀 **${nasa.title}**\n\n` +
        `📅 **Duration:** ${nasa.duration}\n` +
        `👨‍🎓 **Eligibility:** ${nasa.eligibility}\n` +
        `💰 **Price:** ₹${nasa.price.toLocaleString('en-IN')}\n\n` +
        `${nasa.description}\n\n` +
        `**Highlights:**\n${nasa.highlights.map(h => `✓ ${h}`).join('\n')}`;
      
      addBotMessage(text, [
        { label: "📄 Download Brochure", action: "download_brochure", data: nasa },
        { label: "📝 Register Interest", action: "register_interest", data: nasa },
        { label: "💳 Pay Now", action: "pay_now", data: nasa },
        { label: "← Back", action: "back_to_main" }
      ]);
    }
  };

  const handleProgramDetails = (program: Program) => {
    addUserMessage(program.name);
    const text = `**${program.title}**\n\n` +
      `📅 **Duration:** ${program.duration}\n` +
      `👨‍🎓 **Eligibility:** ${program.eligibility}\n` +
      `💰 **Price:** ₹${program.price.toLocaleString('en-IN')}\n\n` +
      `${program.description}\n\n` +
      `**What's Included:**\n${program.includes.map(i => `✓ ${i}`).join('\n')}`;
    
    addBotMessage(text, [
      { label: "📄 Download Brochure", action: "download_brochure", data: program },
      { label: "📝 Register Interest", action: "register_interest", data: program },
      { label: "💳 Pay Now", action: "pay_now", data: program },
      { label: "← Back", action: "explore_programs" }
    ]);
  };

  const handleRegisterStart = () => {
    addUserMessage("Register Now");
    setCurrentFlow('register_name');
    addBotMessage(
      "Great! Let me collect a few details.\n\nWhat is the **student's name**?",
      []
    );
  };

  const handleRegisterInterest = (program: Program) => {
    addUserMessage("Register Interest");
    setLeadData({ program: program.name });
    setCurrentFlow('register_name');
    addBotMessage(
      `Perfect! Let's register your interest for **${program.name}**.\n\nWhat is the **student's name**?`,
      []
    );
  };

  const handlePaymentStart = () => {
    addUserMessage("Make Payment");
    addBotMessage(
      "Which program would you like to pay for?",
      sarahKnowledge.programs.map(p => ({
        label: `${p.name} - ₹${p.price.toLocaleString('en-IN')}`,
        action: 'pay_now',
        data: p
      })).concat([{ label: "← Back", action: "back_to_main" }])
    );
  };

  const handlePayNow = (program: Program) => {
    addUserMessage(`Pay for ${program.name}`);
    setLeadData({ program: program.name });
    setCurrentFlow('payment_name');
    addBotMessage(
      `To proceed with payment for **${program.name}** (₹${program.price.toLocaleString('en-IN')}), please provide:\n\n**Student Name:**`,
      []
    );
  };

  const handleWhatsApp = () => {
    addUserMessage("Talk on WhatsApp");
    const whatsappUrl = `https://wa.me/${sarahKnowledge.contact.whatsapp}?text=Hi, I'm interested in Edufly Overseas programs. Can you help me?`;
    window.open(whatsappUrl, '_blank');
    addBotMessage(
      "Opening WhatsApp... 💬\n\nOur team will be happy to assist you!",
      [{ label: "← Back to Main Menu", action: "back_to_main" }]
    );
  };

  const handleDownloadBrochure = (program: Program) => {
    addUserMessage("Download Brochure");
    if (program.brochureUrl) {
      window.open(program.brochureUrl, '_blank');
      addBotMessage(
        "Brochure is being downloaded... 📄\n\nWhat would you like to do next?",
        [
          { label: "📝 Register Interest", action: "register_interest", data: program },
          { label: "💳 Pay Now", action: "pay_now", data: program },
          { label: "← Back", action: "back_to_main" }
        ]
      );
    } else {
      addBotMessage(
        "Brochure will be available soon. Please contact us for more details.",
        [{ label: "💬 Contact on WhatsApp", action: "whatsapp" }]
      );
    }
  };

  const handleBackToMain = () => {
    setCurrentFlow('main');
    setLeadData({});
    addBotMessage(
      "What would you like to do?",
      [
        { label: "🚀 Explore Programs", action: "explore_programs" },
        { label: "🛸 NASA Trip (Upcoming)", action: "nasa_trip" },
        { label: "📝 Register Now", action: "register" },
        { label: "💳 Make Payment", action: "payment" },
        { label: "💬 Talk on WhatsApp", action: "whatsapp" }
      ]
    );
  };

  const handleTextInput = async (text: string) => {
    if (!text.trim()) return;

    addUserMessage(text);
    setInputValue('');

    // Handle text input based on current flow
    if (currentFlow === 'register_name' || currentFlow === 'payment_name') {
      setLeadData(prev => ({ ...prev, studentName: text }));
      setCurrentFlow(currentFlow === 'register_name' ? 'register_phone' : 'payment_phone');
      addBotMessage("Great! Now, what is the **parent's phone number**?", []);
    } else if (currentFlow === 'register_phone' || currentFlow === 'payment_phone') {
      setLeadData(prev => ({ ...prev, parentPhone: text }));
      setCurrentFlow(currentFlow === 'register_phone' ? 'register_grade' : 'payment_grade');
      addBotMessage("Almost done! What is the **student's grade/class**?", []);
    } else if (currentFlow === 'register_grade') {
      setLeadData(prev => ({ ...prev, studentGrade: text }));
      await saveLeadAndRedirect({ ...leadData, studentGrade: text });
    } else if (currentFlow === 'payment_grade') {
      setLeadData(prev => ({ ...prev, studentGrade: text }));
      await initiatePayment({ ...leadData, studentGrade: text });
    }
  };

  const saveLeadAndRedirect = async (data: LeadData) => {
    try {
      // Save lead to backend
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.studentName,
          phone: data.parentPhone,
          purpose: `Interest in ${data.program || 'Programs'}`,
          message: `Student Grade: ${data.studentGrade}`
        })
      });

      // Redirect to WhatsApp
      const whatsappMessage = encodeURIComponent(
        `Hi! I'm interested in Edufly programs.\n\nStudent Name: ${data.studentName}\nParent Phone: ${data.parentPhone}\nGrade: ${data.studentGrade}\nProgram: ${data.program || 'General Inquiry'}`
      );
      const whatsappUrl = `https://wa.me/${sarahKnowledge.contact.whatsapp}?text=${whatsappMessage}`;
      
      addBotMessage(
        `✅ Thank you, **${data.studentName}**!\n\nYour details have been saved. Redirecting you to WhatsApp...`,
        []
      );

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        handleBackToMain();
      }, 1500);
    } catch (error) {
      addBotMessage(
        "Sorry, there was an error. Please try again or contact us directly.",
        [{ label: "💬 Contact on WhatsApp", action: "whatsapp" }]
      );
    }
  };

  const initiatePayment = async (data: LeadData) => {
    addBotMessage(
      `Processing payment for **${data.studentName}**...\n\n(Payment integration coming next)`,
      [{ label: "← Back to Main Menu", action: "back_to_main" }]
    );
    // Payment logic will be added in next step
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-full shadow-2xl transition-all hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-bold">Chat with Sarah</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] max-w-[420px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                S
              </div>
              <div>
                <h3 className="font-bold text-white">Sarah</h3>
                <p className="text-xs text-white/80">Edufly Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  {message.buttons && message.buttons.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.buttons.map((button, index) => (
                        <button
                          key={index}
                          onClick={() => handleAction(button.action, button.data)}
                          className="w-full text-left text-sm px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium"
                        >
                          {button.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {(currentFlow.includes('register') || currentFlow.includes('payment')) && currentFlow !== 'main' && (
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTextInput(inputValue)}
                  placeholder="Type your answer..."
                  className="flex-1"
                />
                <Button
                  onClick={() => handleTextInput(inputValue)}
                  size="icon"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
