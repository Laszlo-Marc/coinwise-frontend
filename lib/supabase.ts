import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

import { env } from "./env";

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

console.log("Initializing Supabase client with URL:", env.SUPABASE_URL);

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
