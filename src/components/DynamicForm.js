import React, { useState, useEffect } from 'react';
import {
  TextField, Checkbox, FormControlLabel, Button, Stack, Paper, Typography
} from '@mui/material';

export default function DynamicForm({ fields, onFieldsChange }) {
  const [localFields, setLocalFields] = useState([]);

  useEffect(() => {
    setLocalFields(fields || []);
  }, [fields]);

  // Overwrite fields from JSON file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const newConfig = Object.keys(parsed).map((key) => ({
          fieldName: key,  
          fieldLabel: key,
          defaultValue: '',
          isMandatory: false,
          isOptional: true,
        }));
        setLocalFields(newConfig);
        onFieldsChange(newConfig);
      } catch (err) {
        console.error('Invalid JSON', err);
      }
    };
    reader.readAsText(file);
  };

  // Add a blank field manually
  const handleAddField = () => {
    const newField = {
      fieldName: `field_${Date.now()}`,  
      fieldLabel: '',
      defaultValue: '',
      isMandatory: false,
      isOptional: true,
    };
    const updated = [...localFields, newField];
    setLocalFields(updated);
    onFieldsChange(updated);
  };

  // Remove a field
  const handleRemoveField = (index) => {
    const updated = [...localFields];
    updated.splice(index, 1);
    setLocalFields(updated);
    onFieldsChange(updated);
  };

  const updateField = (index, prop, value) => {
    const updated = [...localFields];
    updated[index][prop] = value;
    setLocalFields(updated);
    onFieldsChange(updated);
  };

  const toggleCheckbox = (index, prop) => {
    const updated = [...localFields];
    updated[index][prop] = !updated[index][prop];
    // If you check "Mandatory", uncheck "Optional", and vice versa
    if (prop === 'isMandatory') {
      updated[index].isOptional = !updated[index].isMandatory;
    }
    if (prop === 'isOptional') {
      updated[index].isMandatory = !updated[index].isOptional;
    }
    setLocalFields(updated);
    onFieldsChange(updated);
  };

  return (
    <Stack spacing={2}>
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

      <Button variant="contained" onClick={handleAddField}>
        Add Field Manually
      </Button>

      {localFields.length > 0 && (
        <Stack spacing={2}>
          {localFields.map((field, i) => (
            <Paper key={i} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {field.fieldName}
                </Typography>
                <Button variant="text" color="error" onClick={() => handleRemoveField(i)}>
                  Remove
                </Button>
              </Stack>

              <TextField
                label="Field Label"
                variant="outlined"
                size="small"
                fullWidth
                margin="dense"
                value={field.fieldLabel}
                onChange={(e) => updateField(i, 'fieldLabel', e.target.value)}
              />

              <TextField
                label="Default Value"
                variant="outlined"
                size="small"
                fullWidth
                margin="dense"
                value={field.defaultValue}
                onChange={(e) => updateField(i, 'defaultValue', e.target.value)}
              />

              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.isMandatory}
                      onChange={() => toggleCheckbox(i, 'isMandatory')}
                    />
                  }
                  label="Mandatory"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.isOptional}
                      onChange={() => toggleCheckbox(i, 'isOptional')}
                    />
                  }
                  label="Optional"
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
