"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiFetch } from "@/lib/api"

const LANGUAGES = [
  "assamese",
  "bengali",
  "bodo",
  "dogri",
  "gujarati",
  "hindi",
  "kannada",
  "kashmiri",
  "konkani",
  "maithili",
  "malayalam",
  "marathi",
  "meitei",
  "nepali",
  "odia",
  "punjabi",
  "sanskrit",
  "santali",
  "sindhi",
  "tamil",
  "telugu",
  "urdu",
]

const RIGHTS = [
  "This work is created by me and anyone is free to use it.",
  "This work is created by my family/friends and I took permission to upload their work.",
  "I downloaded this from the internet and/or I don't know if it is free to share.",
]

type MediaRecorderLike = MediaRecorder

let confettiFnRF: null | ((opts?: any) => void) = null
if (typeof window !== "undefined") {
  import("canvas-confetti")
    .then((m) => {
      confettiFnRF = m.default || (m as any)
    })
    .catch(() => {})
}

export default function RecordForm() {
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [locationText, setLocationText] = useState("")
  const [coords, setCoords] = useState<string>("")
  const [language, setLanguage] = useState<string>("")
  const [rights, setRights] = useState<string>("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [recording, setRecording] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState<number>(0)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  type Toast = { id: number; kind: "success" | "error" | "info"; text: string }
  const [toasts, setToasts] = useState<Toast[]>([])

  const recorderRef = useRef<MediaRecorderLike | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    if (audioFile) {
      const url = URL.createObjectURL(audioFile)
      setObjectUrl(url)
    } else {
      setObjectUrl(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioFile])

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop()
      }
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  function showToast(text: string, kind: Toast["kind"] = "info") {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, kind, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }

  async function startRecording() {
    setStatus(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec: MediaRecorderLike = new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" })
        setAudioFile(file)
        setRecording(false)
        if (timerRef.current) window.clearInterval(timerRef.current)
      }
      recorderRef.current = rec
      rec.start()
      setElapsed(0)
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000)
      setRecording(true)
    } catch (e: any) {
      setStatus(e.message || "Microphone permission denied")
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setAudioFile(f)
  }

  function useMyLocation() {
    if (!navigator.geolocation) return setStatus("Geolocation not supported")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
      },
      (err) => setStatus(err.message || "Failed to get location"),
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const form = new FormData()
      form.append("title", title)
      form.append("description", desc)
      if (locationText) form.append("location", locationText)
      if (coords) form.append("coordinates", coords)
      if (language) form.append("language", language)
      if (rights) form.append("rights", rights)
      if (audioFile) form.append("audio", audioFile)

      await apiFetch("/api/v1/records/", {
        method: "POST",
        body: form,
        headers: {}, // let browser set multipart boundary
      })
      showToast("Uploaded successfully!", "success")
      if (confettiFnRF) confettiFnRF({ particleCount: 120, spread: 75, origin: { y: 0.2 } })
      setTitle("")
      setDesc("")
      setLocationText("")
      setCoords("")
      setLanguage("")
      setRights("")
      setAudioFile(null)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setObjectUrl(null)
    } catch (e: any) {
      const msg = e.message || "Failed to upload"
      setStatus(msg)
      showToast(msg, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6 animate-in fade-in duration-300" onSubmit={onSubmit}>
      <div className="pointer-events-none fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl px-4 py-3 shadow-2xl backdrop-blur-xl border animate-bounce-in ${
              t.kind === "success"
                ? "bg-white/70 dark:bg-white/10 border-emerald-300/60 text-emerald-900 dark:text-emerald-200"
                : t.kind === "error"
                  ? "bg-white/70 dark:bg-white/10 border-red-300/60 text-red-900 dark:text-red-200"
                  : "bg-white/70 dark:bg-white/10 border-blue-300/60 text-foreground"
            }`}
          >
            <p className="text-sm">{t.text}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Select Language *</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="-- Select a language --" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Description *</Label>
        <Textarea id="desc" required value={desc} onChange={(e) => setDesc(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Village/City/Region"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coords">Location: lat, lng</Label>
          <div className="flex gap-2">
            <Input
              id="coords"
              placeholder="17.4575, 78.6681"
              value={coords}
              onChange={(e) => setCoords(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={useMyLocation}
              className="transition-transform active:scale-95"
            >
              Use My Location
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Audio Recording *</Label>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {!recording ? (
              <Button
                type="button"
                variant="secondary"
                onClick={startRecording}
                className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm active:scale-95"
              >
                Start Recording
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={stopRecording}
                className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm active:scale-95"
              >
                Stop Recording
              </Button>
            )}
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${recording ? "bg-red-500 animate-pulse" : "bg-muted-foreground/40"}`}
                aria-hidden
              />
              {recording ? "Recording..." : "Not recording"}
            </span>
          </div>
          <span aria-live="polite" className="text-sm font-medium text-foreground/80 tabular-nums">
            {recording
              ? `${Math.floor(elapsed / 60)
                  .toString()
                  .padStart(2, "0")}:${(elapsed % 60).toString().padStart(2, "0")}`
              : null}
          </span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">OR Upload Audio File</Label>
          <Input id="file" type="file" accept="audio/*" onChange={handleFile} />
          {audioFile && (
            <div className="space-y-2">
              <p className="text-sm">Selected: {audioFile.name}</p>
              {objectUrl && <audio controls src={objectUrl} className="w-full" crossOrigin="anonymous" />}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Release Rights *</Label>
          <Select value={rights} onValueChange={setRights}>
            <SelectTrigger>
              <SelectValue placeholder="Select rights statement" />
            </SelectTrigger>
            <SelectContent>
              {RIGHTS.map((r, i) => (
                <SelectItem key={i} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 text-white bg-[linear-gradient(135deg,#FF6F61,#FFD700,#6B5B95)] btn-ripple"
        disabled={loading || !title || !desc || !language || !rights || !audioFile}
        onMouseDown={(e) => {
          const el = e.currentTarget
          const rect = el.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          el.style.setProperty("--ripple-x", `${x}px`)
          el.style.setProperty("--ripple-y", `${y}px`)
          el.dataset.rippling = "true"
          requestAnimationFrame(() => setTimeout(() => (el.dataset.rippling = "false"), 700))
        }}
      >
        <span className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 [mask-image:linear-gradient(90deg,transparent,black,transparent)] bg-[linear-gradient(90deg,rgba(255,255,255,.15)_0,rgba(255,255,255,.35)_50%,rgba(255,255,255,.15)_100%)] animate-[shimmer_2s_infinite]"></span>
        {loading ? "Uploading..." : "Upload Content"}
      </Button>
      {status && (
        <p className="text-sm text-foreground/80" role="status" aria-live="polite">
          {status}
        </p>
      )}
    </form>
  )
}
