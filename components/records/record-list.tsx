"use client"

import useSWR from "swr"
import { swrFetcher } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type RecordItem = {
  id?: string
  title: string
  description?: string
  location?: string
  coordinates?: string
  language?: string
  rights?: string
  audioUrl?: string
  [k: string]: any
}

export default function RecordList() {
  const { data, error, isLoading } = useSWR<RecordItem[]>("/api/v1/records/", swrFetcher)

  if (isLoading) return <p>Loading records...</p>
  if (error) return <p>Failed to load records</p>
  if (!data?.length) return <p>No records yet.</p>

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((item, idx) => (
        <Card key={item.id || idx}>
          <CardHeader>
            <CardTitle className="text-pretty">{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
            <p className="text-sm">
              {item.location && <span>Location: {item.location} · </span>}
              {item.coordinates && <span>Coords: {item.coordinates} · </span>}
              {item.language && <span>Language: {item.language}</span>}
            </p>
            {item.audioUrl && (
              <audio controls src={item.audioUrl} className="w-full">
                Your browser does not support the audio element.
              </audio>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
