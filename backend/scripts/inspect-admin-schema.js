import { prisma } from '../db/prisma.js';

const rows = await prisma.$queryRawUnsafe(`
  select table_name, column_name, data_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name in ('works', 'work_images', 'categories', 'site_texts', 'admin_profiles')
  order by table_name, ordinal_position
`);

console.log(JSON.stringify(rows, null, 2));
await prisma.$disconnect();
