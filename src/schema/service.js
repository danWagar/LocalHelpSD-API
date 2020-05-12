const service = {
  insertProfile: async (profile, db) => {
    console.log('in service profile is ', profile);
    await db.insert(profile).into('profile');
  },

  getProfile: async (user_id, db) => {
    console.log(typeof user_id);

    const result = await db
      .select('id', 'user_id', 'avatar', 'neighborhood', 'story')
      .from('profile')
      .where({ user_id })
      .first();

    return result;
  },

  getProfileHelp: async (user_id, db) => {
    console.log('in getProfileHelp user_id is ', user_id);
    const result = await db.select('wants_help').from('profile').where({ user_id }).first();
    console.log(result);
    return result;
  },

  getProfileHelpStatus: async (user_id, db) => {
    console.log('in getProfileHelpStatus user_id is ', user_id);
    const result = await db
      .select('immunocompromised', 'unemployment', 'essential')
      .from('profile')
      .where({ user_id })
      .first();

    return result;
  },

  getProfileHelpOptions: async (user_id, db) => {
    console.log('in db service user_id is ', user_id);

    const result = await db
      .select('grocery_delivery', 'walk_dogs', 'donations', 'counceling', 'career_services')
      .from('profile')
      .where({ user_id })
      .first();

    console.log('in getProfileHelpOptions result is ', result);

    return result;
  },

  getUserByID: async (id, db) => {
    const result = await db.select('id', 'user_name').from('users').where({ id }).first();

    return result;
  },

  getUserByName: async (user_name, db) => {
    console.log(user_name);
    const result = await db.select('id', 'user_name').from('users').where({ user_name }).first();

    return result;
  },
};

module.exports = service;
