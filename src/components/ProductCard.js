import React from 'react';
import { Card, CardContent, Typography, Button, Stack, Chip } from '@mui/material';

export default function ProductCard({ config, onSelect }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {config.name}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {config.fields.filter(f => f.isMandatory).length > 0 && (
            <Chip 
              label={`${config.fields.filter(f => f.isMandatory).length} required fields`}
              color="primary"
              size="small"
            />
          )}
        </Stack>
        <Typography variant="body2" paragraph>
          Submit your information to generate a proof of purchase.
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={() => onSelect(config)}
        >
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}
