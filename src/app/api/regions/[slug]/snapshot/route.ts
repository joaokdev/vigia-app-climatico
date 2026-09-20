import { NextResponse } from "next/server";
import { getRegionSnapshot } from "@/server/regions/service";
import { getRegionBySlug } from "@/lib/data/regions";
import { jsonError } from "@/server/lib/http";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) return jsonError("not_found", "Região desconhecida.", 404);

  const snapshot = await getRegionSnapshot(region.slug);
  return NextResponse.json(snapshot);
}
