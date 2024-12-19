import { useEffect, useState, useRef } from 'react';
import { Assistant } from 'openai/resources/beta/assistants.mjs';
import useLocalStorageState from '@/app/hooks/useLocalstorageState';
import { createAThread, getMessagesInThread, addMessageToThread, runThread, checkRunStatus, deleteAThread } from '@/app/actions/chat.action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TextContentBlock } from 'openai/resources/beta/threads/messages.mjs';

interface ChatInterfaceProps {
  supi: Partial<Assistant>;
}

interface Message {
  role: 'user' | 'assistant';
  content: string[];
}

export function ChatInterface({ supi }: ChatInterfaceProps) {
  const [threadId, setThreadId] = useLocalStorageState<string | null>(`chat-thread-${supi.id}`, null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initializeChat = async () => {
        if (!threadId) {
          console.log('initializing')
        const newThreadId = await createAThread();
        console.log({newThreadId})
        setThreadId(newThreadId);
      } else {
        const existingMessages = await getMessagesInThread(threadId);
        console.log({existingMessages})
        setMessages(existingMessages.map(msg => ({
          role: msg.role,
          content: msg.content.map((c: any) => c.text.value)
        })).reverse());
      }
    };

    initializeChat();
  }, [threadId]);

  const handleSendMessage = async () => {
    console.log({inputMessage,threadId,supi})
    if (!inputMessage.trim() || !threadId || !supi.id) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: [userMessage] }]);

    try {
      setIsLoading(true);
      await addMessageToThread(threadId, userMessage);
      const runId = await runThread(threadId, supi.id);

      // Poll for status
      const pollStatus = async () => {
        const status = await checkRunStatus(threadId, runId);
        console.log({status})
        setRunStatus(status);
        if (status === 'completed') {
          const updatedMessages = await getMessagesInThread(threadId);
          setMessages(updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content.map((c) => (c as TextContentBlock).text.value)
          })).reverse());
          setIsLoading(false);
          setRunStatus(null);
        } else if (status === 'failed' || status === 'cancelled') {
          console.log('failed or cancelled',status)
          setIsLoading(false);
          setRunStatus(null);
        } else {
          setTimeout(pollStatus, 1000);
        }
      };

      pollStatus();
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (threadId) {
      await deleteAThread(threadId);
      const newThreadId = await createAThread();
      setThreadId(newThreadId);
      setMessages([]);
    }
  };

  if(!threadId) return 'wait'

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearChat}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Clear Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex w-full",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-2",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.content.map((content, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  {content}
                </p>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {runStatus && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="capitalize">
            {runStatus.replace(/_/g, ' ')}...
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}