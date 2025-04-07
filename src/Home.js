import React from 'react';
import { Card, CardContent, Typography, Button, Stack } from '@mui/material';

export default function Home({ configs, onCreateNew, onEditConfig, onDeleteConfig, onPurchaseConfig }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {configs.length > 0 ? (
        <Stack spacing={2}>
          {configs.map(cfg => (
            <Card key={cfg.id} variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {cfg.name || '(No Name)'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  ID: {cfg.id}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  API Endpoint: POST http://localhost:3001/api/submit/{cfg.id}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Required Fields: {cfg.fields.map(f => f.mappingKey).join(', ')}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={() => onEditConfig(cfg.id)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => onDeleteConfig(cfg.id)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outlined" 
                    color="success"
                    onClick={() => {
                      // Generate mock data for all fields
                      const mockData = {};
                      cfg.fields.forEach(field => {
                        if (field.mappingKey) {
                          mockData[field.mappingKey] = field.defaultValue || 
                            `Sample ${field.mappingKey.replace('field', 'Value ')}`;
                        }
                      });
                      
                      // Call submit endpoint to trigger download
                      fetch(`http://localhost:3001/api/submit/${cfg.id}`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(mockData)
                      })
                      .then(response => {
                        if (!response.ok) throw new Error('Download failed');
                        return response.blob();
                      })
                      .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                      const now = new Date();
                      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
                      a.download = `${cfg.filenameTemplate || cfg.id}_${timestamp}.csv`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                      })
                      .catch(err => {
                        console.error('Download error:', err);
                        alert('Failed to download sample CSV');
                      });
                    }}
                  >
                    Download Sample CSV
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Typography variant="h6" gutterBottom>
          No configurations found.
        </Typography>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Button variant="contained" color="primary" onClick={onCreateNew}>
          Create New Configuration
        </Button>
      </div>
    </div>
  );
}
