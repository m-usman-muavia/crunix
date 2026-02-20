import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBox, faUsers, faClock, faImage, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import '../css/style.css';
import API_BASE_URL from '../../config/api';

const DashboardImage = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const parseJsonSafe = async (res) => {
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { message: text }; }
  };

  const fetchImages = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/dashboard-image', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await parseJsonSafe(response);

      if (!response.ok) {
        setError(data.message || 'Failed to fetch dashboard images');
        return;
      }

      setImages(data?.data?.images || []);
    } catch (err) {
      setError(`Error fetching images: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl('');
      return;
    }

    const localUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(localUrl);

    return () => URL.revokeObjectURL(localUrl);
  }, [selectedImage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/auth/admin/dashboard-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });
      const data = await parseJsonSafe(response);

      if (!response.ok) {
        setError(data.message || 'Failed to add dashboard image');
        return;
      }

      setMessage('Image added successfully');
      setSelectedImage(null);
      setImages(data?.data?.images || []);
    } catch (err) {
      setError(`Error adding image: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;

    setDeleting(imageId);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`/api/auth/admin/dashboard-image/${imageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await parseJsonSafe(response);

      if (!response.ok) {
        setError(data.message || 'Failed to delete image');
        return;
      }

      setMessage('Image deleted successfully');
      setImages(data?.data?.images || []);
    } catch (err) {
      setError(`Error deleting image: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
        <header className="plan-header">
          <div className="plan-avatar"><FontAwesomeIcon icon={faImage} /></div>
          <div className="plan-user-info">
            <h4 className="plan-username">Dashboard Images</h4>
            <p className="plan-email">Manage homepage slider images</p>
          </div>
        </header>

        <div className="section" style={{ padding: '20px' }}>
          <div className="withdrawal-card">
            <h3 style={{ marginTop: 0 }}>Add New Image</h3>

            {error ? <p style={{ color: 'red' }}>{error}</p> : null}
            {message ? <p style={{ color: 'green' }}>{message}</p> : null}

            <form onSubmit={handleSubmit}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                style={{ marginBottom: '12px' }}
              />

              {previewUrl ? (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ marginBottom: '8px' }}><strong>Preview</strong></p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '10px' }}
                  />
                </div>
              ) : null}

              <button type="submit" className="section-button" disabled={saving}>
                {saving ? 'Uploading...' : 'Add Image'}
              </button>
            </form>
          </div>
        </div>

        <div className="section" style={{ padding: '20px' }}>
          <div className="withdrawal-card">
            <h3 style={{ marginTop: 0 }}>Slider Images ({images.length})</h3>

            {loading ? (
              <p>Loading images...</p>
            ) : images.length === 0 ? (
              <p>No images yet. Add one above to get started.</p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px'
              }}>
                {images.map((img) => (
                  <div
                    key={img._id}
                    style={{
                      position: 'relative',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      backgroundColor: '#f0f0f0'
                    }}
                  >
                    <img
                      src={img.image_path}
                      alt="Slider"
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 0.7',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      onClick={() => handleDelete(img._id)}
                      disabled={deleting === img._id}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(255, 0, 0, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        cursor: deleting === img._id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px'
                      }}
                      title="Delete image"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="bottom-nav">
          <div className="nav-item">
            <Link to="/admin/" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faHouse} />
              <span>Dashboard</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/admin/addplans" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faBox} />
              <span>Add Plans</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/admin/users" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faUsers} />
              <span>Users</span>
            </Link>
          </div>
          <div className="nav-item">
            <Link to="/admin/accrual-history" className="link-bold nav-link-col">
              <FontAwesomeIcon icon={faClock} />
              <span>Accruals</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default DashboardImage;
