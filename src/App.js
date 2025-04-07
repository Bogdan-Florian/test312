  import React, { useEffect, useState } from 'react';
  import { createTheme, ThemeProvider } from '@mui/material/styles';
  import Container from '@mui/material/Container';
  import Box from '@mui/material/Box';
import Home from './Home';
import ConfigForm from './ConfigForm';
import PurchaseFlow from './routes/PurchaseFlow';

  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2'
      }
    }
  });

  function App() {
  const [configs, setConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [mode, setMode] = useState('home');
  // Removed unused formData state

    useEffect(() => {
      fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
      const response = await fetch('http://localhost:3001/api/configs');
      const data = await response.json();
      setConfigs(data);
    };

    const handleCreateNew = () => {
      setSelectedConfigId(null);
      setMode('create');
    };

    const handleEditConfig = (id) => {
      setSelectedConfigId(id);
      setMode('edit');
    };

    // New: delete config from server, reload
    const handleDeleteConfig = async (id) => {
      if (!window.confirm("Are you sure you want to delete this config?")) {
        return;
      }
      await fetch(`http://localhost:3001/api/configs/${id}`, {
        method: 'DELETE'
      });
      // re-fetch from server
      await fetchConfigs();
    };

    const handleSave = async (savedConfig) => {
      if (!savedConfig.id) {
        // new -> POST
        await fetch('http://localhost:3001/api/configs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savedConfig)
        });
      } else {
        // existing -> PUT
        await fetch(`http://localhost:3001/api/configs/${savedConfig.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savedConfig)
        });
      }

      await fetchConfigs();
      setMode('home');
    };

    const handleCancel = () => {
      setMode('home');
    };

    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <h1>PASS Mappings to API</h1>
          </Box>

          {mode === 'home' && (
            <Home
              configs={configs}
              onCreateNew={handleCreateNew}
              onEditConfig={handleEditConfig}
              onDeleteConfig={handleDeleteConfig}
              onPurchaseConfig={(id) => {
                setSelectedConfigId(id);
                setMode('purchase');
              }}
            />
          )}
          

          {(mode === 'create' || mode === 'edit') && (
            <ConfigForm
              configId={selectedConfigId}
              configs={configs}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </Container>
      </ThemeProvider>
    );
  }

  export default App;
