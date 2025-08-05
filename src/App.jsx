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
//   IconButton,
//   Tooltip,
// } from '@mui/material';
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// import StopIcon from '@mui/icons-material/Stop';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// export default function App() {
//   const [input, setInput] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [typingEffect, setTypingEffect] = useState('');
//   const [typingIntervalId, setTypingIntervalId] = useState(null);
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, typingEffect]);

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     const userMsg = { role: 'user', content: input };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput('');
//     setTypingEffect('');
//     setLoading(true);

//     try {
//       const res = await axios.post('http://localhost:5000/api/chat', {
//         message: input,
//       });

//       const botReply = res.data.reply;
//       if (!botReply || botReply.trim() === '') {
//         setMessages((prev) => [
//           ...prev,
//           { role: 'bot', content: "🤖 I'm sorry, I don't have a response for that. Try asking something else!" },
//         ]);
//         setLoading(false);
//         return;
//       }
//       let index = 0;
//       const intervalId = setInterval(() => {
//         if (index < botReply.length) {
//           setTypingEffect((prev) => prev + botReply[index]);
//           index++;
//         } else {
//           clearInterval(intervalId);
//           setTypingIntervalId(null);
//           setMessages((prev) => [...prev, { role: 'bot', content: botReply }]);
//           setTypingEffect('');
//         }
//       }, 15);
//       setTypingIntervalId(intervalId);
//     } catch (err) {
//       console.error('Error:', err);
//       setMessages((prev) => [
//         ...prev,
//         { role: 'bot', content: '❌ Failed to fetch response from AI server.' },
//       ]);
//       setTypingEffect('');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const stopReply = () => {
//     if (typingIntervalId) {
//       clearInterval(typingIntervalId);
//       setTypingIntervalId(null);
//       setMessages((prev) => [...prev, { role: 'bot', content: typingEffect + '... (stopped)' }]);
//       setTypingEffect('');
//       setLoading(false);
//     }
//   };

//   const handleCopy = (code) => navigator.clipboard.writeText(code);

//   return (
//     <Container
//       maxWidth="sm" // Max width = 600px (default for "sm")
//       disableGutters
//       sx={{
//         height: '100vh',
//         display: 'flex',
//         flexDirection: 'column',
//         backgroundColor: '#f0f0f0',
//         margin: '0 auto', // Center horizontally
//         padding: 2,
//         overflow: 'hidden', // Prevents accidental overflow
//       }}
//     >

//       {/* Header */}
//       <Box sx={{ p: 2, bgcolor: '#01070d', color: 'white', textAlign: 'center' }}>
//         <Typography variant="h6">🔮 Chat Assistant</Typography>
//       </Box>

//       {/* Message List */}
//       <Box
//         sx={{
//           flex: 1,
//           overflowY: 'auto',
//           px: 1,
//           py: 2,
//           display: 'flex',
//           flexDirection: 'column',
//           gap: 1.5,
//         }}
//       >
//         {messages.map((msg, i) => (
//           <Box
//             key={i}
//             display="flex"
//             justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'}
//           >
//             <Box
//               sx={{
//                 maxWidth: '70%',
//                 backgroundColor: msg.role === 'user' ? '#01070dff' : '#e0f7fa',
//                 color: msg.role === 'user' ? '#ffffff' : '#000000',
//                 padding: '10px 14px',
//                 borderRadius: '12px',
//                 fontSize: '0.95rem',
//                 overflowWrap: 'break-word',
//                 wordBreak: 'break-word',
//                 whiteSpace: 'pre-wrap',
//                 overflowX: 'auto',
//                 display: 'inline-block',
//               }}
//             >
//               {msg.role === 'bot' ? (
//                 msg.content.split(/```(?:\w*\n)?([\s\S]*?)```/g).map((part, index) => {
//                   const isCodeBlock = index % 2 === 1;
//                   return isCodeBlock ? (
//                     <Box
//                       key={index}
//                       sx={{
//                         position: 'relative',
//                         mt: 1,
//                         mb: 1,
//                         overflowX: 'auto',
//                         borderRadius: '8px',
//                       }}
//                     >
//                       <SyntaxHighlighter
//                         language="javascript"
//                         style={oneDark}
//                         customStyle={{
//                           borderRadius: '10px',
//                           fontSize: '0.85rem',
//                           padding: '1em',
//                           margin: 0,
//                           overflowX: 'auto',
//                           wordBreak: 'break-word',
//                         }}
//                       >
//                         {part}
//                       </SyntaxHighlighter>
//                       <Tooltip title="Copy code">
//                         <IconButton
//                           size="small"
//                           sx={{
//                             position: 'absolute',
//                             top: 4,
//                             right: 4,
//                             bgcolor: 'white',
//                           }}
//                           onClick={() => handleCopy(part)}
//                         >
//                           <ContentCopyIcon fontSize="small" />
//                         </IconButton>
//                       </Tooltip>
//                     </Box>
//                   ) : (
//                     <Typography key={index} sx={{ whiteSpace: 'pre-wrap' }}>
//                       {part.trim()}
//                     </Typography>
//                   );
//                 })
//               ) : (
//                 <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
//               )}
//             </Box>
//           </Box>
//         ))}

