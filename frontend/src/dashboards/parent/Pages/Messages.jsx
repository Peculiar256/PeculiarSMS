import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import '../css/Messages.css';
import parentService from '../../../services/parentService';

function Messages() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadMessages();
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    const data = await parentService.getMyChildren();
    if (data && data.length > 0) {
      setChildren(data);
      setSelectedChild(data[0]);
    }
    setLoading(false);
  };

  const loadMessages = async () => {
    if (!selectedChild) return;
    const data = await parentService.getMessages(selectedChild.id);
    if (data) {
      setMessages(data);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    await parentService.sendMessage(selectedChild.id, selectedConversation.teacherId, messageText);
    setMessageText('');
    loadMessages();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Group messages by teacher/conversation
  const conversations = messages.reduce((acc, msg) => {
    const key = msg.teacherId;
    if (!acc[key]) {
      acc[key] = {
        teacherId: msg.teacherId,
        teacherName: msg.teacherName,
        lastMessage: msg.message,
        lastMessageTime: msg.timestamp,
        unread: msg.unread || false,
        messages: [],
      };
    }
    acc[key].messages.push(msg);
    return acc;
  }, {});

  const conversationsList = Object.values(conversations);

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h1>Messages</h1>
        <p>Communicate with your child's teachers</p>
      </div>

      {/* Child Selector */}
      {children.length > 0 && (
        <div className="child-selector-bar">
          <label>Select Child:</label>
          <select
            value={selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find((c) => c.id === parseInt(e.target.value));
              setSelectedChild(child);
            }}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {children.length === 0 && (
        <div className="no-data-container">
          <p>No children found. Please link your children to your account.</p>
        </div>
      )}

      <div className="messages-layout">
        {/* Conversations List */}
        <div className="conversations-list">
          <h2>Conversations</h2>
          {conversationsList.length > 0 ? (
            conversationsList.map((conv) => (
              <div
                key={conv.teacherId}
                className={`conversation-item ${selectedConversation?.teacherId === conv.teacherId ? 'active' : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="conversation-avatar">
                  <User size={20} />
                </div>
                <div className="conversation-info">
                  <h3>{conv.teacherName}</h3>
                  <p>{conv.lastMessage.substring(0, 40)}...</p>
                </div>
                {conv.unread && <div className="unread-indicator"></div>}
              </div>
            ))
          ) : (
            <p className="no-conversations">No conversations yet</p>
          )}
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <h2>{selectedConversation.teacherName}</h2>
              </div>

              <div className="messages-display">
                {selectedConversation.messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.sender === 'parent' ? 'sent' : 'received'}`}>
                    <p>{msg.message}</p>
                    <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>

              <form className="message-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button type="submit">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation-selected">
              <MessageSquare size={48} />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
