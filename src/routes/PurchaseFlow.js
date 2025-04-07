import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Stepper, Step, StepLabel, Paper } from '@mui/material';
import ProductSelector from '../components/ProductSelector';
import EnhancedDynamicForm from '../components/EnhancedDynamicForm';
import SummaryReview from '../components/SummaryReview';

const steps = ['Select Product', 'Enter Details', 'Review'];

export default function PurchaseFlow({ configs }) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [formData, setFormData] = useState({});

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={2} sx={{ p: 3 }}>
        {activeStep === 0 && (
            <ProductSelector 
              configs={configs}
              onSelect={config => {
                setSelectedConfig(config);
                handleNext();
              }}
            />
        )}
        {activeStep === 1 && (
            <EnhancedDynamicForm 
              config={selectedConfig}
              onBack={handleBack}
              onSubmit={(data) => {
                setFormData(data);
                handleNext();
              }}
            />
        )}
        {activeStep === 2 && (
            <SummaryReview 
              config={selectedConfig}
              formData={formData}
              onBack={handleBack}
              onSubmit={() => {
                // Submit logic will be added here
                handleNext();
              }}
            />
        )}
      </Paper>
    </Container>
  );
}
