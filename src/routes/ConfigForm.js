import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TextField, Button, Stack, Paper, Typography
} from '@mui/material';

import DynamicForm from '../components/DynamicForm';

export default function ConfigForm() {
  const navigate = useNavigate();
  const { configId } = useParams();

  const [configs, setConfigs] = useState([]);
  const [name, setName] = useState('');
  const [fields, setFields] = useState([]);
  const [id, setId] = useState(null);

  // On mount, load all configs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('myConfigs');
    if (stored) {
      setConfigs(JSON.parse(stored));
    }
  }, []);

  // If configId != 'new', find the matching config
  useEffect(() => {
    if (configId && configId !== 'new' && configs.length > 0) {
      const existing = configs.find(cfg => cfg.id === configId);
      if (existing) {
        setId(existing.id);
        setName(existing.name);
        setFields(existing.fields);
      }
    }
  }, [configId, configs]);

  const saveConfigs = (newConfigs) => {
    setConfigs(newConfigs);
    localStorage.setItem('myConfigs', JSON.stringify(newConfigs));
  };

  // Called by DynamicForm when fields are updated
  const handleFieldsChange = (updatedFields) => {
    setFields(updatedFields);
  };

  // Save button
  const handleSaveClick = () => {
    let finalConfig;
    if (!id) {
      // creating new
      finalConfig = {
        id: Date.now().toString(), // simple unique ID
        name,
        fields
      };
      saveConfigs([...configs, finalConfig]);
    } else {
      // updating existing
      finalConfig = {
        id,
        name,
        fields
      };
      const updated = configs.map(cfg => (cfg.id === id ? finalConfig : cfg));
      saveConfigs(updated);
    }
    // go back to home
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {configId === 'new' ? 'Create New' : 'Edit'} Configuration
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          label="Configuration Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <DynamicForm fields={fields} onFieldsChange={handleFieldsChange} />
        
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleSaveClick}>
            Save
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
