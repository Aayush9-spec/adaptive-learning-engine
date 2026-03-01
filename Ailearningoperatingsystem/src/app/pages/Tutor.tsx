import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../hooks/useAuth';
import {
    Send,
    Bot,
    User,
    Sparkles,
    BookOpen,
    Code2,
    HelpCircle,
    FileText,
    Brain,
    Loader2,
    Copy,
    Check,
    Lightbulb,
    Bug,
    GraduationCap,
    ArrowLeft,
} from 'lucide-react';
import { TUTOR_PERSONAS } from './TutorHub';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function Tutor() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const personaId = location.state?.personaId || 'general';
    const persona = TUTOR_PERSONAS[personaId as keyof typeof TUTOR_PERSONAS] || TUTOR_PERSONAS.general;
    const PersonaIcon = persona.icon;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText || isLoading) return;

        const userMessage: Message = { role: 'user', content: messageText, timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('ai_learning_os_token');
            const history = messages.map((m) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content,
            }));

            const apiBase = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';
            const res = await fetch(`${apiBase}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: messageText, history, systemPrompt: persona.systemPrompt }),
            });

            const data = await res.json();

            if (data.success) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: data.response, timestamp: new Date() },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: '⚠️ Sorry, I encountered an error. Please try again.', timestamp: new Date() },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: '⚠️ Connection error. Make sure the backend server is running on port 3001.', timestamp: new Date() },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const renderMarkdown = (text: string) => {
        // Simple markdown renderer for chat messages
        let html = text
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
                return `<pre class="bg-gray-900 rounded-xl p-4 my-3 overflow-x-auto"><code class="text-sm text-green-400 font-mono">${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
            })
            // Inline code
            .replace(/`([^`]+)`/g, '<code class="bg-muted/80 text-primary px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
            // Bold
            .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
            // Italic
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            // Headers
            .replace(/^### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2">$1</h4>')
            .replace(/^## (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
            .replace(/^# (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-3">$1</h2>')
            // Blockquotes
            .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/30 bg-primary/5 rounded-r-xl pl-4 pr-3 py-2 my-2 text-sm">$1</blockquote>')
            // Unordered lists
            .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm leading-relaxed">$1</li>')
            // Ordered lists
            .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm leading-relaxed">$1</li>')
            // Line breaks
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>');

        // Wrap consecutive <li> in <ul> or <ol>
        html = html.replace(/((?:<li class="ml-4 list-disc[^>]*>.*?<\/li><br\/>?)+)/g, '<ul class="my-2 space-y-1">$1</ul>');
        html = html.replace(/((?:<li class="ml-4 list-decimal[^>]*>.*?<\/li><br\/>?)+)/g, '<ol class="my-2 space-y-1">$1</ol>');

        return html;
    };

    const quickPrompts = [
        { icon: Lightbulb, label: 'Explain a concept', prompt: 'Explain the concept of recursion in programming with a simple example' },
        { icon: Bug, label: 'Debug my code', prompt: 'Help me debug this Python code:\n\ndef fibonacci(n):\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(100))  # This hangs!' },
        { icon: GraduationCap, label: 'Generate a quiz', prompt: 'Generate a 5-question quiz on Python data structures (lists, dicts, sets, tuples)' },
        { icon: FileText, label: 'Summarize a topic', prompt: 'Give me a concise summary of Object-Oriented Programming — the 4 pillars and when to use each' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0 lg:pl-64 flex flex-col">
            {/* Header */}
            <header className="bg-background/80 border-b border-border/50 sticky top-0 z-40 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/tutor-hub')}
                                className="mr-1 p-2 bg-muted/50 hover:bg-muted text-foreground rounded-xl transition-colors shrink-0"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className={`w-10 h-10 bg-${persona.color}-100 rounded-xl flex items-center justify-center shadow-sm`}>
                                <PersonaIcon className={`w-5 h-5 text-${persona.color}-600`} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-foreground">{persona.title}</h1>
                                <p className="text-xs text-muted-foreground line-clamp-1">{persona.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                            <span className="text-xs text-muted-foreground">Online</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Welcome State */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] pt-10 pb-4">
                            <div className={`w-20 h-20 bg-${persona.color}-100 rounded-3xl flex items-center justify-center shadow-md mb-6`}>
                                <PersonaIcon className={`w-10 h-10 text-${persona.color}-600`} />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Hi{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋</h2>
                            <p className="text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
                                {persona.greeting}
                            </p>

                            {/* Quick Prompts */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                                {quickPrompts.map((qp, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(qp.prompt)}
                                        className="flex items-center gap-3 p-4 bg-card/90 backdrop-blur-md rounded-2xl border border-white/50 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                                    >
                                        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                            <qp.icon className="w-4.5 h-4.5 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{qp.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className={`w-8 h-8 bg-${persona.color}-100 rounded-lg flex items-center justify-center shrink-0 mt-1`}>
                                    <PersonaIcon className={`w-4 h-4 text-${persona.color}-600`} />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] rounded-2xl ${msg.role === 'user'
                                    ? 'bg-primary text-white px-5 py-3'
                                    : 'bg-card/90 backdrop-blur-md border border-white/50 shadow-sm px-5 py-4'
                                    }`}
                            >
                                {msg.role === 'user' ? (
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                ) : (
                                    <div className="relative">
                                        <div
                                            className="text-sm leading-relaxed prose-sm"
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                                        />
                                        <button
                                            onClick={() => copyToClipboard(msg.content, i)}
                                            className="absolute -top-2 -right-2 w-7 h-7 bg-muted/80 hover:bg-muted rounded-lg flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                            title="Copy"
                                        >
                                            {copiedIndex === i ? (
                                                <Check className="w-3.5 h-3.5 text-secondary" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0 mt-1">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex gap-3 mb-6">
                            <div className={`w-8 h-8 bg-${persona.color}-100 rounded-lg flex items-center justify-center shrink-0`}>
                                <PersonaIcon className={`w-4 h-4 text-${persona.color}-600`} />
                            </div>
                            <div className="bg-card/90 backdrop-blur-md border border-white/50 shadow-sm rounded-2xl px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                    <span className="text-sm text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 lg:bottom-0 bg-background/80 backdrop-blur-xl border-t border-border/50 pb-20 lg:pb-0">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-end gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything... (Shift+Enter for new line)"
                                rows={1}
                                className="w-full resize-none rounded-2xl bg-muted/40 border border-border/50 px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:ring-[3px] focus:ring-primary/20 focus:border-primary outline-none transition-all max-h-32 overflow-y-auto"
                                style={{ minHeight: '48px' }}
                            />
                        </div>
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isLoading}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 ${input.trim() && !isLoading
                                ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                                }`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
                        AI Tutor powered by Google Gemini • Responses may not always be accurate
                    </p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
