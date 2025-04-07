import React, { useState, useEffect } from 'react';

export default function DynamicForm({ config, onSave, onCancel }) {
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!localConfig) {
    return null;
  }

  const handleChange = (prop, value) => {
    setLocalConfig({ ...localConfig, [prop]: value });
  };

  // Add a new field
  const handleAddField = () => {
    const newField = {
      fieldName: `field_${Date.now()}`,
      fieldLabel: '',
      defaultValue: '',
      isMandatory: false,
      isOptional: true
    };
    setLocalConfig({
      ...localConfig,
      fields: [...localConfig.fields, newField]
    });
  };

  const handleFieldChange = (idx, prop, value) => {
    const updatedFields = [...localConfig.fields];
    updatedFields[idx][prop] = value;

    // If toggling mandatory, auto-toggle optional
    if (prop === 'isMandatory') {
      updatedFields[idx].isOptional = !value;
    }
    if (prop === 'isOptional') {
      updatedFields[idx].isMandatory = !value;
    }

    setLocalConfig({ ...localConfig, fields: updatedFields });
  };

  // Remove a field
  const handleRemoveField = (index) => {
    const updated = [...localConfig.fields];
    updated.splice(index, 1);
    setLocalConfig({ ...localConfig, fields: updated });
  };

  const handleSaveClick = () => {
    onSave(localConfig);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h2>{localConfig.id ? 'Edit' : 'Create'} Configuration</h2>

      {/* Config name */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Configuration Name</label>
        <input
          type="text"
          value={localConfig.name}
          onChange={(e) => handleChange('name', e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        />
      </div>

      {/* Fields */}
      <h3>Fields</h3>
      <button onClick={handleAddField} style={{ marginBottom: '1rem' }}>
        Add Field
      </button>

      {localConfig.fields && localConfig.fields.map((f, idx) => (
        <div key={idx} style={{ border: '1px solid #ddd', padding: '0.5rem', marginBottom: '0.5rem' }}>
          <div>
            <label>Field Name: </label>
            <input
              type="text"
              value={f.fieldName}
              onChange={(e) => handleFieldChange(idx, 'fieldName', e.target.value)}
            />
          </div>

          <div>
            <label>Label: </label>
            <input
              type="text"
              value={f.fieldLabel}
              onChange={(e) => handleFieldChange(idx, 'fieldLabel', e.target.value)}
            />
          </div>

          <div>
            <label>Default Value: </label>
            <input
              type="text"
              value={f.defaultValue}
              onChange={(e) => handleFieldChange(idx, 'defaultValue', e.target.value)}
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={f.isMandatory}
                onChange={(e) => handleFieldChange(idx, 'isMandatory', e.target.checked)}
              />
              {' '}Mandatory
            </label>

            <label style={{ marginLeft: '1rem' }}>
              <input
                type="checkbox"
                checked={f.isOptional}
                onChange={(e) => handleFieldChange(idx, 'isOptional', e.target.checked)}
              />
              {' '}Optional
            </label>
          </div>

          <button onClick={() => handleRemoveField(idx)} style={{ marginTop: '0.5rem' }}>
            Remove Field
          </button>
        </div>
      ))}

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleSaveClick}>Save</button>
        <button onClick={onCancel} style={{ marginLeft: '1rem' }}>Cancel</button>
      </div>
    </div>
  );
}
