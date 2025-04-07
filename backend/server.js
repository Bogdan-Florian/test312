const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

function sortFieldsByMappingKey(fields) {
  return fields.slice().sort((a, b) => {
    const numA = parseInt(a.mappingKey.replace('field', ''), 10);
    const numB = parseInt(b.mappingKey.replace('field', ''), 10);
    return numA - numB;
  });
}

// 1) Connect to MongoDB (ensure you're connecting to the right database)
mongoose.connect('mongodb://localhost:27017/mydb');
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// 2) Define a Mongoose schema for "fields"
const FieldSchema = new mongoose.Schema({
  fieldName: String,
  fieldLabel: String,
  defaultValue: String,
  isMandatory: Boolean,
  isOptional: Boolean,
  mappingKey: String
}, { _id: false });
// _id: false means we won't generate a separate _id for each field in the array

// 3) Define a Mongoose schema for "config"
//    We rename "identifier" -> "id". We use a default function to generate a UUID.
const ConfigSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    default: () => uuidv4()
  },
  name: String,
  fields: [FieldSchema],
  filenameTemplate: {
    type: String,
    default: "CONFIG_{timestamp}"
  }
}, { versionKey: false });

// Create the model (Mongoose will use the collection "configs")
const ConfigModel = mongoose.model('Config', ConfigSchema);

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ============== CONFIG CRUD ==================

// GET /api/configs
// Fetch all configs from MongoDB
app.get('/api/configs', async (req, res) => {
  try {
    const allConfigs = await ConfigModel.find();
    res.json(allConfigs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch configs' });
  }
});

// GET /api/configs/:id
// Fetch a config by its custom ID (UUID)
app.get('/api/configs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const config = await ConfigModel.findOne({ id });
    if (!config) {
      return res.status(404).json({ error: "Config not found" });
    }
    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch config" });
  }
});

// POST /api/configs
// Create a new config in MongoDB
app.post('/api/configs', async (req, res) => {
  try {
    // We do not expect "id" in the request body; it's auto-generated.
    const sortedFields = sortFieldsByMappingKey(req.body.fields || []);
    const newConfig = new ConfigModel({ ...req.body, fields: sortedFields });
    const saved = await newConfig.save();
    res.json({ success: true, config: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create config' });
  }
});

// PUT /api/configs/:id
// Update an existing config by its custom ID (UUID)
app.put('/api/configs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sortedFields = sortFieldsByMappingKey(req.body.fields || []);
    const updated = await ConfigModel.findOneAndUpdate(
      { id },
      { ...req.body, fields: sortedFields },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Config not found" });
    }
    res.json({ success: true, config: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// DELETE /api/configs/:id
// Remove a config from MongoDB using its custom ID (UUID)
app.delete('/api/configs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: "id parameter is required" });
    }
    const deletedConfig = await ConfigModel.findOneAndDelete({ id });
    if (!deletedConfig) {
      return res.status(404).json({ error: "Config not found" });
    }
    res.json({ success: true, config: deletedConfig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete config' });
  }
});

// POST /api/submit/:id
// Expects a JSON body with keys matching each field's "mappingKey".
// Produces a '|' separated CSV (header + single row) in memory, then sends it as a file download.
app.post('/api/submit/:id', async (req, res) => {
  const { id } = req.params;
  if (!id || id === 'undefined') {
    return res.status(400).json({ error: "id parameter is required" });
  }

  try {
    // Look up the config by its custom "id"
    const config = await ConfigModel.findOne({ id });
    if (!config) {
      return res.status(404).json({ error: "Configuration not found" });
    }

    const inputData = req.body; // e.g. { "field1": "John", "field2": "30", ... }

    // Build the CSV row from the inputData + config.fields
    const rowValues = config.fields.map(f => {
      const val = inputData[f.mappingKey];
      return val === undefined || val === null ? "" : String(val);
    });
    const rowLine = rowValues.join('|');

    // Create the CSV in memory: one header row, one data row
    const header = config.fields.map(f => f.mappingKey).join('|');
    const csvContent = `${header}\n${rowLine}`;

    // Generate a timestamp for the filename
    const now = new Date();
    // Example: 2025-04-05T13-27-30 (ISO up to seconds, colons replaced)
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    // Automatically append timestamp if not already in template
    const baseName = config.filenameTemplate;
    const filename = `${baseName}_${timestamp}`;

    // Set the download headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);

    // Send the CSV to the client
    return res.send(csvContent);

  } catch (err) {
    console.error("Error creating or sending CSV:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
