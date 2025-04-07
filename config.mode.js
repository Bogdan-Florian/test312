// config.model.js
const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  fieldName: String,
  fieldLabel: String,
  defaultValue: String,
  isMandatory: Boolean,
  isOptional: Boolean,
  mappingKey: String
});

const ConfigSchema = new mongoose.Schema({
  name: String,
  fields: [FieldSchema]
});

module.exports = mongoose.model('Config', ConfigSchema);
