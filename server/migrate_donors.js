const db = require('./src/config/db');

async function migrate() {
  try {
    console.log('Starting donor migration...');

    // 1. Add name and phone columns to blood_donors (if they don't exist)
    try {
      await db.query(`ALTER TABLE blood_donors ADD COLUMN name VARCHAR(100)`);
    } catch (e) {
      console.log('Column name already exists or could not be added:', e.message);
    }
    try {
      await db.query(`ALTER TABLE blood_donors ADD COLUMN phone VARCHAR(20)`);
    } catch (e) {
      console.log('Column phone already exists or could not be added:', e.message);
    }

    // 2. Copy data from users to blood_donors
    console.log('Copying names and phones from users to blood_donors...');
    await db.query(`
      UPDATE blood_donors b
      JOIN users u ON b.user_id = u.id
      SET b.name = u.name, b.phone = u.phone
      WHERE b.name IS NULL OR b.phone IS NULL
    `);

    // 3. Drop foreign key constraint on user_id if it exists
    try {
      // Find the foreign key constraint name
      const [fks] = await db.query(`
        SELECT CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'people_e_sheba'
          AND TABLE_NAME = 'blood_donors'
          AND COLUMN_NAME = 'user_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      for (let fk of fks) {
        console.log('Dropping foreign key:', fk.CONSTRAINT_NAME);
        await db.query(`ALTER TABLE blood_donors DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
      }
    } catch (e) {
      console.log('Could not drop foreign key:', e.message);
    }

    // 4. Make user_id nullable in blood_donors
    console.log('Making user_id nullable...');
    await db.query(`ALTER TABLE blood_donors MODIFY user_id INT NULL`);
    
    // Also drop the UNIQUE constraint on user_id if it prevents multiple nulls, though MySQL allows multiple nulls in unique indexes. But let's keep it unique so a user can only have one donor profile. Wait, if it's unique, it's fine.

    // 5. Delete all non-admin users
    console.log('Deleting all non-admin users...');
    const [result] = await db.query(`DELETE FROM users WHERE role != 'admin'`);
    console.log(`Deleted ${result.affectedRows} non-admin users.`);

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
