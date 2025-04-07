import React from 'react';
import { Button, Stack, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

export default function SummaryReview({ config, formData, onBack, onSubmit }) {
  return (
    <Stack spacing={3}>
      <Typography variant="h6" gutterBottom>
        Review Your {config.name} Submission
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <List>
          {config.fields.map(field => (
            <ListItem key={field.mappingKey}>
              <ListItemText 
                primary={field.fieldLabel || field.mappingKey}
                secondary={formData[field.mappingKey] || 'Not provided'}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onBack}>Back</Button>
        <Button 
          variant="contained" 
          color="success"
              onClick={() => {
                // Submit data to backend
                fetch(`http://localhost:3001/api/submit/${config.id}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(formData)
                })
                .then(response => {
                  if (!response.ok) throw new Error('Submission failed');
                  return response.blob();
                })
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  const now = new Date();
                  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
                  a.download = `${config.filenameTemplate || config.id}_${timestamp}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  onSubmit();
                })
                .catch(err => {
                  console.error('Submission error:', err);
                  alert('Failed to submit data');
                });
              }}
        >
          Submit and Download CSV
        </Button>
      </Stack>
    </Stack>
  );
}