//         {/* Typing effect */}
//         {typingEffect && (
//           <Box display="flex" justifyContent="flex-start">
//             <Box
//               sx={{
//                 bgcolor: '#e0f7fa',
//                 px: 2,
//                 py: 1.2,
//                 borderRadius: 3,
//                 maxWidth: '80%',
//                 fontStyle: 'italic',
//                 whiteSpace: 'pre-wrap',
//                 wordBreak: 'break-word',
//               }}
//             >
//               {typingEffect}
//               <span className="typing-dot">|</span>
//             </Box>
//           </Box>
//         )}

//         <div ref={messagesEndRef} />
//       </Box>

//       {/* Input Area */}
//       <Paper
//         elevation={3}
//         square
//         sx={{
//           px: 2,
//           py: 1,
//           borderTop: '1px solid #ccc',
//           display: 'flex',
//           alignItems: 'center',
//           gap: 1,
//         }}
//       >
//         <TextField
//           fullWidth
//           multiline
//           maxRows={4}
//           placeholder="Type a message..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter' && !e.shiftKey) {
//               e.preventDefault();
//               handleSend();
//             }
//           }}
//         />
//         <Button variant="contained" onClick={handleSend} disabled={loading}>
//           {loading ? <CircularProgress size={20} color="inherit" /> : 'Send'}
//         </Button>
//         {loading && (
//           <Tooltip title="Stop response">
//             <IconButton onClick={stopReply}>
//               <StopIcon color="error" />
//             </IconButton>
//           </Tooltip>
//         )}
//       </Paper>
//     </Container>
//   );
// }

// App.js or ChatApp.js
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

export default function ChatApp() {
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

    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
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
      <Box sx={{ px: 2, py: 1.5, bgcolor: '#181c23', textAlign: 'center' }}>
        {/* <Typography variant="h6">
██████╗ ██████╗  █████╗ ███████╗ █████╗ ██████╗       ██████╗  ██████╗ ████████╗
██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗      ██╔══██╗██╔═══██╗╚══██╔══╝
██████╔╝██████╔╝███████║███████╗███████║██║  ██║█████╗██████╔╝██║   ██║   ██║   
██╔═══╝ ██╔══██╗██╔══██║╚════██║██╔══██║██║  ██║╚════╝██╔══██╗██║   ██║   ██║   
██║     ██║  ██║██║  ██║███████║██║  ██║██████╔╝      ██████╔╝╚██████╔╝   ██║   
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝       ╚═════╝  ╚═════╝    ╚═╝   
                                                                                
</Typography> */}
        <Typography
          component="pre"
         sx={{
    fontFamily: 'monospace',
    whiteSpace: 'pre',
    fontSize: '3px',
    lineHeight: 1.2,
    textAlign: 'center',
    color: '#39FF14', // neon green
    
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
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
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
                      {/* <SyntaxHighlighter language="javascript" style={oneDark}>
                        {part}
                      </SyntaxHighlighter> */}
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
                            boredr: "none",
                            '&:hover': { bgcolor: 'black', color: 'white', border: "none" },
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

        {/* <IconButton
          onClick={handleSend}
          disabled={loading}
          sx={{ bgcolor: '#3949ab', color: 'white', '&:hover': { bgcolor: '#303f9f' } }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <SendIcon />}
          
        </IconButton> */}
        {/* Send / Stop Buttons */}
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
