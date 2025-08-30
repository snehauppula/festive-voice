import RecordList from "@/components/records/record-list"

export default function RecordsPage() {
  return (
    <main className="container mx-auto max-w-4xl py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Festival Voice Records</h1>
      <RecordList />
    </main>
  )
}
