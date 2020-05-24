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
    const result = await db
      .select('grocery_delivery', 'walk_dogs', 'donations', 'counceling', 'career_services')
      .from('profile')
      .where({ user_id })
      .first();

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

    return result;
  },

  getProfileMatches: async (help_options, db) => {
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

    return result.rows;
  },

  getMessageThread: async (users, db) => {
    const { created_by, recipient } = users;

    const msgThread = await db
      .select('*')
      .from('message_thread')
      .where({ created_by: created_by, recipient: recipient })
      .orWhere({ created_by: recipient, recipient: created_by })
      .then((thread) => {
        if (thread.length > 1) throw new Error('msgThreadID result should be singular');
        return thread[0];
      });

    return msgThread;
  },

  getUserMessageThreads: async (user_id, db) => {
    const msgThreads = await db
      .select('*')
      .from('message_thread')
      .where({ created_by: user_id })
      .orWhere({ recipient: user_id })
      .orderBy('last_msg_timestamp', 'desc');

    return msgThreads;
  },

  createNewMessageThread: async (created_by, recipient, db) => {
    const thread = await db
      .insert({
        created_by: created_by,
        recipient: recipient,
        last_msg_timestamp: db.fn.now(),
      })
      .into('message_thread')
      .returning('*')
      .then(([thread]) => thread)
      .then((thread) => thread);

    return thread;
  },

  updateLastMessageTS: async (thread_id, db) => {
    await db('message_thread').where({ id: thread_id }).update({ last_msg_timestamp: db.fn.now() });
  },

  insertMessage: async (message, db) => {
    if (!message.thread_id) {
      const messageThread = await service.createNewMessageThread(message.sender_id, message.receiver_id, db);
      message.thread_id = messageThread.id;
    } else await service.updateLastMessageTS(message.thread_id, db);

    const result = await db
      .insert(message)
      .into('message')
      .returning('*')
      .then(([msg]) => msg)
      .then((msg) => msg);

    return result;
  },

  getMessageHistory: async (thread_id, db) => {
    console.log('in getMessageHistory service thread_id is ', thread_id);
    console.log(db);
    const result = await db.select('*').from('message').where(thread_id).orderBy('date_sent');

    console.log('in getMessageHistory service result is ', result);
    return result;
  },
};

module.exports = service;
