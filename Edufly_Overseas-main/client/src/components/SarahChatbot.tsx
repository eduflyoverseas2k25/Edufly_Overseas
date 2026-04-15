import { useState, useEffect, useRef } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sarahKnowledge } from "@/data/sarahKnowledge";

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
}

interface PaymentData extends LeadData {
  amount?: number;
  paymentType?: 'full' | 'part';
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function SarahChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [leadData, setLeadData] = useState<LeadData>({});
  const [paymentData, setPaymentData] = useState<PaymentData>({});
  const [currentFlow, setCurrentFlow] = useState<string>('main');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show popup after 5 seconds (once only)
  useEffect(() => {
    if (!hasShownOnce) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShownOnce(true);
        localStorage.setItem('sarahShown', 'true');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [hasShownOnce]);

  useEffect(() => {
    const shown = localStorage.getItem('sarahShown');
    if (shown) {
      setHasShownOnce(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(
        "Hi 👋 I'm Sarah, your Edufly Assistant.\n\nI can help you with the NASA program, registration, and payment.\n\nWhat would you like to do?",
        [
          { label: "🚀 View NASA Program", action: "nasa_trip" },
          { label: "📝 Register Interest", action: "register" },
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
      case 'nasa_trip':
        handleNASATrip();
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
        handleDownloadBrochure();
        break;
      case 'register_interest':
        handleRegisterInterest();
        break;
      case 'pay_now':
        handlePayNow(data);
        break;
      default:
        break;
    }
  };

  const handleNASATrip = () => {
    addUserMessage("View NASA Program");
    const nasa = sarahKnowledge.programs[0];
    
    const text = `🚀 **${nasa.title}**\n\n` +
      `📅 **Duration:** ${nasa.duration}\n` +
      `👨‍🎓 **Eligibility:** ${nasa.eligibility}\n` +
      `💰 **Price:** ₹${nasa.price.toLocaleString('en-IN')}\n\n` +
      `${nasa.description}\n\n` +
      `**Highlights:**\n${nasa.highlights.map(h => `✓ ${h}`).join('\n')}`;
    
    addBotMessage(text, [
      { label: "📄 Download Brochure", action: "download_brochure" },
      { label: "📝 Register Interest", action: "register_interest" },
      { label: "💳 Pay Now", action: "pay_now" },
      { label: "← Back", action: "back_to_main" }
    ]);
  };

  const handleRegisterStart = () => {
    addUserMessage("Register Interest");
    setCurrentFlow('register_name');
    addBotMessage(
      "Great! Let me collect a few details.\n\nWhat is the **student's name**?",
      []
    );
  };

  const handleRegisterInterest = () => {
    addUserMessage("Register Interest");
    setCurrentFlow('register_name');
    addBotMessage(
      "Perfect! Let's register your interest for the NASA STEM Educational Tour.\n\nWhat is the **student's name**?",
      []
    );
  };

  const handlePaymentStart = () => {
    addUserMessage("Make Payment");
    addBotMessage(
      "You can make payment for the **NASA STEM Educational Tour** (₹3,50,000).\n\nChoose payment option:",
      [
        { label: "💳 Full Payment (₹3,50,000)", action: "pay_now", data: { type: 'full', amount: 350000 } },
        { label: "💰 Part Payment", action: "pay_now", data: { type: 'part', amount: 0 } },
        { label: "← Back", action: "back_to_main" }
      ]
    );
  };

  const handlePayNow = (data: any) => {
    const paymentType = data?.type || 'full';
    addUserMessage(paymentType === 'full' ? 'Full Payment' : 'Part Payment');
    
    if (paymentType === 'part') {
      setPaymentData({ paymentType: 'part' });
      setCurrentFlow('payment_amount');
      addBotMessage(
        "Please enter the amount you want to pay now (minimum ₹50,000):",
        []
      );
    } else {
      setPaymentData({ paymentType: 'full', amount: 350000 });
      setCurrentFlow('payment_name');
      addBotMessage(
        `To proceed with **full payment** of ₹3,50,000, please provide:\n\n**Student Name:**`,
        []
      );
    }
  };

  const handleWhatsApp = () => {
    addUserMessage("Talk on WhatsApp");
    const whatsappUrl = `https://wa.me/${sarahKnowledge.contact.whatsapp}?text=Hi, I'm interested in the NASA STEM Educational Tour. Can you help me?`;
    window.open(whatsappUrl, '_blank');
    addBotMessage(
      "Opening WhatsApp... 💬\n\nOur team will be happy to assist you!",
      [{ label: "← Back to Main Menu", action: "back_to_main" }]
    );
  };

  const handleDownloadBrochure = () => {
    addUserMessage("Download Brochure");
    const brochureUrl = sarahKnowledge.programs[0].brochureUrl;
    if (brochureUrl) {
      window.open(brochureUrl, '_blank');
      addBotMessage(
        "Brochure is being downloaded... 📄\n\nWhat would you like to do next?",
        [
          { label: "📝 Register Interest", action: "register_interest" },
          { label: "💳 Pay Now", action: "pay_now" },
          { label: "← Back", action: "back_to_main" }
        ]
      );
    }
  };

  const handleBackToMain = () => {
    setCurrentFlow('main');
    setLeadData({});
    setPaymentData({});
    addBotMessage(
      "What would you like to do?",
      [
        { label: "🚀 View NASA Program", action: "nasa_trip" },
        { label: "📝 Register Interest", action: "register" },
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
    if (currentFlow === 'register_name') {
      setLeadData(prev => ({ ...prev, studentName: text }));
      setCurrentFlow('register_phone');
      addBotMessage("Great! Now, what is the **parent's phone number**?", []);
    } else if (currentFlow === 'register_phone') {
      setLeadData(prev => ({ ...prev, parentPhone: text }));
      setCurrentFlow('register_grade');
      addBotMessage("Almost done! What is the **student's grade/class**?", []);
    } else if (currentFlow === 'register_grade') {
      const finalLeadData = { ...leadData, studentGrade: text };
      setLeadData(finalLeadData);
      await saveLeadAndRedirect(finalLeadData);
    } else if (currentFlow === 'payment_amount') {
      const amount = parseInt(text.replace(/[^0-9]/g, ''));
      if (amount < 50000) {
        addBotMessage("Minimum part payment is ₹50,000. Please enter a valid amount:", []);
        return;
      }
      setPaymentData(prev => ({ ...prev, amount }));
      setCurrentFlow('payment_name');
      addBotMessage(`Great! Proceeding with payment of ₹${amount.toLocaleString('en-IN')}.\n\n**Student Name:**`, []);
    } else if (currentFlow === 'payment_name') {
      setPaymentData(prev => ({ ...prev, studentName: text }));
      setCurrentFlow('payment_phone');
      addBotMessage("**Parent's phone number:**", []);
    } else if (currentFlow === 'payment_phone') {
      setPaymentData(prev => ({ ...prev, parentPhone: text }));
      setCurrentFlow('payment_grade');
      addBotMessage("**Student's grade/class:**", []);
    } else if (currentFlow === 'payment_grade') {
      const finalPaymentData = { ...paymentData, studentGrade: text };
      setPaymentData(finalPaymentData);
      await initiatePayment(finalPaymentData);
    }
  };

  const saveLeadAndRedirect = async (data: LeadData) => {
    try {
      addBotMessage("Saving your details... ⏳", []);

      // Save lead to backend
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.studentName,
          phone: data.parentPhone,
          grade: data.studentGrade,
          program: 'NASA'
        })
      });

      // Redirect to WhatsApp
      const whatsappMessage = encodeURIComponent(
        `Hi! I'm interested in the NASA STEM Educational Tour.\n\nStudent Name: ${data.studentName}\nParent Phone: ${data.parentPhone}\nGrade: ${data.studentGrade}`
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
      console.error('Error saving lead:', error);
      addBotMessage(
        "Sorry, there was an error. Please try again or contact us directly.",
        [{ label: "💬 Contact on WhatsApp", action: "whatsapp" }]
      );
    }
  };

  const initiatePayment = async (data: PaymentData) => {
    try {
      addBotMessage("Initiating payment... ⏳", []);

      // Create Razorpay order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.studentName,
          phone: data.parentPhone,
          program: 'NASA',
          amount: data.amount
        })
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }

      // Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Edufly Overseas",
        description: "NASA STEM Educational Tour",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            addBotMessage(
              `✅ Payment successful!\n\nTransaction ID: ${response.razorpay_payment_id}\n\nYour seat for the NASA STEM Educational Tour has been confirmed. We'll contact you soon with further details.`,
              [{ label: "← Back to Main Menu", action: "back_to_main" }]
            );
          } else {
            addBotMessage(
              "Payment verification failed. Please contact us for assistance.",
              [{ label: "💬 Contact on WhatsApp", action: "whatsapp" }]
            );
          }
        },
        prefill: {
          name: data.studentName,
          contact: data.parentPhone
        },
        theme: {
          color: "#ef6e2d"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        addBotMessage(
          "Payment failed. Please try again or contact us for assistance.",
          [
            { label: "Try Again", action: "payment" },
            { label: "💬 Contact on WhatsApp", action: "whatsapp" }
          ]
        );
      });
      rzp.open();

    } catch (error) {
      console.error('Error initiating payment:', error);
      addBotMessage(
        "Sorry, there was an error initiating payment. Please contact us directly.",
        [{ label: "💬 Contact on WhatsApp", action: "whatsapp" }]
      );
    }
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
          {currentFlow !== 'main' && !currentFlow.includes('back') && (
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
