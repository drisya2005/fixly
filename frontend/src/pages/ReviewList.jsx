import { useState, useEffect } from 'react'
import { reviewAPI } from '../api'

/**
 * ReviewList — displays all reviews for a specific worker.
 * Props:
 *   workerId — the worker's ID
 */
function ReviewList({ workerId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedImage, setExpandedImage] = useState(null) // full-screen image preview

  useEffect(() => {
    const fetchReviews = async () => {
      const result = await reviewAPI.getWorkerReviews(workerId)
      if (result.success) {
        setReviews(result.data.reviews || [])
      }
      setLoading(false)
    }
    fetchReviews()
  }, [workerId])

  // Render gold/grey star icons
  const renderStars = (count, size = '18px') => {
    return [1, 2, 3, 4, 5].map((i) => (
      <span key={i} style={{ color: i <= count ? '#ffc107' : '#ddd', fontSize: size }}>
        ★
      </span>
    ))
  }

  // Average rating summary
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
      : null

  if (loading) return <div className="loading">Loading reviews...</div>

  return (
    <div>
      {/* Summary bar */}
      {reviews.length > 0 && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '16px', background: '#fffbea',
            border: '1px solid #ffd43b', borderRadius: '8px', marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '32px', fontWeight: '700', color: '#e6a800' }}>{avgRating}</span>
          <div>
            <div style={{ display: 'flex', gap: '2px' }}>{renderStars(Math.round(avgRating), '22px')}</div>
            <div style={{ color: '#666', fontSize: '13px', marginTop: '2px' }}>
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Review cards */}
      {reviews.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
          No reviews yet. Be the first to review this worker!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                padding: '20px', border: '1px solid #e0e0e0',
                borderRadius: '10px', background: 'white',
              }}
            >
              {/* Top row: stars + name + date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                    {renderStars(review.stars)}
                  </div>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{review.user_name}</span>
                </div>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
              </div>

              {/* Review text */}
              {review.comment && (
                <p style={{ color: '#444', fontSize: '14px', lineHeight: '1.6', margin: '0 0 12px' }}>
                  {review.comment}
                </p>
              )}

              {/* Media grid */}
              {review.media_paths && review.media_paths.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {review.media_paths.map((filename, i) => {
                    const url = reviewAPI.getFileUrl(filename)
                    const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(filename)
                    return isVideo ? (
                      <video
                        key={i}
                        src={url}
                        controls
                        style={{
                          maxWidth: '220px', maxHeight: '160px',
                          borderRadius: '8px', border: '1px solid #e0e0e0',
                        }}
                      />
                    ) : (
                      <img
                        key={i}
                        src={url}
                        alt={`Review photo ${i + 1}`}
                        onClick={() => setExpandedImage(url)}
                        style={{
                          width: '100px', height: '100px', objectFit: 'cover',
                          borderRadius: '8px', border: '1px solid #e0e0e0',
                          cursor: 'pointer', transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Full-screen image lightbox */}
      {expandedImage && (
        <div
          onClick={() => setExpandedImage(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', zIndex: 3000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={expandedImage}
            alt="Full size"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  )
}

export default ReviewList