import React from 'react';
import { Grid, Typography } from '@mui/material';
import ProductCard from './ProductCard';

export default function ProductSelector({ configs, onSelect }) {
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Select a Product
      </Typography>
      <Grid container spacing={3}>
        {(configs || []).map(config => (
          <Grid item xs={12} sm={6} md={4} key={config.id}>
            <ProductCard 
              config={config}
              onSelect={onSelect}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
