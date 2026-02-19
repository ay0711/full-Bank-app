import React, { useState, useEffect, useRef } from 'react';
import { COLORS } from './PageLayout';
import { useAppContext } from '../context/AppContext';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! 👋 I\'m your AI banking assistant. How can I help you today?',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { isDarkMode, user } = useAppContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { label: 'Check Balance', icon: '💰' },
    { label: 'Transfer Money', icon: '➡️' },
    { label: 'Transaction History', icon: '📜' },
    { label: 'Report Issue', icon: '⚠️' }
  ];

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getAIResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    // Account upgrade (check before balance to avoid conflict)
    if (msg.includes('upgrade') || msg.includes('premium') || msg.includes('business')) {
      return 'We offer three account types:\n• Standard: Basic features\n• Premium: Higher limits + priority support\n• Business: Unlimited transactions + team features\n\nUpgrade from your Profile page under Account Upgrade.';
    }
    
    // Balance inquiry
    if (msg.includes('balance') || msg.includes('money') || msg.includes('how much')) {
      return `Your current account balance is ${formatCurrency(user?.accountBalance || 0)}. Your account type is ${user?.accountType || 'Standard'}.`;
    }
    
    // Transfer help
    if (msg.includes('transfer') || msg.includes('send money')) {
      return 'To transfer money:\n1. Go to the Transfer page\n2. Enter recipient account number\n3. Enter amount\n4. Add a note (optional)\n5. Confirm the transfer\n\nYour daily transfer limit is based on your account type.';
    }
    
    // Transaction history
    if (msg.includes('transaction') || msg.includes('history') || msg.includes('statement')) {
      return 'You can view your transaction history on the Transactions page. You can also download statements from your Profile settings under "Statement Downloads".';
    }
    
    // Card issues
    if (msg.includes('card') || msg.includes('atm')) {
      return 'For card-related issues:\n• Check if your card is activated in the Cards section\n• Ensure you have sufficient balance\n• Verify your PIN is correct\n• Contact support if the issue persists';
    }
    
    // Withdrawal
    if (msg.includes('withdraw') || msg.includes('cash out')) {
      return 'To withdraw money:\n1. Navigate to the Withdraw page\n2. Select withdrawal method (Bank Transfer or ATM)\n3. Enter amount\n4. Confirm withdrawal\n\nProcessing time: Instant for bank transfers, 24 hours for ATM.';
    }
    
    // Bills payment
    if (msg.includes('bill') || msg.includes('airtime') || msg.includes('data')) {
      return 'You can pay bills in the Bill Payments section:\n• Airtime & Data recharge\n• Electricity bills\n• Cable TV subscriptions\n• Internet services\n\nAll payments are instant!';
    }
    
    // Loan inquiry
    if (msg.includes('loan') || msg.includes('borrow')) {
      return 'Loan eligibility depends on:\n• Account age (minimum 3 months)\n• Transaction history\n• Account type\n\nVisit the Loans page to check your eligibility and apply.';
    }
    
    // Security
    if (msg.includes('security') || msg.includes('password') || msg.includes('safe')) {
      return 'Security tips:\n• Enable Two-Factor Authentication\n• Use a strong password\n• Never share your PIN or password\n• Review login activity regularly in Settings\n• Enable biometric login for faster access';
    }
    
    // Support contact
    if (msg.includes('support') || msg.includes('contact') || msg.includes('help')) {
      return 'You can reach our support team:\n📧 Email: support@bankapp.com\n📞 Phone: +234 800 123 4567\n💬 Live Chat: Available 24/7\n\nOr create a ticket in the Support section.';
    }
    
    // Greetings
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return `Hello ${user?.firstName || 'there'}! 😊 How can I assist you with your banking today?`;
    }
    
    // Thanks
    if (msg.includes('thank') || msg.includes('thanks')) {
      return 'You\'re welcome! Is there anything else I can help you with?';
    }
    
    // Account number or general account info (more specific than just "account")
    if ((msg.includes('account number') || msg.includes('my number')) && !msg.includes('upgrade')) {
      return `Your account number is: ${user?.accountNumber || 'Not assigned'}`;
    }
    
    // Default response
    return 'I can help you with:\n• Account balance & info\n• Transfers & withdrawals\n• Bill payments\n• Card issues\n• Transaction history\n• Account upgrades\n• Security settings\n• General support\n\nWhat would you like to know?';
  };

  const formatCurrency = (amount) => {
    return '₦' + (typeof amount === 'number' ? amount.toLocaleString('en-NG') : '0');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = {
      type: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        text: getAIResponse(inputMessage),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (action) => {
    setInputMessage(action.label);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: isMobile ? '76px' : '24px',
            right: isMobile ? '16px' : '24px',
            width: isMobile ? '54px' : '60px',
            height: isMobile ? '54px' : '60px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${COLORS.primary}, #3730A3)`,
            border: 'none',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
            cursor: 'pointer',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            color: 'white',
            transition: 'all 0.3s ease',
            animation: 'pulse 2s infinite'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(79, 70, 229, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.4)';
          }}
          title="AI Assistant"
        >
          <i className="fas fa-comment-dots"></i>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: isMobile ? '0' : '24px',
            right: isMobile ? '0' : '24px',
            left: isMobile ? '0' : 'auto',
            width: isMobile ? '100%' : 'min(400px, calc(100vw - 48px))',
            height: isMobile ? '100vh' : 'min(600px, calc(100vh - 100px))',
            background: isDarkMode ? '#1F2937' : 'white',
            borderRadius: isMobile ? '0' : '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            border: isDarkMode ? '1px solid #374151' : 'none',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, #3730A3)`,
              padding: isMobile ? '16px' : '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'white'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '12px' }}>
              <div
                style={{
                  width: isMobile ? '36px' : '40px',
                  height: isMobile ? '36px' : '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '1rem' : '1.2rem'
                }}
              >
                🤖
              </div>
              <div>
                <div className="fw-bold" style={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  AI Assistant
                </div>
                <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', opacity: 0.9 }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#10B981',
                    marginRight: '6px',
                    animation: 'pulse 2s infinite'
                  }}></span>
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '1.2rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: isMobile ? '16px' : '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '10px' : '12px',
              background: isDarkMode ? '#111827' : '#F9FAFB'
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'slideIn 0.3s ease'
                }}
              >
                <div
                  style={{
                    maxWidth: isMobile ? '85%' : '75%',
                    padding: isMobile ? '10px 14px' : '12px 16px',
                    borderRadius: msg.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.type === 'user' 
                      ? `linear-gradient(135deg, ${COLORS.primary}, #3730A3)`
                      : isDarkMode ? '#374151' : 'white',
                    color: msg.type === 'user' ? 'white' : isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    boxShadow: msg.type === 'user' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-line',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    lineHeight: '1.5',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.text}
                  <div
                    style={{
                      fontSize: '0.7rem',
                      opacity: 0.7,
                      marginTop: '4px',
                      textAlign: 'right'
                    }}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    background: isDarkMode ? '#374151' : 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  <div className="d-flex gap-1">
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: COLORS.primary,
                      animation: 'bounce 1.4s infinite ease-in-out'
                    }}></span>
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: COLORS.primary,
                      animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                    }}></span>
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: COLORS.primary,
                      animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                    }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div
              style={{
                padding: '12px 20px',
                borderTop: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                background: isDarkMode ? '#1F2937' : 'white'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: COLORS.lightText, marginBottom: '8px' }}>
                Quick Actions:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '12px',
                      border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                      background: isDarkMode ? '#374151' : COLORS.light,
                      color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = COLORS.primary;
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.border = `1px solid ${COLORS.primary}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#374151' : COLORS.light;
                      e.currentTarget.style.color = isDarkMode ? '#D1D5DB' : COLORS.darkText;
                      e.currentTarget.style.border = isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB';
                    }}
                  >
                    {action.icon} {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div
            style={{
              padding: isMobile ? '12px 16px' : '16px 20px',
              borderTop: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
              background: isDarkMode ? '#1F2937' : 'white',
              display: 'flex',
              gap: isMobile ? '8px' : '12px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isMobile ? "Message..." : "Type your message..."}
              style={{
                flex: 1,
                padding: isMobile ? '8px 12px' : '10px 14px',
                borderRadius: '12px',
                border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                background: isDarkMode ? '#374151' : COLORS.light,
                color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              style={{
                width: isMobile ? '36px' : '40px',
                height: isMobile ? '36px' : '40px',
                borderRadius: '12px',
                border: 'none',
                background: inputMessage.trim() ? `linear-gradient(135deg, ${COLORS.primary}, #3730A3)` : isDarkMode ? '#4B5563' : '#D1D5DB',
                color: 'white',
                cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                fontSize: isMobile ? '0.9rem' : '1rem',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (inputMessage.trim()) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4); }
          50% { box-shadow: 0 8px 32px rgba(79, 70, 229, 0.6); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default AIAssistant;
