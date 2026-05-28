import { NewDealForm } from "@/components/NewDealForm";

export default function NewDealPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="font-syne text-[11px] font-semibold tracking-[0.14em] uppercase text-[#9B9085] mb-1.5">
          Deals
        </p>
        <h1 className="font-syne font-bold text-2xl text-[#1C1917] tracking-tight">
          Nouveau deal
        </h1>
      </div>

      <div
        className="bg-white rounded-lg p-6"
        style={{ border: "1px solid hsl(36 18% 88%)" }}
      >
        <NewDealForm />
      </div>
    </div>
  );
}
