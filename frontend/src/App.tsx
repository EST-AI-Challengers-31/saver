import { FormEvent, useEffect, useState } from 'react'

type StatusResponse = {
  backend: string
  database: string
  databaseTables: number
  ai: string
}

type CheckResponse = {
  appName: string
  level: 'HIGH' | 'UNKNOWN'
  message: string
  evidence?: string | null
}

const badgeClass = (value: string) => value === 'UP' ? 'badge up' : 'badge down'

export default function App() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [statusError, setStatusError] = useState('')
  const [appName, setAppName] = useState('oo cleaner')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<CheckResponse | null>(null)

  const loadStatus = async () => {
    try {
      setStatusError('')
      const response = await fetch('/api/system/status')
      if (!response.ok) throw new Error('상태 조회 실패')
      setStatus(await response.json())
    } catch {
      setStatusError('서버 상태를 확인할 수 없습니다.')
    }
  }

  useEffect(() => { loadStatus() }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!appName.trim()) return
    setChecking(true)
    try {
      const response = await fetch('/api/demo/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName: appName.trim() })
      })
      setResult(await response.json())
    } finally {
      setChecking(false)
    }
  }

  return (
    <main className="page-shell">
      <section className="phone">
        <header className="topbar">
          <div>
            <p className="eyebrow">가족이 함께 지키는 스마트폰</p>
            <h1>닿음</h1>
          </div>
          <button className="icon-button" onClick={loadStatus} aria-label="새로고침">↻</button>
        </header>

        <section className="hero-card">
          <div className="hero-icon">🛡️</div>
          <div>
            <p className="hero-kicker">배포 확인용 MVP</p>
            <h2>화면 · Spring · DB 연결을<br/>한 번에 확인해요.</h2>
            <p>지금은 로그인/OCR/RAG 대신 배포와 MariaDB 연결 여부를 빠르게 검증하는 화면입니다.</p>
          </div>
        </section>

        <section className="section">
          <div className="section-title-row">
            <h3>서비스 상태</h3>
            <span className="small">yellow.it.kr 배포 점검</span>
          </div>
          {statusError && <div className="alert error">{statusError}</div>}
          <div className="status-grid">
            <article className="status-card">
              <span>Spring Boot</span>
              <strong className={badgeClass(status?.backend ?? 'DOWN')}>{status?.backend ?? '확인 중'}</strong>
            </article>
            <article className="status-card">
              <span>MariaDB</span>
              <strong className={badgeClass(status?.database ?? 'DOWN')}>{status?.database ?? '확인 중'}</strong>
              <small>{status ? `${status.databaseTables} tables` : 'DB 연결 확인'}</small>
            </article>
            <article className="status-card">
              <span>FastAPI</span>
              <strong className={badgeClass(status?.ai ?? 'DOWN')}>{status?.ai ?? '확인 중'}</strong>
            </article>
          </div>
        </section>

        <section className="section check-card">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">DB 데모 검사</p>
              <h3>앱 이름을 확인해보세요</h3>
            </div>
          </div>
          <form onSubmit={submit}>
            <label htmlFor="appName">앱 이름 또는 패키지명</label>
            <div className="input-row">
              <input id="appName" value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="예: oo cleaner" />
              <button type="submit" disabled={checking}>{checking ? '확인 중' : '검사'}</button>
            </div>
          </form>
          <p className="hint">`oo cleaner` 또는 `com.demo.cleaner.bad`는 합성 데모 DB에 등록되어 있습니다.</p>
          {result && (
            <div className={`result ${result.level.toLowerCase()}`}>
              <div className="result-head">
                <strong>{result.level === 'HIGH' ? '위험 정보 확인' : '확인되지 않은 앱'}</strong>
                <span>{result.level}</span>
              </div>
              <p>{result.message}</p>
              {result.evidence && <small>근거: {result.evidence}</small>}
            </div>
          )}
        </section>

        <section className="section family-card">
          <div>
            <p className="eyebrow">다음 구현</p>
            <h3>부모님과 함께 확인하기</h3>
            <p>배포가 확인되면 카카오/구글 로그인, 가족 연결, 이미지 업로드, OCR/RAG를 순서대로 붙입니다.</p>
          </div>
          <div className="family-avatars"><span>나</span><span>부모</span></div>
        </section>

        <footer className="bottom-nav">
          <span className="active">⌂<small>홈</small></span>
          <span>♧<small>가족</small></span>
          <span>◷<small>기록</small></span>
          <span>○<small>MY</small></span>
        </footer>
      </section>
    </main>
  )
}
