import { ElectionsSection } from "@/components/landing/elections-section";
import { getPublicElections } from "@/lib/landing/data";

export async function ElectionsBlock() {
  const elections = await getPublicElections();
  return <ElectionsSection elections={elections} />;
}
