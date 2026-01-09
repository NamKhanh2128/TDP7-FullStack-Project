const fs = require('fs');
const path = require('path');

/**
 * Script to fix [User] → [AppUser] references in backend code
 * 
 * Usage: node scripts/fix_user_to_appuser.js
 * 
 * This script will:
 * 1. Find all .js files in src/ directory
 * 2. Replace [User] with [AppUser] in SQL queries
 * 3. Create backup files (.bak) before making changes
 * 4. Report all changes made
 */

const SRC_DIR = path.join(__dirname, '../src');
const SCRIPTS_DIR = path.join(__dirname, '..');

// Patterns to replace
const REPLACEMENTS = [
  {
    pattern: /FROM \[User\]/g,
    replacement: 'FROM [AppUser]',
    description: 'FROM [User] → FROM [AppUser]'
  },
  {
    pattern: /JOIN \[User\]/g,
    replacement: 'JOIN [AppUser]',
    description: 'JOIN [User] → JOIN [AppUser]'
  },
  {
    pattern: /LEFT JOIN \[User\]/g,
    replacement: 'LEFT JOIN [AppUser]',
    description: 'LEFT JOIN [User] → LEFT JOIN [AppUser]'
  },
  {
    pattern: /INNER JOIN \[User\]/g,
    replacement: 'INNER JOIN [AppUser]',
    description: 'INNER JOIN [User] → INNER JOIN [AppUser]'
  },
  {
    pattern: /UPDATE \[User\]/g,
    replacement: 'UPDATE [AppUser]',
    description: 'UPDATE [User] → UPDATE [AppUser]'
  },
  {
    pattern: /INSERT INTO \[User\]/g,
    replacement: 'INSERT INTO [AppUser]',
    description: 'INSERT INTO [User] → INSERT INTO [AppUser]'
  },
  {
    pattern: /SELECT.*FROM \[User\]/g,
    replacement: (match) => match.replace('[User]', '[AppUser]'),
    description: 'SELECT ... FROM [User] → SELECT ... FROM [AppUser]'
  },
  {
    pattern: /DELETE FROM \[User\]/g,
    replacement: 'DELETE FROM [AppUser]',
    description: 'DELETE FROM [User] → DELETE FROM [AppUser]'
  },
  {
    pattern: /WHERE.*\[User\]/g,
    replacement: (match) => match.replace('[User]', '[AppUser]'),
    description: 'WHERE ... [User] → WHERE ... [AppUser]'
  },
  {
    pattern: /REFERENCES \[dbo\]\.\[User\]/g,
    replacement: 'REFERENCES [dbo].[AppUser]',
    description: 'REFERENCES [dbo].[User] → REFERENCES [dbo].[AppUser]'
  }
];

// Files to process
const FILES_TO_PROCESS = [
  // Services
  'src/services/authService.js',
  'src/services/birthService.js',
  'src/services/deathService.js',
  'src/services/bookingService.js',
  // Controllers
  'src/modules/admin/auditLogController.js',
  'src/modules/admin/userController.js',
  'src/modules/admin/householdController.js',
  'src/modules/admin/residentController.js',
  'src/modules/user/requestController.js',
  'src/modules/user/feedbackController.js',
  'src/modules/user/reportController.js',
  // Scripts
  'scripts/seed.js',
  'scripts/reset_admin_password.js'
];

let totalFiles = 0;
let totalReplacements = 0;
const changes = [];

function processFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let fileReplacements = 0;
  const fileChanges = [];

  // Apply all replacements
  REPLACEMENTS.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      const count = matches.length;
      content = content.replace(pattern, replacement);
      fileReplacements += count;
      fileChanges.push(`  - ${description}: ${count} occurrence(s)`);
    }
  });

  if (fileReplacements > 0) {
    // Create backup
    const backupPath = fullPath + '.bak';
    fs.writeFileSync(backupPath, fs.readFileSync(fullPath, 'utf8'));
    
    // Write updated content
    fs.writeFileSync(fullPath, content);
    
    totalFiles++;
    totalReplacements += fileReplacements;
    changes.push({
      file: filePath,
      count: fileReplacements,
      details: fileChanges
    });
    
    console.log(`✅ ${filePath}: ${fileReplacements} replacement(s)`);
  } else {
    console.log(`ℹ️  ${filePath}: No changes needed`);
  }
}

// Main execution
console.log('🔧 Fixing [User] → [AppUser] references...\n');

FILES_TO_PROCESS.forEach(processFile);

// Summary
console.log('\n========================================');
console.log('✅ REPLACEMENT COMPLETE!');
console.log('========================================');
console.log(`Total files modified: ${totalFiles}`);
console.log(`Total replacements: ${totalReplacements}`);
console.log('\nBackup files created with .bak extension');
console.log('\nChanges made:');
changes.forEach(({ file, count, details }) => {
  console.log(`\n📄 ${file} (${count} changes):`);
  details.forEach(detail => console.log(detail));
});

console.log('\n========================================');
console.log('Next Steps:');
console.log('  1. Review the changes');
console.log('  2. Test server startup: npm run dev');
console.log('  3. Test login functionality');
console.log('  4. If everything works, delete .bak files');
console.log('  5. If issues occur, restore from .bak files');
console.log('========================================\n');
