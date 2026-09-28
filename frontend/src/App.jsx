import { useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Header from './components/Header'
import Hero from './components/Hero'
import UploadZone from './components/UploadZone'
import SampleGallery from './components/SampleGallery'
import ResultCard from './components/ResultCard'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import { fetchConfig, fetchSamples, fetchSampleFile, predictImage } from './api'

export default function App() {
  const [config, setConfig] = useState(null)
  const [samples, setSamples] = useState([])
  const [backendOnline, setBackendOnline] = useState(null)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [pendingSample, setPendingSample] = useState('')
  const requestRef = useRef(0)
  const resultRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([fetchConfig(), fetchSamples()]).then(
      ([configResult, samplesResult]) => {
        if (cancelled) return
        if (configResult.status === 'fulfilled') {
          setConfig(configResult.value)
          setBackendOnline(true)
        } else {
          setBackendOnline(false)
        }
        if (samplesResult.status === 'fulfilled') {
          setSamples(samplesResult.value)
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  async function analyze(file, sampleName = '') {
    const requestId = requestRef.current + 1
    requestRef.current = requestId
    setStatus('loading')
    setError('')
    setResult(null)
    setPendingSample(sampleName)
    setPreviewUrl(URL.createObjectURL(file))
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    try {
      const data = await predictImage(file)
      if (requestRef.current !== requestId) return
      setResult(data)
      setStatus('done')
    } catch (err) {
      if (requestRef.current !== requestId) return
      setError(err.message)
      setStatus('error')
    } finally {
      if (requestRef.current === requestId) setPendingSample('')
    }
  }

  async function handleSampleSelect(name) {
    setPendingSample(name)
    try {
      const file = await fetchSampleFile(name)
      await analyze(file, name)
    } catch (err) {
      setError(err.message)
      setStatus('error')
      setPendingSample('')
    }
  }

  function handleReset() {
    requestRef.current += 1
    setStatus('idle')
    setResult(null)
    setError('')
    setPendingSample('')
    setPreviewUrl('')
  }

  return (
    <div className="min-h-screen">
      <Header modelName={config?.model_name} />

      {backendOnline === false && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>
              The prediction backend is not reachable at{' '}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
                http://localhost:8000
              </code>
              . Start it with{' '}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
                cd backend &amp;&amp; .venv/bin/uvicorn main:app --port 8000
              </code>
            </p>
          </div>
        </div>
      )}

      <main>
        <Hero />

        <section id="try" className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <UploadZone
                onFile={analyze}
                disabled={status === 'loading'}
                backendOnline={backendOnline}
              />
              <SampleGallery
                samples={samples}
                onSelect={handleSampleSelect}
                disabled={status === 'loading'}
                pendingSample={pendingSample}
              />
            </div>
            <div ref={resultRef} className="lg:sticky lg:top-24">
              <ResultCard
                status={status}
                result={result}
                error={error}
                previewUrl={previewUrl}
                onReset={handleReset}
              />
            </div>
          </div>
        </section>

        <AboutSection />
      </main>

      <Footer />
    </div>
  )
}
