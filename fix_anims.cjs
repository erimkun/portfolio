const fs = require('fs');
const file = 'src/components/ProjectsSection.jsx';
let code = fs.readFileSync(file, 'utf8');

// The expanded project card
code = code.replace(
  /<motion\.a\s+layoutId={\`project-card-\$\{selected\.id\}\`}/,
  `<motion.a
                      layout
                      transition={{ layout: { duration: 0.46, ease: [0.16, 1, 0.3, 1] } }}
                      layoutId={\`project-card-\$\{selected.id\}\`}`
);

// We need to ensure inner elements morph nicely, so let's add `layout` to inner wrappers too.
// Or wait, let's also upgrade the grid inner image container and the expanded inner image container to motion components.

// Actually, in the grid card:
code = code.replace(
  /<div className="glass-card-img-wrap">/g,
  `<motion.div layout="position" className="glass-card-img-wrap">`
);

code = code.replace(
  /<\/div>\s*\}\)\s*<div className="glass-card-body">/g,
  `</motion.div>
                          )}
                          <div className="glass-card-body">`
);

fs.writeFileSync(file, code);
