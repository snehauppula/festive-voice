"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiFetch } from "@/lib/api"
import { useMe, logout } from "@/lib/auth-store"

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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

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
         
         // Update progress
         const progress = ((chunkIndex + 1) / totalChunks) * 50 // First 50% for chunks
         setUploadProgress(progress)
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
       setUploadProgress(75) // 75% for finalization

       await apiFetch("/api/v1/records/upload", {
         method: "POST",
         body: finalizeForm,
         headers: {},
         auth: true,
       })

       setUploadProgress(100) // Complete
       
       // Show success popup
       setShowSuccessPopup(true)
       
       // Reset form after a delay
       setTimeout(() => {
         setTitle("")
         setDesc("")
         setLocationText("")
         setCoords("")
         setLanguage("")
         setRights("")
         setAudioFile(null)
         if (objectUrl) URL.revokeObjectURL(objectUrl)
         setObjectUrl(null)
         setShowSuccessPopup(false)
         setUploadProgress(0)
       }, 3000)
    } catch (e: any) {
      console.error("Upload error:", e)
      setStatus(e.message || "Failed to upload")
         } finally {
       setLoading(false)
       setUploadProgress(0)
     }
   }

         return (
     <div className="max-w-4xl mx-auto p-6">
               <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Audio Content</h1>
           <p className="text-gray-600">Share your voice recordings with the community</p>
         </div>

        <form className="space-y-8" onSubmit={onSubmit}>
          {/* Basic Information Section */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              Basic Information
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title *</Label>
                <Input 
                  id="title" 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 text-base"
                  placeholder="Enter a descriptive title"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Language *</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l} className="text-base">
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Category Section */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              Content Category
            </h2>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Select Category *</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-base">
                      {category.name || category.title || `Category ${category.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h2 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
              Description
            </h2>
            <div className="space-y-2">
              <Label htmlFor="desc" className="text-sm font-medium text-gray-700">Description *</Label>
              <Textarea 
                id="desc" 
                required 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)}
                className="min-h-24 text-base resize-none"
                placeholder="Describe your audio content in detail..."
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
            <h2 className="text-xl font-semibold text-orange-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
              Location (Optional)
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location Name</Label>
                <Input
                  id="location"
                  placeholder="Village/City/Region"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coords" className="text-sm font-medium text-gray-700">Coordinates</Label>
                <div className="flex gap-2">
                  <Input
                    id="coords"
                    placeholder="17.4575, 78.6681"
                    value={coords}
                    onChange={(e) => setCoords(e.target.value)}
                    className="h-12 text-base"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={useMyLocation}
                    className="h-12 px-4 transition-all hover:bg-orange-100 hover:border-orange-300"
                  >
                    📍 Use My Location
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Section */}
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <h2 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">5</span>
              Audio Content *
            </h2>
            
            {/* Recording Section */}
            <div className="mb-6 p-4 bg-white rounded-lg border border-red-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Record Audio</h3>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {!recording ? (
                    <Button
                      type="button"
                      variant="default"
                      onClick={startRecording}
                      className="h-12 px-6 bg-red-500 hover:bg-red-600 text-white font-medium"
                    >
                      🎙️ Start Recording
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={stopRecording}
                      className="h-12 px-6 font-medium"
                    >
                      ⏹️ Stop Recording
                    </Button>
                  )}
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {recording ? "Recording..." : "Not recording"}
                    </span>
                  </div>
                </div>
                {recording && (
                  <div className="text-2xl font-mono font-bold text-red-600">
                    {Math.floor(elapsed / 60).toString().padStart(2, "0")}:{(elapsed % 60).toString().padStart(2, "0")}
                  </div>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div className="p-4 bg-white rounded-lg border border-red-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">OR Upload Audio File</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                  <Input 
                    id="file" 
                    type="file" 
                    accept="audio/*" 
                    onChange={handleFile}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <div className="text-4xl mb-2">🎵</div>
                    <p className="text-gray-600 mb-1">Click to select audio file</p>
                    <p className="text-sm text-gray-500">MP3, WAV, OGG, WebM, MP4 (max 5MB)</p>
                  </label>
                </div>
                
                {audioFile && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-green-600">✅</span>
                      <span className="font-medium text-green-800">File Selected</span>
                    </div>
                    <p className="text-sm text-green-700 mb-2">Name: {audioFile.name}</p>
                    <p className="text-sm text-green-700 mb-3">Size: {(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    {objectUrl && (
                      <audio controls src={objectUrl} className="w-full" crossOrigin="anonymous" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rights Section */}
          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
            <h2 className="text-xl font-semibold text-yellow-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">6</span>
              Release Rights *
            </h2>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Select Rights Statement</Label>
              <Select value={rights} onValueChange={setRights}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Choose rights statement" />
                </SelectTrigger>
                <SelectContent>
                  {RIGHTS.map((r, i) => (
                    <SelectItem key={i} value={r.value} className="text-base">
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

                     {/* Submit Section */}
           <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-semibold text-gray-900">Ready to Upload</h2>
               <div className="flex items-center gap-2">
                 <div className={`w-3 h-3 rounded-full ${loading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                 <span className="text-sm font-medium text-gray-700">
                   {loading ? "Uploading..." : "Ready"}
                 </span>
               </div>
             </div>
             
             {/* Upload Progress Bar */}
             {loading && (
               <div className="mb-4">
                 <div className="flex justify-between text-sm text-gray-600 mb-2">
                   <span>Upload Progress</span>
                   <span>{Math.round(uploadProgress)}%</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                   <div 
                     className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                     style={{ width: `${uploadProgress}%` }}
                   ></div>
                 </div>
                 <div className="text-xs text-gray-500 mt-1">
                   {uploadProgress <= 50 ? "Uploading file chunks..." : 
                    uploadProgress <= 75 ? "Finalizing upload..." : 
                    "Complete!"}
                 </div>
               </div>
             )}
             
             <Button
               type="submit"
               className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200 hover:shadow-lg active:scale-95"
               disabled={loading || !title || !desc || !language || !rights || !audioFile || !selectedCategory}
             >
               {loading ? (
                 <div className="flex items-center gap-2">
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   Uploading Content...
                 </div>
               ) : (
                 <div className="flex items-center gap-2">
                   <span>🚀</span>
                   Upload Content
                 </div>
               )}
             </Button>

             {status && !showSuccessPopup && (
               <div className={`mt-4 p-4 rounded-lg border animate-in slide-in-from-bottom-2 duration-300 ${
                 status.includes("successfully") || status.includes("Uploaded") 
                   ? "bg-green-50 border-green-200 text-green-800" 
                   : "bg-red-50 border-red-200 text-red-800"
               }`}>
                 <div className="flex items-center gap-2">
                   <span className="text-lg">
                     {status.includes("successfully") || status.includes("Uploaded") ? "✅" : "⚠️"}
                   </span>
                   <span className="font-medium">{status}</span>
                 </div>
               </div>
             )}
           </div>
         </form>
       </div>
       
       {/* Success Popup */}
       {showSuccessPopup && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
           <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-in zoom-in-95 duration-300">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
             </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h3>
             <p className="text-gray-600 mb-6">Your audio content has been uploaded successfully.</p>
                           <div className="flex gap-3">
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Go Home
                </button>
                <button
                  onClick={logout}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
           </div>
         </div>
       )}
     </div>
   )
 }
