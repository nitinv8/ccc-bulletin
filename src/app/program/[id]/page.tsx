import { getSupabaseProgram } from "@/lib/supabasePrograms";
import { findProgram } from "@/lib/programs";
import ProgramPageClient from "@/components/ProgramPageClient";

export const revalidate = 0;

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = (await getSupabaseProgram(id)) ?? findProgram(id) ?? null;
  return <ProgramPageClient program={program} />;
}
