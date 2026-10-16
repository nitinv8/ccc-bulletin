import HomeClient from "@/components/HomeClient";
import { getSupabaseBulletins } from "@/lib/supabasePrograms";
import { getBulletins } from "@/lib/programs";

export const revalidate = 0; // always fresh from Supabase

export default async function Home() {
  let bulletins = await getSupabaseBulletins();
  // Fall back to JSON if Supabase returns nothing (e.g. during local dev before migration)
  if (!bulletins.length) {
    bulletins = getBulletins();
  }
  return <HomeClient bulletins={bulletins} />;
}
