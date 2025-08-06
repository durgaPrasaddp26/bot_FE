import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Paper,
  Tooltip,
  Avatar,
  useMediaQuery,
  useTheme,
  Fab,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StopIcon from '@mui/icons-material/Stop';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import jsPDF from 'jspdf';
import Lottie from 'lottie-react';
import chatBotAnimation from './chatbot-animation.json';
import DownloadIcon from '@mui/icons-material/Download';

import { v4 as uuidv4 } from 'uuid';



export default function ChatApp() {
  const [sessionId] = useState(() => uuidv4()); 

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingEffect, setTypingEffect] = useState('');
  const [typingIntervalId, setTypingIntervalId] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingEffect]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTypingEffect('');
    setLoading(true);

    try {

      const res = await axios.post('http://localhost:5000/api/chat', {
        message: input,
        sessionId, // 🧠 This enables memory
      });

      const botReply = res.data.reply || "🤖 Sorry, I couldn't generate a response.";
      let index = 0;
      const intervalId = setInterval(() => {
        if (index < botReply.length) {
          setTypingEffect((prev) => prev + botReply[index]);
          index++;
        } else {
          clearInterval(intervalId);
          setTypingIntervalId(null);
          setMessages((prev) => [...prev, { role: 'bot', content: botReply }]);
          setTypingEffect('');
        }
      }, 15);
      setTypingIntervalId(intervalId);
    } catch (err) {
      console.error('Error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: '❌ Failed to fetch response from AI server.' },
      ]);
      setTypingEffect('');
    } finally {
      setLoading(false);
    }
  };

  const stopReply = () => {
    if (typingIntervalId) {
      clearInterval(typingIntervalId);
      setTypingIntervalId(null);
      setTypingEffect('');
      setMessages((prev) => [...prev, { role: 'bot', content: '🤖 Response stopped by user.' }]);
      setLoading(false);
    }
  };

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const exportChatToPDF = () => {
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    messages.forEach((msg) => {
      const prefix = msg.role === 'user' ? 'User:' : 'AI:';
      const content = msg.content;

      const parts = content.split(/```(?:\w*\n)?([\s\S]*?)```/g);

      parts.forEach((part, i) => {
        const isCode = i % 2 === 1;

        if (isCode) {
          // Highlight code block
          const codeLines = doc.splitTextToSize(part.trim(), 180);
          const boxHeight = codeLines.length * 6 + 4;

          doc.setFillColor(240, 240, 240);
          doc.rect(10, y, 190, boxHeight, 'F');

          doc.setFont('courier', 'normal');
          doc.setTextColor(0, 0, 0);

          codeLines.forEach((line) => {
            doc.text(line, 12, y + 6);
            y += 6;
          });

          y += 15;
        } else {
          const lines = doc.splitTextToSize(`${prefix} ${part.trim()}`, 180);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(20, 20, 20);

          lines.forEach((line) => {
            doc.text(line, 10, y);
            y += 7;
          });

          y += 4;
        }

        if (y > 270) {
          doc.addPage();
          y = 15;
        }
      });

      y += 6;
    });

    doc.save('chat-history.pdf');
  };


  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: '#0f1117',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, mb: 1.5, py: 1.5, bgcolor: '#181c23', textAlign: 'center' }}>
        <Typography
          component="pre"
          sx={{
            fontFamily: 'monospace',
            whiteSpace: 'pre',
            fontSize: '3px',
            lineHeight: 1.2,
            textAlign: 'center',
            color: '#39FF14',
          }}
        >
          {`██████╗ ██████╗  █████╗ ███████╗ █████╗ ██████╗       ██████╗  ██████╗ ████████╗
██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗      ██╔══██╗██╔═══██╗╚══██╔══╝
██████╔╝██████╔╝███████║███████╗███████║██║  ██║█████╗██████╔╝██║   ██║   ██║   
██╔═══╝ ██╔══██╗██╔══██║╚════██║██╔══██║██║  ██║╚════╝██╔══██╗██║   ██║   ██║   
██║     ██║  ██║██║  ██║███████║██║  ██║██████╔╝      ██████╔╝╚██████╔╝   ██║   
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝       ╚═════╝  ╚═════╝    ╚═╝`}
        </Typography>
      </Box>

      {/* Chat messages */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.length === 0 && !typingEffect ? (
          <Box
            sx={{
              flex: 1,
              minHeight: '96.5%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.6,
              textAlign: 'center',
              px: 2,
            }}
          >
            <Lottie
              animationData={chatBotAnimation}
              loop
              style={{
                width: isSmallScreen ? '75%' : '30%',
                marginBottom: '0rem',
              }}
            />
            <Typography variant="h6" sx={{ color: '#bbb' }}>
              Hello! I'm your AI assistant.
            </Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>
              Ask anything and I’ll try my best to help you.
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Avatar sx={{ bgcolor: msg.role === 'user' ? '#3949ab' : '#4caf50' }}>
                  {msg.role === 'user' ? 'U' : 'AI'}
                </Avatar>
                <Box
                  sx={{
                    backgroundColor: msg.role === 'user' ? '#1e293b' : '#263238',
                    color: '#f1f1f1',
                    px: 2,
                    py: 1.5,
                    borderRadius: 3,
                    maxWidth: '75%',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.role === 'bot' ? (
                    msg.content.split(/```(?:\w*\n)?([\s\S]*?)```/g).map((part, index) => {
                      const isCodeBlock = index % 2 === 1;
                      return isCodeBlock ? (
                        <Box key={index} sx={{ position: 'relative', mt: 1 }}>
                          <SyntaxHighlighter
                            language="javascript"
                            style={oneDark}
                            customStyle={{
                              backgroundColor: '#000000',
                              borderRadius: '10px',
                              fontSize: '0.85rem',
                              padding: '1em',
                              margin: 0,
                              overflowX: 'auto',
                              wordBreak: 'break-word',
                            }}
                          >
                            {part}
                          </SyntaxHighlighter>
                          <Tooltip title={copiedIndex === index ? 'Copied!' : 'Copy code'}>
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'white',
                                color: 'black',
                                '&:hover': { bgcolor: 'black', color: 'white' },
                              }}
                              onClick={() => handleCopy(part, index)}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography key={index} sx={{ whiteSpace: 'pre-wrap' }}>
                          {part.trim()}
                        </Typography>
                      );
                    })
                  ) : (
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                  )}
                </Box>
              </Box>
            ))}

            {/* Typing effect */}
            {typingEffect && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#4caf50' }}>AI</Avatar>
                <Box
                  sx={{
                    bgcolor: '#263238',
                    px: 2,
                    py: 1.5,
                    borderRadius: 3,
                    maxWidth: '75%',
                    fontStyle: 'italic',
                  }}
                >
                  {typingEffect}
                  <span className="typing-dot">|</span>
                </Box>
              </Box>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input area */}
      <Paper
        elevation={6}
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderTop: '1px solid #444',
          bgcolor: '#181c23',
        }}
      >
        <TextField
          multiline
          maxRows={4}
          placeholder="Ask me anything..."
          fullWidth={isSmallScreen}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{
            width: isSmallScreen ? '100%' : '40%',
            '& .MuiInputBase-root': {
              color: 'white',
              bgcolor: '#1e1e2f',
              borderRadius: 2,
              px: 2,
            },
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        {typingIntervalId ? (
          <Tooltip title="Stop Response">
            <IconButton onClick={stopReply}>
              <StopIcon color="error" />
            </IconButton>
          </Tooltip>
        ) : (
          <IconButton
            onClick={handleSend}
            disabled={loading}
            sx={{ bgcolor: '#3949ab', color: 'white', '&:hover': { bgcolor: '#303f9f' } }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <SendIcon />}
          </IconButton>
        )}

        {/* Export Chat Button */}
        {messages.length > 0 && (
          <Tooltip title="Download chat as PDF">
            <IconButton
              onClick={exportChatToPDF}
              sx={{
                bgcolor: '#181c23',
                border: 0,
                color: 'white',
                '&:hover': {
                  bgcolor: '#0a0d12ff',
                },
              }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        )}

      </Paper>

      {/* Scroll-to-bottom FAB */}
      <Fab
        size="small"
        sx={{
          position: 'fixed',
          bottom: isSmallScreen ? 60 : 70,
          right: 24,
          bgcolor: '#0d0d21ff',
          color: 'white',
          '&:hover': { bgcolor: '#1e1f1eff' },
        }}
        onClick={scrollToBottom}
      >
        <KeyboardArrowDownIcon />
      </Fab>
    </Box>
  );
}

// import { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import {
//   Box, Typography, TextField, IconButton, Button, CircularProgress, Paper,
//   Tooltip, Avatar, useMediaQuery, useTheme, Fab
// } from '@mui/material';
// import {
//   Send as SendIcon, ContentCopy as ContentCopyIcon, Stop as StopIcon,
//   KeyboardArrowDown as KeyboardArrowDownIcon, Download as DownloadIcon
// } from '@mui/icons-material';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import jsPDF from 'jspdf';
// import Lottie from 'lottie-react';
// import chatBotAnimation from './chatbot-animation.json';

// export default function ChatApp() {
//   const [input, setInput] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [typingEffect, setTypingEffect] = useState('');
//   const [typingIntervalId, setTypingIntervalId] = useState(null);
//   const [copiedIndex, setCopiedIndex] = useState(null);
//   const messagesEndRef = useRef(null);
//   const containerRef = useRef(null);
//   const theme = useTheme();
//   const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

//   useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, typingEffect]);

//   const handleSend = async () => {
//     if (!input.trim()) return;
//     const userMsg = { role: 'user', content: input };
//     setMessages(prev => [...prev, userMsg]);
//     setInput('');
//     setTypingEffect('');
//     setLoading(true);

//     try {
//       const res = await axios.post('https://bot-be-00pc.onrender.com/api/chat', { message: input });
//       const botReply = res.data.reply || "🤖 Sorry, I couldn't generate a response.";
//       let index = 0;
//       const intervalId = setInterval(() => {
//         if (index < botReply.length) {
//           setTypingEffect(prev => prev + botReply[index++]);
//         } else {
//           clearInterval(intervalId);
//           setTypingIntervalId(null);
//           setMessages(prev => [...prev, { role: 'bot', content: botReply }]);
//           setTypingEffect('');
//         }
//       }, 15);
//       setTypingIntervalId(intervalId);
//     } catch {
//       setMessages(prev => [...prev, { role: 'bot', content: '❌ Failed to fetch response from AI server.' }]);
//       setTypingEffect('');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const stopReply = () => {
//     if (typingIntervalId) {
//       clearInterval(typingIntervalId);
//       setTypingIntervalId(null);
//       setTypingEffect('');
//       setMessages(prev => [...prev, { role: 'bot', content: '🤖 Response stopped by user.' }]);
//       setLoading(false);
//     }
//   };

