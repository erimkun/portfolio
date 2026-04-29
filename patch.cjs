const fs = require('fs');
const path = './src/index.css';
let css = fs.readFileSync(path, 'utf8');

// 1. Hide nav-toggle on desktop
css = css.replace(
  /(\.nav-toggle\s*\{[^}]*)display:\s*flex;([^}]*\})/s,
  '$1display: none;$2'
);

// 2. Make side-nav visible on desktop
css = css.replace(
  /(\.side-nav\s*\{[^}]*)opacity:\s*0;([^}]*)pointer-events:\s*none;([^}]*)transform:\s*translateX\(24px\)\s*scale\(0\.95\);([^}]*\})/s,
  '$1opacity: 1;$2pointer-events: auto;$3transform: translateX(0) scale(1);$4'
);

// 3. Update the media query section to handle mobile explicitly
css = css.replace(
  /@media\s+\(max-width:\s*600px\)\s*\{\s*\.nav-wrapper\s*\{/s,
  '@media (max-width: 768px) {\n  .nav-wrapper {'
);

css = css.replace(
  /\.nav-toggle\s*\{\s*width:\s*52px;/s,
  '.nav-toggle {\n    display: flex;\n    width: 52px;'
);

css = css.replace(
  /(\.side-nav\s*\{\s*padding:\s*14px;\s*gap:\s*8px;\s*transform-origin:\s*right\s*bottom;)\s*transform:\s*translateY\(24px\)\s*scale\(0\.95\);/s,
  '$1\n    opacity: 0;\n    pointer-events: none;\n    transform: translateY(24px) scale(0.95);'
);

css = css.replace(
  /\.nav-wrapper\.is-open\s*\.side-nav\s*\{\s*transform:\s*translateY\(0\)\s*scale\(1\);\s*\}/s,
  '.nav-wrapper.is-open .side-nav {\n    opacity: 1;\n    pointer-events: auto;\n    transform: translateY(0) scale(1);\n  }'
);

fs.writeFileSync(path, css, 'utf8');
console.log('CSS patched!');
