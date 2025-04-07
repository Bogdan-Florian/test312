import React from 'react';
import { Button, Stack, TextField, Grid, Typography } from '@mui/material';

export default function EnhancedDynamicForm({ config, onBack, onSubmit }) {
  const [formData, setFormData] = React.useState({});

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6" gutterBottom>
        {config.name} Details
      </Typography>
      
      <Grid container spacing={2}>
        {config.fields.map(field => (
          <Grid item xs={12} sm={6} key={field.mappingKey}>
            <TextField
              fullWidth
              label={field.fieldLabel || field.mappingKey}
              value={formData[field.mappingKey] || ''}
              onChange={(e) => handleChange(field.mappingKey, e.target.value)}
              required={field.isMandatory}
            />
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onBack}>Back</Button>
        <Button 
          variant="contained" 
          onClick={onSubmit}
          disabled={!config.fields.every(f => 
            !f.isMandatory || formData[f.mappingKey]
          )}
        >
          Continue
        </Button>
      </Stack>
    </Stack>
  );
}
