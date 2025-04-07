import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Typography, Stack } from '@mui/material';
import { generateCSV } from '../utils/csvUtils';

export default function Submissions() {
  const { configId } = useParams();
  const [config, setConfig] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    // Load config
    const storedConfigs = localStorage.getItem('myConfigs');
    if (storedConfigs) {
      const parsed = JSON.parse(storedConfigs);
      const found = parsed.find((c) => c.id === configId);
      if (found) setConfig(found);
    }
    // Load submissions
    const storedSubs = localStorage.getItem('mySubmissions');
    if (storedSubs) {
      const subs = JSON.parse(storedSubs);
      setSubmissions(subs);
    }
  }, [configId]);

  // Filter relevant submissions
  useEffect(() => {
    if (submissions && configId) {
      setFiltered(submissions.filter(s => s.configId === configId));
    }
  }, [submissions, configId]);

  const handleExportCSV = () => {
    if (!config) return;
    if (!filtered.length) {
      alert('No submissions to export.');
      return;
    }

    // We have an array of submission objects: { data: {fieldName: value, ...}, ... }
    // Let’s flatten them for CSV
    const csvContent = generateCSV(config, filtered);
    // Trigger file download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${config.name}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!config) {
    return <Typography variant="h6">Config not found.</Typography>;
  }

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Submissions for {config.name}
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        {filtered.length === 0 ? (
          <Typography>No submissions yet.</Typography>
        ) : (
          filtered.map((sub) => (
            <div key={sub.submissionId} style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
              <Typography variant="body2">
                Submission ID: {sub.submissionId}
              </Typography>
              <Typography variant="body2">
                Timestamp: {sub.timestamp}
              </Typography>
              <pre style={{ background: '#eee', padding: '0.5rem' }}>
{JSON.stringify(sub.data, null, 2)}
              </pre>
            </div>
          ))
        )}
      </Stack>

      <div style={{ marginTop: '2rem' }}>
        <Button variant="contained" onClick={handleExportCSV}>
          Export CSV
        </Button>
      </div>
    </div>
  );
}
