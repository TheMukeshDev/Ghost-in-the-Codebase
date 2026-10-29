import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, FileArchive, FolderOpen, Loader2, UploadCloud } from 'lucide-react'
import api from '../api/client'
import { getErrorMessage } from '../lib/errors'
import { asRecord, asString } from '../lib/safe'

const MAX_UPLOAD_MB = 100
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.venv',
  'venv',
  '__pycache__',
  'dist',
  'build',
  '.next',
  'target',
  'coverage',
])

type SelectedFile = { file: File; path: string }
type RelativeFile = File & { webkitRelativePath?: string }

const backendConfigured = Boolean(import.meta.env.VITE_API_URL?.trim())
const showBackendWarning = import.meta.env.PROD && !backendConfigured

const relativePathOf = (file: File) => (file as RelativeFile).webkitRelativePath || file.name

const isSkipped = (path: string) =>
  path
    .split('/')
    .slice(1)
    .some((segment) => SKIP_DIRS.has(segment))

export default function Import() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selection, setSelection] = useState('')
  const [dragging, setDragging] = useState(false)
  const busyRef = useRef(false)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const begin = () => {
    if (busyRef.current) return false
    busyRef.current = true
    setLoading(true)
    setError('')
    return true
  }

  const end = () => {
    busyRef.current = false
    setLoading(false)
  }

  const postArchive = async (archive: File, label: string) => {
    setSelection(label)
    const form = new FormData()
    form.append('file', archive)
    const resp = await api.post('/repositories/upload', form)
    const id = asString(asRecord(resp.data).id)
    if (!id) {
      throw new Error('The server did not return a repository id. Make sure the Flask backend is running.')
    }
    navigate(`/dashboard/${encodeURIComponent(id)}`)
  }

  const uploadZip = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Please choose a .zip archive of the repository.')
      return
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`Archive is too large (max ${MAX_UPLOAD_MB} MB).`)
      return
    }
    if (!begin()) return
    try {
      await postArchive(file, file.name)
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed.'))
    } finally {
      end()
    }
  }

  const uploadFolder = async (selected: SelectedFile[]) => {
    const usable = selected.filter(
      ({ file, path }) => file.size > 0 && !file.name.startsWith('.') && !isSkipped(path),
    )
    if (!usable.length) {
      setError('That folder did not contain any readable files.')
      return
    }
    const totalBytes = usable.reduce((sum, { file }) => sum + file.size, 0)
    if (totalBytes > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`Folder is too large (max ${MAX_UPLOAD_MB} MB).`)
      return
    }
    if (!begin()) return
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      for (const { file, path } of usable) {
        zip.file(path, file)
      }
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
      const root = usable[0].path.includes('/') ? usable[0].path.split('/')[0] : 'repository'
      await postArchive(
        new File([blob], `${root}.zip`, { type: 'application/zip' }),
        `${usable.length} files`,
      )
    } catch (err) {
      setError(getErrorMessage(err, 'Could not package the selected folder.'))
    } finally {
      end()
    }
  }

  const handleFolderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return
    try {
      void uploadFolder(files.map((file) => ({ file, path: relativePathOf(file) })))
    } catch (err) {
      setError(getErrorMessage(err, 'Could not read the selected folder.'))
    }
  }

  const handleZipChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) void uploadZip(file)
  }

  const collectEntry = async (entry: any, prefix: string, out: SelectedFile[]): Promise<void> => {
    if (entry.isFile) {
      await new Promise<void>((resolve) => {
        entry.file(
          (file: File) => {
            out.push({ file, path: `${prefix}${entry.name}` })
            resolve()
          },
          () => resolve(),
        )
      })
    } else if (entry.isDirectory) {
      const reader = entry.createReader()
      while (true) {
        const batch: any[] = await new Promise((resolve) =>
          reader.readEntries(resolve, () => resolve([])),
        )
        if (!batch.length) break
        for (const child of batch) await collectEntry(child, `${prefix}${entry.name}/`, out)
      }
    }
  }

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    if (busyRef.current) return
    try {
      const items = Array.from(event.dataTransfer.items ?? [])
      const entries: any[] = []
      for (const item of items) {
        const entry = (item as any).webkitGetAsEntry?.()
        if (entry) entries.push(entry)
      }

      if (entries.length === 1 && entries[0].isFile) {
        const file = await new Promise<File>((resolve, reject) => entries[0].file(resolve, reject))
        await uploadZip(file)
        return
      }

      const selected: SelectedFile[] = []
      for (const entry of entries) await collectEntry(entry, '', selected)
      if (selected.length) {
        await uploadFolder(selected)
        return
      }

      if (event.dataTransfer.files.length) {
        const file = event.dataTransfer.files[0]
        if (file.name.toLowerCase().endsWith('.zip')) await uploadZip(file)
        else setError('Drop a repository folder or a .zip archive.')
        return
      }

      setError('Drop a repository folder or a .zip archive.')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not read the dropped item.'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <FolderOpen className="w-12 h-12 text-ghost-cyan mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Import Repository</h1>
          <p className="text-gray-400">Choose a folder from your computer or upload a .zip archive</p>
        </div>

        {showBackendWarning && (
          <div
            role="status"
            className="mb-4 rounded border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
          >
            This deployment has no backend URL configured. Set{' '}
            <code className="font-mono">VITE_API_URL</code> to a running Flask backend, or run it
            locally at http://localhost:5000.
          </div>
        )}

        <div
          onDragEnter={(event) => {
            event.preventDefault()
            if (!busyRef.current) setDragging(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            if (!busyRef.current) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          aria-busy={loading}
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragging ? 'border-ghost-cyan bg-ghost-cyan/5' : 'border-gray-700 bg-ghost-midnight'
          }`}
        >
          <UploadCloud className="w-10 h-10 text-ghost-violet mx-auto mb-3" />
          <p className="text-gray-300 mb-1">Drag &amp; drop a repository folder or .zip here</p>
          <p className="text-sm text-gray-500 mb-6">Files are analyzed locally by the backend</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-ghost-cyan to-ghost-violet text-black px-5 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-50"
            >
              <FolderOpen className="w-4 h-4" /> Browse Folder
            </button>
            <button
              type="button"
              onClick={() => zipInputRef.current?.click()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 border border-gray-600 px-5 py-2 rounded font-semibold text-gray-200 hover:border-ghost-cyan hover:text-ghost-cyan disabled:opacity-50"
            >
              <FileArchive className="w-4 h-4" /> Upload .zip
            </button>
          </div>

          <input
            ref={folderInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFolderChange}
            {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
          />
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={handleZipChange}
          />

          <p className="text-xs text-gray-500 mt-6">
            The analysis backend must be running at http://localhost:5000.
          </p>
        </div>

        <div aria-live="polite">
          {loading && (
            <div className="mt-4 flex items-center gap-2 text-ghost-cyan text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing {selection || 'repository'}…</span>
            </div>
          )}

          {error && (
            <div role="alert" className="mt-4 flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-ghost-cyan"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
