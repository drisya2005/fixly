import { useState, useEffect, useRef } from 'react'
import { reviewAPI } from '../api'

/**
 * ReviewForm — modal for submitting a review on a completed booking.
 * Props:
 *   booking   — { id, worker_id, worker_name, service_type }
 *   user      — logged-in user object
 *   onClose   — called when user cancels or closes
 *   onSuccess — called after successful submission
 */
function ReviewForm({ booking, user, onClose, onSuccess }) {
  const [stars, setStars] = useState(0)
  const [hoverStar, setHoverStar] = useState(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState([])          // up to 2 image Files
  const [imagePreviews, setImagePreviews] = useState([])
  const [video, setVideo] = useState(null)          // 1 mp4 File or null
  const [videoPreview, setVideoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  // Revoke object URLs on unmount to free memory
  useEffect(() => {
    return () => {
      imagePreviews.forEach((p) => URL.revokeObjectURL(p.url))
      if (videoPreview) URL.revokeObjectURL(videoPreview)
    }
  }, [])

  // ── Image upload ────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files)
    e.target.value = '' // allow re-selecting the same file

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    for (const file of selected) {
      if (!validTypes.includes(file.type)) {
        setError(`"${file.name}" is not a valid image. Use JPG or PNG.`)
        return
      }
    }

    if (images.length + selected.length > 2) {
      setError('You can upload at most 2 images.')
      return
    }

    const previews = selected.map((f) => ({ url: URL.createObjectURL(f), name: f.name }))
    setImages((prev) => [...prev, ...selected])
    setImagePreviews((prev) => [...prev, ...previews])
    setError('')
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index].url)
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Video upload ────────────────────────────────────────────────
  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return

    if (file.type !== 'video/mp4') {
      setError('Only MP4 videos are supported.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Video must be under 5 MB.')
      return
    }

    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideo(file)
    setVideoPreview(URL.createObjectURL(file))
    setError('')
  }

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideo(null)
    setVideoPreview(null)
  }

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (stars === 0) {
      setError('Please select a star rating.')
      return
    }
    if (!comment.trim()) {
      setError('Please write a review comment.')
      return
    }

    setLoading(true)
    setError('')

    // Pass images first, then video (if any) as the files array
    const allFiles = [...images, ...(video ? [video] : [])]

    const result = await reviewAPI.submitReview(
      user.id,
      booking.worker_id,
      booking.id,
      stars,
      comment.trim(),
      allFiles
    )

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || 'Failed to submit review. Please try again.')
    }
    setLoading(false)
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.6)', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'white', borderRadius: '12px', padding: '30px',
        width: '90%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Write a Review</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#666' }}
          >
            ✕
          </button>
        </div>

        <p style={{ color: '#666', marginBottom: '20px' }}>
          Worker: <strong>{booking.worker_name}</strong>
          &nbsp;|&nbsp;
          Service: <strong>{booking.service_type}</strong>
        </p>

        {/* Star Rating */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: '600', display: 'block', marginBottom: '10px' }}>
            Rating <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                onClick={() => setStars(s)}
                onMouseEnter={() => setHoverStar(s)}
                onMouseLeave={() => setHoverStar(0)}
                style={{
                  fontSize: '38px', cursor: 'pointer',
                  color: s <= (hoverStar || stars) ? '#ffc107' : '#ddd',
                  transition: 'color 0.1s',
                  userSelect: 'none',
                }}
              >
                ★
              </span>
            ))}
            {stars > 0 && (
              <span style={{ color: '#666', fontSize: '14px', marginLeft: '6px' }}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][stars]}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
            Review <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe your experience with this worker..."
            rows={4}
            style={{
              width: '100%', padding: '10px', border: '2px solid #e0e0e0',
              borderRadius: '8px', fontSize: '14px', resize: 'vertical',
              boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Image Upload */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
            Photos (optional, max 2 — JPG / PNG)
          </label>
          <input
            type="file"
            ref={imageInputRef}
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => imageInputRef.current.click()}
            disabled={images.length >= 2}
            style={{ marginBottom: '10px' }}
          >
            + Add Photos ({images.length}/2)
          </button>

          {imagePreviews.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ position: 'relative', width: '90px', height: '90px' }}>
                  <img
                    src={preview.url}
                    alt={preview.name}
                    style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #e0e0e0' }}
                  />
                  <button
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute', top: '-8px', right: '-8px',
                      background: '#dc3545', color: 'white', border: 'none',
                      borderRadius: '50%', width: '22px', height: '22px',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Upload */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
            Video (optional, 1 MP4, max 5 MB)
          </label>
          <input
            type="file"
            ref={videoInputRef}
            accept="video/mp4"
            onChange={handleVideoChange}
            style={{ display: 'none' }}
          />
          {!video ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => videoInputRef.current.click()}
            >
              + Add Video
            </button>
          ) : (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <video
                src={videoPreview}
                controls
                style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '8px', border: '2px solid #e0e0e0' }}
              />
              <button
                onClick={removeVideo}
                style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  background: '#dc3545', color: 'white', border: 'none',
                  borderRadius: '50%', width: '22px', height: '22px',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {error && <div className="error">{error}</div>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReviewForm