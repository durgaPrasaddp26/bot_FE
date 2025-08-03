// // import { useState } from 'react';
// // import axios from 'axios';
// // import {
// //   Container, Typography, TextField, Button, Box, Paper,
// // } from '@mui/material';

// // export default function App() {
// //   const [input, setInput] = useState('');
// //   const [messages, setMessages] = useState([]);

// //   const handleSend = async () => {
// //     if (!input.trim()) return;

// //     const userMsg = { role: 'user', content: input };
// //     setMessages((prev) => [...prev, userMsg]);

// //     try {
// //       const res = await axios.post('http://localhost:5000/api/chat', { message: input });
// //       const botMsg = { role: 'bot', content: res.data.reply };
// //       setMessages((prev) => [...prev, botMsg]);
// //     } catch (err) {
// //       console.error(err);
// //       alert('Error connecting to server');
// //     }

// //     setInput('');
// //   };

// //   return (
// //     <Container maxWidth="sm" sx={{ mt: 4 }}>
// //       <Typography variant="h4" gutterBottom align="center">
// //         AI Chat Widget
// //       </Typography>
// //       <Paper elevation={3} sx={{ height: 400, overflowY: 'auto', p: 2, mb: 2 }}>
// //         {messages.map((msg, i) => (
// //           <Box key={i} display="flex" justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'} mb={1}>
// //             <Box
// //               p={1.5}
// //               bgcolor={msg.role === 'user' ? '#1976d2' : '#2e7d32'}
// //               color="white"
// //               borderRadius={2}
// //               maxWidth="75%"
// //             >
// //               {msg.content}
// //             </Box>
// //           </Box>
// //         ))}
// //       </Paper>
// //       <Box display="flex">
// //         <TextField
// //           fullWidth
// //           label="Type a message"
// //           variant="outlined"
// //           value={input}
// //           onChange={(e) => setInput(e.target.value)}
// //         />
// //         <Button variant="contained" color="primary" sx={{ ml: 1 }} onClick={handleSend}>
// //           Send
// //         </Button>
// //       </Box>
// //     </Container>
// //   );
// // }


// import { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import {
//   Container,
//   Typography,
//   TextField,
//   Button,
//   Box,
//   Paper,
//   CircularProgress,
// } from '@mui/material';

// export default function App() {
//   const [input, setInput] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     const userMsg = { role: 'user', content: input };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput('');
//     setLoading(true);

//     try {
//       const res = await axios.post('http://localhost:5000/api/chat', {
//         message: input,
//       });

//       const botMsg = { role: 'bot', content: res.data.reply };
//       setMessages((prev) => [...prev, botMsg]);
//     } catch (err) {
//       console.error('Error:', err);
//       const errorMsg = {
//         role: 'bot',
//         content: '❌ Failed to fetch response from AI server.',
//       };
//       setMessages((prev) => [...prev, errorMsg]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   return (
//     <Container maxWidth="sm" sx={{ mt: 4 }}>
//       <Typography variant="h4" gutterBottom align="center">
//         🔮 AI Chat Assistant
//       </Typography>

//       <Paper elevation={3} sx={{ height: 420, overflowY: 'auto', p: 2, mb: 2 }}>
//         {messages.map((msg, i) => (
//           <Box
//             key={i}
//             display="flex"
//             justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'}
//             mb={1}
//           >
//             <Box
//               p={1.5}
//               bgcolor={msg.role === 'user' ? '#1976d2' : '#388e3c'}
//               color="white"
//               borderRadius={2}
//               maxWidth="75%"
//             >
//               {msg.content}
//             </Box>
//           </Box>
//         ))}
//         <div ref={messagesEndRef} />
//       </Paper>

//       <Box display="flex" gap={1}>
//         <TextField
//           fullWidth
//           label="Ask something..."
//           variant="outlined"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter') handleSend();
//           }}
//         />
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleSend}
//           disabled={loading}
//         >
//           {loading ? <CircularProgress size={24} color="inherit" /> : 'Send'}
//         </Button>
//       </Box>
//     </Container>
//   );
// }

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingEffect, setTypingEffect] = useState('');
  const messagesEndRef = useRef(null);

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
      });

      const botReply = res.data.reply;
      let index = 0;

      const typingInterval = setInterval(() => {
        if (index < botReply.length) {
          setTypingEffect((prev) => prev + botReply[index]);
          index++;
        } else {
          clearInterval(typingInterval);
          setMessages((prev) => [...prev, { role: 'bot', content: botReply }]);
          setTypingEffect('');
        }
      }, 15);
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

  const isCode = (text) => {
    return /```[\s\S]*?```/.test(text);
  };

  const extractCode = (text) => {
    const match = text.match(/```(?:\w*\n)?([\s\S]*?)```/);
    return match ? match[1] : text;
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        🔮 AI Chat Assistant
      </Typography>

      <Paper elevation={3} sx={{ height: '60vh', overflowY: 'auto', p: 2, mb: 2, bgcolor: '#fafafa' }}>
        {messages.map((msg, i) => (
          <Box
            key={i}
            display="flex"
            justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'}
            mb={1}
          >
            <Box
              p={1.5}
              bgcolor={msg.role === 'user' ? '#1976d2' : '#e0f7fa'}
              color={msg.role === 'user' ? 'white' : 'black'}
              borderRadius={2}
              maxWidth="80%"
              whiteSpace="pre-wrap"
              sx={{ wordBreak: 'break-word', position: 'relative' }}
            >
              {msg.role === 'bot' && isCode(msg.content) ? (
                <Box position="relative">
                  <SyntaxHighlighter
                    language="javascript"
                    style={oneDark}
                    customStyle={{
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      marginBottom: 0,
                      padding: '1em',
                    }}
                  >
                    {extractCode(msg.content)}
                  </SyntaxHighlighter>
                  <Tooltip title="Copy code">
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'white' }}
                      onClick={() => handleCopy(extractCode(msg.content))}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                msg.content
              )}
            </Box>
          </Box>
        ))}

        {/* Typing animation */}
        {typingEffect && (
          <Box display="flex" justifyContent="flex-start" mb={1}>
            <Box
              p={1.5}
              bgcolor="#e0f7fa"
              color="black"
              borderRadius={2}
              maxWidth="80%"
              sx={{ wordBreak: 'break-word', fontStyle: 'italic' }}
            >
              {typingEffect}
              <span className="typing-dot">|</span>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          label="Ask something..."
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={loading}
          sx={{ minWidth: 90 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Send'}
        </Button>
      </Box>
    </Container>
  );
}
