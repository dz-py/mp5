'use client';

import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Paper,
  Snackbar,
} from '@mui/material';

export default function Home() {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShortenedUrl('');

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, alias }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setSuccess('URL shortened successfully!');
      setShortenedUrl(data.shortenedUrl);
    } catch (error) {
      setError('An error occurred while shortening the URL');
    }
  };

  const handleCopy = () => {
    try {
      // Create a temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = shortenedUrl;
      
      // Make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // Focus and select the text
      textArea.focus();
      textArea.select();
      
      // Execute copy command
      const successful = document.execCommand('copy');
      
      // Remove the temporary element
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopySuccess(true);
      } else {
        setError('Failed to copy to clipboard');
      }
    } catch (error) {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          URL Shortener
        </Typography>
        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="URL"
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Custom Alias (optional)"
              variant="outlined"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Shorten URL
            </Button>
          </form>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          {shortenedUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Your shortened URL:
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography
                  sx={{
                    wordBreak: 'break-all',
                    mr: 2,
                  }}
                >
                  {shortenedUrl}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCopy}
                >
                  Copy
                </Button>
              </Paper>
            </Box>
          )}
        </Paper>
      </Box>
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="URL copied to clipboard!"
      />
    </Container>
  );
}
