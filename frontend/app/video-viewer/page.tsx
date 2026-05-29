'use client'
import { useState, useRef } from 'react'

export default function VideoViewer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds
      setCurrentTime(seconds)
    }
  }

  return (
    <div style={{ padding: 20, background: '#000', minHeight: '100vh' }}>
      <video
        ref={videoRef}
        src="/POS_CAFE.mp4"
        controls
        style={{ width: '100%', maxHeight: '80vh' }}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration)
        }}
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
        }}
      />
      <div style={{ color: 'white', padding: '16px 0', fontSize: 14 }}>
        <div>Duration: {Math.round(duration)}s | Current: {Math.round(currentTime)}s</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {[0, 5, 10, 15, 20, 30, 45, 60, 90, 120, 150, 180, 210, 240].map(t => (
            <button key={t} onClick={() => seekTo(t)} style={{
              padding: '6px 16px', background: '#333', color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13
            }}>
              {t}s
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
