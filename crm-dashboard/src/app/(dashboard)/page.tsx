import { prisma } from "@/lib/db";
import { computeKpis, formatEur } from "@/lib/pipeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const deals = await prisma.deal.findMany();
  const kpis = computeKpis(deals);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KPIs Globaux</h1>
        <p className="text-sm text-gray-500 mt-1">
          {deals.length} deal{deals.length !== 1 ? "s" : ""} en base
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard title="CA Sécurisé" value={formatEur(kpis.caSecurise)} subtitle="Deals « gagné - en cours »" />
        <KpiCard title="Pipeline Brut" value={formatEur(kpis.pipelineBrut)} subtitle="Prospect + Qualifié + Négociation" />
        <KpiCard title="Pipeline Pondéré" value={formatEur(kpis.pipelinePondere)} subtitle="Pondération 10 % / 35 % / 70 %" />
        <KpiCard title="Deals Actifs" value={kpis.volumeActifs.toString()} subtitle="En prospect, qualifié ou négociation" />
        <KpiCard title="Panier Moyen" value={formatEur(kpis.panierMoyen)} subtitle="Tous statuts confondus" />
      </div>

      <div className="border rounded-lg p-6 bg-amber-50 border-amber-200">
        <h2 className="text-lg font-semibold text-amber-900 mb-4">À Relancer</h2>
        <div className="flex gap-8">
          <div>
            <p className="text-sm text-amber-700">Nombre de deals</p>
            <p className="text-3xl font-bold text-amber-900">{kpis.aRelancerCount}</p>
          </div>
          <div>
            <p className="text-sm text-amber-700">Montant brut total</p>
            <p className="text-3xl font-bold text-amber-900">{formatEur(kpis.aRelancerAmount)}</p>
          </div>
        </div>
        {kpis.aRelancerCount === 0 && (
          <p className="text-sm text-amber-600 mt-2">Aucun deal à relancer.</p>
        )}
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
