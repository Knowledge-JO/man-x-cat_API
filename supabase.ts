import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config()
const supabaseUrl = "https://mtuzyezcyumcrpwdikub.supabase.co"
const supabaseKey = process.env.SUPABASE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
export { supabaseUrl }
