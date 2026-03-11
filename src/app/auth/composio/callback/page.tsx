'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CallbackContent() {
  const params = useSearchParams()
  const status = params.get('status')
  const error = params.get('error')

  const isSuccess = status === 'success'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#030712] text-white">
      {isSuccess ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600/20">
            <svg className="h-7 w-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-200">TikTok connected!</p>
          <p className="text-sm text-slate-500">You can close this window.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-200">Connection failed</p>
          <p className="text-sm text-slate-500">{error ?? 'Please try again.'}</p>
        </div>
      )}
    </div>
  )
}

export default function ComposioCallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  )
}
