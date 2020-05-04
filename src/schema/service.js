const service = {
  insertProfile: async (profile, db) => {
    await db.insert(profile).into('profile');
  },

  getProfile: async (user_id, db) => {
    console.log(typeof user_id);

    const result = await db
      .select('*')
      .from('profile')
      .where({ user_id })
      .first();

    console.log(result);

    console.log(typeof result);

    return result;
  },

  getUserByID: async (id, db) => {
    const result = await db
      .select('id', 'user_name')
      .from('users')
      .where({ id })
      .first();

    return result;
  },

  getUserByName: async (user_name, db) => {
    console.log(user_name);
    const result = await db
      .select('id', 'user_name')
      .from('users')
      .where({ user_name })
      .first();

    return result;
  }
};

module.exports = service;
