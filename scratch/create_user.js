const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'victoravila@liveon.com',
    password: '22031990',
    options: {
      data: {
        display_name: 'Victor Avila',
        username: 'victoravila',
      },
    },
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created successfully:', data.user?.id);
  }
}

createUser();
