'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function UpdateContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  const handleUpdate = async () => {
    setLoading(true)
    setResult('Updating...')
    try {
      const response = await axios.post('/api/admin/update-content')
      setResult('✅ Update successful: ' + response.data.message)
    } catch (error: any) {
      setResult('❌ Error: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Update Content</h1>

        <div className="glass rounded-lg p-6">
          <p className="text-white mb-4">
            This will update:
          </p>
          <ul className="text-white/70 mb-6 list-disc list-inside">
            <li>Hero section with new slogan and subtitle</li>
            <li>Add Faruk Celep to team if not exists</li>
          </ul>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-6 py-3 bg-gold-500 text-navy-900 font-bold rounded-lg hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Run Update'}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <p className="text-white whitespace-pre-wrap">{result}</p>
            </div>
          )}

          <button
            onClick={() => router.push('/admin/dashboard')}
            className="mt-4 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
