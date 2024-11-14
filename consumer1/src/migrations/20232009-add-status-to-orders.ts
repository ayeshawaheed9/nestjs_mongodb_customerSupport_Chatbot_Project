import { Db } from 'mongodb';

// The "up" function applies the changes
export async function up(db: Db) {
  await db.collection('orders').updateMany({}, { $set: { status: 'pending' } });
}

// The "down" function reverts the changes
export async function down(db: Db) {
  await db.collection('orders').updateMany({}, { $unset: { status: '' } });
}
