import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField, Button, Stack, Typography
} from '@mui/material';

export default function EndUserForm() {
  const { configId } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [submissions, setSubmissions] = useState([]);

  // 1) Load the config from localStorage
  useEffect(() => {
    const storedConfigs = localStorage.getItem('myConfigs');
    if (storedConfigs) {
      const parsed = JSON.parse(storedConfigs);
      const found = parsed.find((c) => c.id === configId);
      if (found) {
        setConfig(found);
        // Initialize formValues for visible fields
        const initialValues = {};
        found.fields.forEach((f) => {
          if (!f.defaultValue) {
            initialValues[f.fieldName] = '';
          }
        });
        setFormValues(initialValues);
      }
    }
    // Also load existing submissions
    const storedSubmissions = localStorage.getItem('mySubmissions');
    if (storedSubmissions) {
      setSubmissions(JSON.parse(storedSubmissions));
    }
  }, [configId]);

  // 2) Update localStorage with new submissions
  const saveSubmissions = (newSubs) => {
    setSubmissions(newSubs);
    localStorage.setItem('mySubmissions', JSON.stringify(newSubs));
  };

  // 3) Handle changes
  const handleChange = (fieldName, value) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // 4) Validate mandatory fields, store submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!config) return;

    // Check mandatory fields
    for (const f of config.fields) {
      if (f.isMandatory && !f.defaultValue) {
        // If it's mandatory + no default, we expect user input
        const userValue = formValues[f.fieldName];
        if (!userValue || userValue.trim() === '') {
          alert(`Field "${f.fieldLabel || f.fieldName}" is mandatory.`);
          return;
        }
      }
    }

    // Build submission object: { configId, data: {...} }
    let submissionData = {};
    config.fields.forEach((f) => {
      // If the field has a default, use it
      if (f.defaultValue) {
        submissionData[f.fieldName] = f.defaultValue;
      } else {
        // Otherwise, use user input
        submissionData[f.fieldName] = formValues[f.fieldName] || '';
      }
    });

    const newSubmission = {
      submissionId: Date.now().toString(),
      configId: configId,
      timestamp: new Date().toISOString(),
      data: submissionData
    };

    const newSubs = [...submissions, newSubmission];
    saveSubmissions(newSubs);

    alert('Submission saved!');

    // Optionally go somewhere else
    navigate('/');
  };

  if (!config) {
    return <Typography>Configuration not found.</Typography>;
  }

  // If a field has a default value, we won't show it to the user
  // per your requirement. Only show user inputs for fields that don't have defaults
  const visibleFields = config.fields.filter((f) => !f.defaultValue);

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Typography variant="h5">{config.name}</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {visibleFields.map((f) => (
            <div key={f.fieldName}>
              <Typography sx={{ fontWeight: 600 }}>
                {f.fieldLabel || f.fieldName}
                {f.isMandatory ? ' *' : ''}
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={formValues[f.fieldName] || ''}
                onChange={(e) => handleChange(f.fieldName, e.target.value)}
              />
            </div>
          ))}

          <Button variant="contained" type="submit">
            Submit
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
