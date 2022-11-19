exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id");
    table.string("name");
    table.string("email").notNullable();
    table.string("password").notNullable();
    table.biginteger("phone");
    table.biginteger("mobile");
    table.integer("zipcode").notNullable();
    table.decimal("lat");
    table.decimal("long");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
