import { prisma } from "@/lib/db";
import { formatEur } from "@/lib/pipeline";

export default async function CommerciauxPage() {
  const groups = await prisma.deal.groupBy({
    by: ["assignee"],
    _count: { id: true },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  if (groups.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        Aucun deal en base. Importez un fichier CSV pour commencer.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Performance Commerciaux</h1>

      <div className="overflow-hidden border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre de deals
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur brute
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {groups.map((row) => (
              <tr key={row.assignee} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {row.assignee || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 text-right">
                  {row._count.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium text-right">
                  {formatEur(row._sum.amount ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
