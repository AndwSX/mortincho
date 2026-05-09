const fs = require('fs');

// Vercel y otros entornos inyectarán las variables en process.env
const apiUrl = process.env.API_URL || 'http://127.0.0.1:8000';

const targetPath = './src/environments/environment.ts';

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`[build-step] environment.ts generado correctamente con apiUrl: ${apiUrl}`);
