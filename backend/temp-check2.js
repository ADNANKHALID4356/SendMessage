const bcrypt = require('./node_modules/bcrypt');

async function test() {
  const hash = '$2b$12$KP/ye9Gb5Zo0xRDdNI90Be/ASyets5C4rJ.TpE42o77ovbBv4lJ6G';
  const match = await bcrypt.compare('Admin@123', hash);
  console.log('Match Admin@123:', match);
  
  const hash2 = '$2b$12$vihtsw8D1VFMGdX4hbCiAOaLqIAdOJPZT/DQ1QlRhGoFY/Ca7GLky';
  const match2 = await bcrypt.compare('User@123', hash2);
  console.log('Match User@123:', match2);
}

test();