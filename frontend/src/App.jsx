import { useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Header from './components/Header'
import Hero from './components/Hero'
import UploadZone from './components/UploadZone'
import SampleGallery from './components/SampleGallery'
import ResultCard from './components/ResultCard'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import ProjectSwitch from './components/ProjectSwitch'
import { PROJECTS } from './constants'
import {
  fetchProjectConfig,
  fetchProjectSamples,
  fetchProjectSampleFile,
  predictProjectImage,
} from './api'

export default function App() {
  const [projectId, setProjectId] = useState('potato')
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

  const project = PROJECTS[projectId]

  function selectProject(id) {
    if (id === projectId) return
    requestRef.current += 1
    setProjectId(id)
    setConfig(null)
    setSamples([])
    setBackendOnline(null)
    setStatus('idle')
    setResult(null)
    setError('')
    setPendingSample('')
    setPreviewUrl('')
  }

  useEffect(() => {
    let cancelled = false

    const requests = [fetchProjectConfig(projectId)]
    if (project.hasSamples) requests.push(fetchProjectSamples(projectId))

    Promise.allSettled(requests).then(([configResult, samplesResult]) => {
      if (cancelled) return
      if (configResult.status === 'fulfilled') {
        setConfig(configResult.value)
        setBackendOnline(true)
      } else {
        setBackendOnline(false)
      }
      if (samplesResult && samplesResult.status === 'fulfilled') {
        setSamples(samplesResult.value)
      }
    })

    return () => {
      cancelled = true
    }
  }, [projectId, project.hasSamples])

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
      const data = await predictProjectImage(projectId, file)
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
      const file = await fetchProjectSampleFile(projectId, name)
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
      <Header project={project} modelName={config?.model_name}>
        <ProjectSwitch
          value={projectId}
          onChange={selectProject}
          disabled={status === 'loading'}
        />
      </Header>

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
                ./start-demo.sh
              </code>
            </p>
          </div>
        </div>
      )}

      <main>
        <Hero project={project} />

        <section id="try" className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <UploadZone
                onFile={analyze}
                disabled={status === 'loading'}
                backendOnline={backendOnline}
                project={project}
              />
              {project.hasSamples && (
                <SampleGallery
                  samples={samples}
                  onSelect={handleSampleSelect}
                  disabled={status === 'loading'}
                  pendingSample={pendingSample}
                  project={project}
                />
              )}
            </div>
            <div ref={resultRef} className="lg:sticky lg:top-24">
              <ResultCard
                status={status}
                result={result}
                error={error}
                previewUrl={previewUrl}
                onReset={handleReset}
                project={project}
              />
            </div>
          </div>
        </section>

        <AboutSection project={project} />
      </main>

      <Footer project={project} />
    </div>
  )
}
