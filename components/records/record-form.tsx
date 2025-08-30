"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiFetch } from "@/lib/api"
import { useMe } from "@/lib/auth-store"

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
  { value: "creator", label: "This work is created by me and anyone is free to use it." },
  { value: "family_or_friend", label: "This work is created by my family/friends and I took permission to upload their work." },
  { value: "downloaded", label: "I downloaded this from the internet and/or I don't know if it is free to share." },
  { value: "NA", label: "Not applicable or unknown." },
]

type MediaRecorderLike = MediaRecorder

export default function RecordForm() {
  const { user } = useMe()
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
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")

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

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await apiFetch("/api/v1/categories/", {
          method: "GET",
          auth: true,
        })
        setCategories(response || [])
        // Set first category as default if available
        if (response && response.length > 0) {
          setSelectedCategory(response[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        setStatus("Failed to load categories")
      }
    }
    fetchCategories()
  }, [])

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
      // Validate required fields
      if (!title.trim()) {
        setStatus("Title is required")
        return
      }
      if (!desc.trim()) {
        setStatus("Description is required")
        return
      }
      if (!language) {
        setStatus("Language selection is required")
        return
      }
      if (!audioFile) {
        setStatus("Audio file is required")
        return
      }
      
      // Validate audio file
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (audioFile.size > maxSize) {
        setStatus("Audio file is too large. Maximum size is 5MB.")
        return
      }
      
      // Check file type
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4']
      if (!allowedTypes.includes(audioFile.type)) {
        setStatus("Audio file format not supported. Please use MP3, WAV, OGG, WebM, or MP4.")
        return
      }
      
      if (!rights) {
        setStatus("Rights statement is required")
        return
      }
      if (!selectedCategory) {
        setStatus("Category selection is required")
        return
      }

      // Check if user is authenticated
      const token = localStorage.getItem("access_token")
      if (!token) {
        setStatus("Authentication required. Please log in again.")
        return
      }

      // Implement chunked upload as per API specification
      const uploadUuid = crypto.randomUUID()
      const chunkSize = 1024 * 1024 // 1MB chunks
      const totalChunks = Math.ceil(audioFile.size / chunkSize)

      console.log("Starting chunked upload:", {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        chunkSize,
        totalChunks,
        uploadUuid
      })

      // Step 1: Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize
        const end = Math.min(start + chunkSize, audioFile.size)
        const chunk = audioFile.slice(start, end)

        const chunkForm = new FormData()
        chunkForm.append("chunk", chunk)
        chunkForm.append("filename", audioFile.name)
        chunkForm.append("chunk_index", chunkIndex.toString())
        chunkForm.append("total_chunks", totalChunks.toString())
        chunkForm.append("upload_uuid", uploadUuid)

        console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks}`)
        
        await apiFetch("/api/v1/records/upload/chunk", {
          method: "POST",
          body: chunkForm,
          headers: {},
          auth: true,
        })
      }

      // Step 2: Finalize upload with metadata
      const finalizeForm = new FormData()
      finalizeForm.append("title", title.trim())
      finalizeForm.append("description", desc.trim())
      finalizeForm.append("language", language)
      finalizeForm.append("release_rights", rights)
      finalizeForm.append("media_type", "audio")
      finalizeForm.append("category_id", selectedCategory)
      finalizeForm.append("user_id", user?.id || "1")
      finalizeForm.append("upload_uuid", uploadUuid)
      finalizeForm.append("filename", audioFile.name)
      finalizeForm.append("total_chunks", totalChunks.toString())
      finalizeForm.append("use_uid_filename", "false")
      
      // Handle coordinates
      if (coords) {
        const [lat, lng] = coords.split(',').map(c => parseFloat(c.trim()))
        if (!isNaN(lat) && !isNaN(lng)) {
          finalizeForm.append("latitude", lat.toString())
          finalizeForm.append("longitude", lng.toString())
        }
      }
      
      // Add location as description if provided
      if (locationText) {
        const currentDesc = finalizeForm.get("description") as string
        finalizeForm.set("description", `${currentDesc}\nLocation: ${locationText.trim()}`)
      }

      console.log("Finalizing upload with metadata")

      await apiFetch("/api/v1/records/upload", {
        method: "POST",
        body: finalizeForm,
        headers: {},
        auth: true,
      })

      setStatus("Uploaded successfully")
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
      console.error("Upload error:", e)
      setStatus(e.message || "Failed to upload")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6 animate-in fade-in duration-300" onSubmit={onSubmit}>
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

       <div className="grid gap-4 md:grid-cols-2">
         <div className="space-y-2">
           <Label>Select Category *</Label>
           <Select value={selectedCategory} onValueChange={setSelectedCategory}>
             <SelectTrigger>
               <SelectValue placeholder="-- Select a category --" />
             </SelectTrigger>
             <SelectContent>
               {categories.map((category) => (
                 <SelectItem key={category.id} value={category.id}>
                   {category.name || category.title || `Category ${category.id}`}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
         </div>
         <div className="space-y-2">
           <Label>Release Rights *</Label>
           <Select value={rights} onValueChange={setRights}>
             <SelectTrigger>
               <SelectValue placeholder="Select rights statement" />
             </SelectTrigger>
             <SelectContent>
               {RIGHTS.map((r, i) => (
                 <SelectItem key={i} value={r.value}>
                   {r.label}
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
          <div className="flex items-center gap-2">
            {!recording ? (
              <Button
                type="button"
                variant="secondary"
                onClick={startRecording}
                className="transition-transform hover:shadow-sm active:scale-95"
              >
                Start Recording
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={stopRecording}
                className="transition-transform hover:shadow-sm active:scale-95"
              >
                Stop Recording
              </Button>
            )}
            <span className="text-sm text-muted-foreground">{recording ? "Recording..." : "Not recording"}</span>
          </div>
          <span aria-live="polite" className="text-sm font-medium text-foreground/80">
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

      

             <Button
         type="submit"
         className="w-full transition-transform duration-200 hover:shadow-md active:scale-95"
         disabled={loading || !title || !desc || !language || !rights || !audioFile || !selectedCategory}
       >
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
