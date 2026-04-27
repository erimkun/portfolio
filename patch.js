const fs = require('fs');
const file = 'src/components/ProjectsSection.jsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Fix Reveal Variants
code = code.replace(
  /const revealVariants = \{[\s\S]*?exit: \{[\s\S]*?\},[\s\S]*?\}/,
  `const revealVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      when: 'beforeChildren',
      staggerChildren: 0.08,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.24 },
  },
}`
);

// We need the wrapper NOT to fade if we want layoutId, but actually, if layoutId is used, 
// the component itself shouldn't have opacity: 0 when it mounts.
// A better way: just don't apply variants to the reveal card or the main reveal container if layoutId is to be seamless.
// Let's just remove revealCardVariants usage and loading="lazy".
