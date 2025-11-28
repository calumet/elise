const { elise, eliseContent } = require('@elise/ui/tailwind');

module.exports = {
  presets: [elise],
  content: [
    ...eliseContent,
    './index.html',
    './src/**/*.{ts,tsx}'
  ]
};
