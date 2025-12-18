import React from 'react';

export const SimpleTestPage: React.FC = () => {
  console.log('SimpleTestPage rendering...');
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>
        🚀 Test Page Working!
      </h1>
      <p style={{ color: 'blue', fontSize: '18px' }}>
        Current time: {new Date().toLocaleTimeString()}
      </p>
      <div style={{ backgroundColor: 'yellow', padding: '10px', margin: '10px 0' }}>
        If you see this, the React app is working!
      </div>
    </div>
  );
};