import { prisma } from "@/lib/db";
import { formatEur, SECURED_STATUS, ACTIVE_STATUSES } from "@/lib/pipeline";

export default async function SecteursPage() {
  const tagRows = await prisma.dealTag.findMany({
    include: { deal: { select: { amount: true, status: true } } },
  });

  if (tagRows.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        Aucun secteur disponible. Importez un fichier CSV pour commencer.
      </div>
    );
  }

  const sectorMap = new Map<string, { caSecurise: number; pipeline: number }>();

  for (const row of tagRows) {
    const entry = sectorMap.get(row.tag) ?? { caSecurise: 0, pipeline: 0 };
    const { amount, status } = row.deal;

    if (status === SECURED_STATUS) {
      entry.caSecurise += amount;
    } else if ((ACTIVE_STATUSES as readonly string[]).includes(status)) {
      entry.pipeline += amount;
    }

    sectorMap.set(row.tag, entry);
  }

  const sectors = Array.from(sectorMap.entries())
    .map(([tag, data]) => ({ tag, ...data, total: data.caSecurise + data.pipeline }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analyse Sectorielle</h1>

      <div className="overflow-hidden border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Secteur
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                CA Sécurisé
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pipeline
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sectors.map((row) => (
              <tr key={row.tag} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {row.tag}
                </td>
                <td className="px-6 py-4 text-sm text-green-700 font-medium text-right">
                  {formatEur(row.caSecurise)}
                </td>
                <td className="px-6 py-4 text-sm text-blue-700 text-right">
                  {formatEur(row.pipeline)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-bold text-right">
                  {formatEur(row.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