//   const handleCopy = (code, index) => {
//     navigator.clipboard.writeText(code);
//     setCopiedIndex(index);
//     setTimeout(() => setCopiedIndex(null), 2000);
//   };

//   const exportChatToPDF = () => {
//     const doc = new jsPDF();
//     let y = 15;
//     doc.setFontSize(12);
//     doc.setFont('helvetica', 'normal');

//     messages.forEach(msg => {
//       const prefix = msg.role === 'user' ? 'User:' : 'AI:';
//       const parts = msg.content.split(/```(?:\w*\n)?([\s\S]*?)```/g);
//       parts.forEach((part, i) => {
//         const isCode = i % 2 === 1;
//         if (isCode) {
//           const codeLines = doc.splitTextToSize(part.trim(), 180);
//           const boxHeight = codeLines.length * 6 + 4;
//           doc.setFillColor(240, 240, 240);
//           doc.rect(10, y, 190, boxHeight, 'F');
//           doc.setFont('courier', 'normal');
//           doc.setTextColor(0);
//           codeLines.forEach(line => doc.text(line, 12, y += 6));
//           y += 15;
//         } else {
//           const lines = doc.splitTextToSize(`${prefix} ${part.trim()}`, 180);
//           doc.setFont('helvetica', 'normal');
//           doc.setTextColor(20);
//           lines.forEach(line => doc.text(line, 10, y += 7));
//           y += 4;
//         }
//         if (y > 270) { doc.addPage(); y = 15; }
//       });
//       y += 6;
//     });

//     doc.save('chat-history.pdf');
//   };

//   const renderMessage = (msg, i) => (
//     <Box key={i} sx={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 1 }}>
//       <Avatar sx={{ bgcolor: msg.role === 'user' ? '#3949ab' : '#4caf50' }}>{msg.role === 'user' ? 'U' : 'AI'}</Avatar>
//       <Box sx={{ bgcolor: msg.role === 'user' ? '#1e293b' : '#263238', px: 2, py: 1.5, borderRadius: 3, maxWidth: '75%' }}>
//         {msg.role === 'bot'
//           ? msg.content.split(/```(?:\w*\n)?([\s\S]*?)```/g).map((part, index) => index % 2 === 1 ? (
//             <Box key={index} sx={{ position: 'relative', mt: 1 }}>
//               <SyntaxHighlighter language="javascript" style={oneDark} customStyle={{ backgroundColor: '#000', borderRadius: 10, fontSize: '0.85rem', padding: '1em' }}>{part}</SyntaxHighlighter>
//               <Tooltip title={copiedIndex === index ? 'Copied!' : 'Copy code'}>
//                 <IconButton size="small" sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'white', color: 'black' }} onClick={() => handleCopy(part, index)}>
//                   <ContentCopyIcon fontSize="small" />
//                 </IconButton>
//               </Tooltip>
//             </Box>
//           ) : <Typography key={index} sx={{ whiteSpace: 'pre-wrap' }}>{part.trim()}</Typography>)
//           : <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
//         }
//       </Box>
//     </Box>
//   );

