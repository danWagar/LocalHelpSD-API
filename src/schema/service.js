const service = {
  insertProfile: async (profile, db) => {
    await db.insert(profile).into('profile');
  },

  getProfile: async (user_id, db) => {
    const result = await db
      .select('id', 'user_id', 'avatar', 'neighborhood', 'story')
      .from('profile')
      .where({ user_id })
      .first();

    return result;
  },

  getProfileHelp: async (user_id, db) => {
    const result = await db.select('wants_help').from('profile').where({ user_id }).first();
    console.log(result);
    return result;
  },

  getProfileHelpStatus: async (user_id, db) => {
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
    const result = await db.select('*').from('users').where({ id }).first();

    return result;
  },

  getUserByEmail: async (email, db) => {
    const result = await db
      .select('id', 'email', 'first_name', 'last_name')
      .from('users')
      .where({ email })
      .first();

    console.log(result);

    return result;
  },

  getProfileMatches: async (help_options, db) => {
    console.log('in getProfileMatches ', help_options);
    const { wants_help, grocery_delivery, walk_dogs, donations, counceling, career_services } = help_options;
    const result = await db.raw(
      `
      select p.*, u.email, u.first_name, u.last_name 
      from profile as p join users as u on p.user_id = u.id
      where p.wants_help = ${!wants_help}
      and (p.grocery_delivery = ${grocery_delivery} or
        p.walk_dogs = ${walk_dogs} or
        p.donations = ${donations} or
        p.counceling = ${counceling} or
        p.career_services = ${career_services})
      `
    );

    console.log(result.rows);
    return result.rows;
  },

  insertMessage: async (message, db) => {
    const result = await db
      .insert(message)
      .into('message')
      .returning('*')
      .then(([msg]) => msg)
      .then((msg) => msg);

    return result;
  },
};

module.exports = service;
