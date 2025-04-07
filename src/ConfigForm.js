import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Stack, Paper, Typography
} from '@mui/material';

export default function ConfigForm({ configId, configs, onSave, onCancel }) {
  // If editing, find the existing config in memory
  const existingConfig = configs.find(cfg => cfg.id === configId);

  const [name, setName] = useState('');
  const [fields, setFields] = useState([]);
  const [filenameTemplate, setFilenameTemplate] = useState('CONFIG');

  useEffect(() => {
    if (existingConfig) {
      setName(existingConfig.name);
      setFields(existingConfig.fields);
    } else {
      setName('');
      setFields([]);
    }
  }, [existingConfig]);

  // Helper: parse out text from <data["someKey"]> or <data['someKey']>
  function extractMappingKey(str) {
    // Regex to match exactly <data[ ... ]> with single or double quotes
    const regex = /^<data\[(["'])(.*?)\1\]>$/;
    const match = str.match(regex);
    if (match) {
      return match[2]; // the text inside the quotes
    }
    return "";
  }

  /**
   * Recursively find all key-value pairs in an object 
   * whose value is a string starting with "<data[".
   * 
   * We'll parse out the mappingKey from that string
   * and store it in each field.
   * 
   * If it's just an array item with <data[...]>, we skip 
   * because we only want key-value pairs.
   */
  function findDataFields(obj, parentPath = '') {
    let results = [];

    if (Array.isArray(obj)) {
      // For arrays, we iterate over each item
      obj.forEach((item, i) => {
        const newPath = `${parentPath}[${i}]`;
        results.push(...findDataFields(item, newPath));
      });
    } else if (obj && typeof obj === 'object') {
      // For objects, iterate each property
      for (const key in obj) {
        const value = obj[key];
        const newPath = parentPath ? `${parentPath}.${key}` : key;

        if (value && typeof value === 'object') {
          // Recurse deeper
          results.push(...findDataFields(value, newPath));
        } else if (typeof value === 'string' && value.startsWith('<data[')) {
          // This is a key-value pair with a data string
          const mk = extractMappingKey(value); // e.g. "field20"
          results.push({
            fieldName: newPath,    // e.g. "details.inner.evenDeeper"
            fieldLabel: newPath,   // up to you, can refine
            defaultValue: '',
            isMandatory: false,
            isOptional: true,
            mappingKey: mk        // <--- new property
          });
        }
      }
    }

    return results;
  }

  // 1) Read a JSON file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);

        // Recursively find all key-value pairs whose value is <data[...]>
        const newFields = findDataFields(parsed);
        setFields(newFields);
      } catch (err) {
        console.error('Invalid JSON file:', err);
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  // Add a field manually
  const handleAddField = () => {
    setFields(prev => [
      ...prev,
      {
        fieldName: `field_${Date.now()}`,
        fieldLabel: '',
        defaultValue: '',
        isMandatory: false,
        isOptional: true,
        mappingKey: '' // empty since user is manually adding
      }
    ]);
  };

  // Modify a field
  const handleFieldChange = (idx, prop, value) => {
    const updated = [...fields];
    updated[idx][prop] = value;

    // If toggling mandatory => uncheck optional
    if (prop === 'isMandatory') {
      updated[idx].isOptional = !value;
    }
    if (prop === 'isOptional') {
      updated[idx].isMandatory = !value;
    }
    setFields(updated);
  };

  // Remove a field
  const handleRemoveField = (idx) => {
    const updated = [...fields];
    updated.splice(idx, 1);
    setFields(updated);
  };

  // Save
  const handleSaveClick = () => {
    const finalConfig = existingConfig
      ? { ...existingConfig, name, fields, filenameTemplate }
      : { name, fields, filenameTemplate };
    onSave(finalConfig);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {existingConfig ? 'Edit' : 'Create'} Configuration
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          label="Configuration Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Filename Template"
          variant="outlined"
          value={filenameTemplate}
          onChange={(e) => setFilenameTemplate(e.target.value)}
          fullWidth
          helperText="Example: BDK_RSV (timestamp will be added automatically)"
          sx={{ mb: 2 }}
        />

        {/* FILE UPLOAD */}
        <div>
          <Typography variant="subtitle1" gutterBottom>
            Upload JSON (optional)
          </Typography>
          <Button variant="outlined" component="label">
            Choose File
            <input
              type="file"
              accept=".json"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
        </div>

        {/* Add Field Manually */}
        <Button variant="contained" onClick={handleAddField}>
          Add Field
        </Button>

        {fields.map((field, idx) => (
          <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>

                {/* New: read-only MAPPING KEY */}
                <TextField
                label="Mapping Key"
                variant="outlined"
                size="small"
                onChange={(e) => handleFieldChange(idx, 'mappingKey', e.target.value)}
                value={field.mappingKey || ''}
              />
              
              <TextField
                label="Field Name"
                variant="outlined"
                size="small"
                value={field.fieldName}
                disabled
                onChange={(e) => handleFieldChange(idx, 'fieldName', e.target.value)}
              />

              <TextField
                label="Field Label"
                variant="outlined"
                size="small"
                value={field.fieldLabel}
                onChange={(e) => handleFieldChange(idx, 'fieldLabel', e.target.value)}
              />

              <TextField
                label="Default Value"
                variant="outlined"
                size="small"
                value={field.defaultValue}
                onChange={(e) => handleFieldChange(idx, 'defaultValue', e.target.value)}
              />

              <Stack direction="row" spacing={2}>
                <label>
                  <input
                    type="checkbox"
                    checked={field.isMandatory}
                    onChange={(e) =>
                      handleFieldChange(idx, 'isMandatory', e.target.checked)
                    }
                  />
                  {' '}Mandatory
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={field.isOptional}
                    onChange={(e) =>
                      handleFieldChange(idx, 'isOptional', e.target.checked)
                    }
                  />
                  {' '}Optional
                </label>
              </Stack>

              <Button 
                variant="text" 
                color="error" 
                onClick={() => handleRemoveField(idx)}
              >
                Remove Field
              </Button>
            </Stack>
          </Paper>
        ))}

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleSaveClick}>
            Save
          </Button>
          <Button variant="outlined" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