//   return (
//     <Box sx={{ width: '100vw', height: '100vh', bgcolor: '#0f1117', color: 'white', display: 'flex', flexDirection: 'column' }}>
//       <Box sx={{ px: 2, mb: 1.5, py: 1.5, bgcolor: '#181c23', textAlign: 'center' }}>
//         <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: '3px', color: '#39FF14' }}> {`██████╗ ██████╗  █████╗ ███████╗ █████╗ ██████╗       ██████╗  ██████╗ ████████╗
// // ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗      ██╔══██╗██╔═══██╗╚══██╔══╝
// // ██████╔╝██████╔╝███████║███████╗███████║██║  ██║█████╗██████╔╝██║   ██║   ██║
// // ██╔═══╝ ██╔══██╗██╔══██║╚════██║██╔══██║██║  ██║╚════╝██╔══██╗██║   ██║   ██║
// // ██║     ██║  ██║██║  ██║███████║██║  ██║██████╔╝      ██████╔╝╚██████╔╝   ██║
// // ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝       ╚═════╝  ╚═════╝    ╚═╝`}</Typography>
//       </Box>

//       <Box ref={containerRef} sx={{ flex: 1, overflowY: 'auto', px: 2, py: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
//         {messages.length === 0 && !typingEffect ? (
//           <Box sx={{ flex: 1, minHeight: '96.5%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6, textAlign: 'center', px: 2 }}>
//             <Lottie animationData={chatBotAnimation} loop style={{ width: isSmallScreen ? '75%' : '30%' }} />
//             <Typography variant="h6" sx={{ color: '#bbb' }}>Hello! I'm your AI assistant.</Typography>
//             <Typography variant="body2" sx={{ color: '#888' }}>Ask anything and I’ll try my best to help you.</Typography>
//           </Box>
//         ) : (
//           <>
//             {messages.map(renderMessage)}
//             {typingEffect && (
//               <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
//                 <Avatar sx={{ bgcolor: '#4caf50' }}>AI</Avatar>
//                 <Box sx={{ bgcolor: '#263238', px: 2, py: 1.5, borderRadius: 3, maxWidth: '75%', fontStyle: 'italic' }}>
//                   {typingEffect}<span className="typing-dot">|</span>
//                 </Box>
//               </Box>
//             )}
//           </>
//         )}
//         <div ref={messagesEndRef} />
//       </Box>

//       <Paper elevation={6} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderTop: '1px solid #444', bgcolor: '#181c23' }}>
//         <TextField
//           multiline maxRows={4} placeholder="Ask me anything..." value={input}
//           onChange={(e) => setInput(e.target.value)}
//           sx={{ width: isSmallScreen ? '100%' : '40%', '& .MuiInputBase-root': { color: 'white', bgcolor: '#1e1e2f', borderRadius: 2, px: 2 } }}
//           onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
//         />
//         {typingIntervalId ? (
//           <Tooltip title="Stop Response"><IconButton onClick={stopReply}><StopIcon color="error" /></IconButton></Tooltip>
//         ) : (
//           <IconButton onClick={handleSend} disabled={loading} sx={{ bgcolor: '#3949ab', color: 'white' }}>
//             {loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <SendIcon />}
//           </IconButton>
//         )}
//         {messages.length > 0 && (
//           <Tooltip title="Download chat as PDF">
//             <IconButton onClick={exportChatToPDF} sx={{ bgcolor: '#181c23', color: 'white' }}><DownloadIcon /></IconButton>
//           </Tooltip>
//         )}
//       </Paper>

//       <Fab size="small" sx={{ position: 'fixed', bottom: isSmallScreen ? 60 : 70, right: 24, bgcolor: '#0d0d21ff', color: 'white' }} onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}>
//         <KeyboardArrowDownIcon />
//       </Fab>
//     </Box>
//   );
// }
