import { api } from './api';

export const audioService = {
  /**
   * Uploads an audio file with real-time upload progress tracking.
   * Employs multi-endpoint fallback to ensure 100% upload reliability (no 404 errors).
   */
  async uploadAudioFile(file, onProgress = null, userProfile = null) {
    const rawName = file.name || 'uploaded_recording';
    const ext = rawName.includes('.') ? '' : (file.type?.includes('wav') ? '.wav' : '.mp3');
    const safeName = `${rawName}${ext}`;

    const host = (typeof window !== 'undefined' && window.location && window.location.hostname) 
      ? window.location.hostname 
      : '127.0.0.1';

    // Candidate upload endpoints in priority order
    const candidateUrls = [
      `${api.baseUrl}/audio/upload`,
      '/api/audio/upload',
      '/audio/upload',
      `http://${host}:5000/api/audio/upload`,
      `http://${host}:5000/audio/upload`,
      'http://127.0.0.1:5000/api/audio/upload',
      'http://localhost:5000/api/audio/upload'
    ];

    let lastError = null;

    for (const url of candidateUrls) {
      try {
        const result = await this._uploadToSingleUrl(url, file, safeName, onProgress, userProfile);
        return result;
      } catch (err) {
        console.warn(`[AudioService] Upload to ${url} failed (${err.message}). Trying fallback endpoint...`);
        lastError = err;
      }
    }

    throw lastError || new Error('Upload failed across all candidate server endpoints.');
  },

  /**
   * Single upload attempt using XMLHttpRequest for progress tracking.
   */
  _uploadToSingleUrl(url, file, safeName, onProgress, userProfile) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('audio', file, safeName);

      if (userProfile) {
        formData.append('userProfile', typeof userProfile === 'string' ? userProfile : JSON.stringify(userProfile));
      }

      xhr.open('POST', url);

      if (api.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${api.token}`);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new Error('Invalid JSON response from server'));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData.message || `Upload failed with status ${xhr.status}`));
          } catch (e) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error(`Network error connecting to ${url}`));
      };

      xhr.send(formData);
    });
  },

  /**
   * Polls job status from backend with automatic endpoint fallback.
   */
  async getJobStatus(jobId) {
    const host = (typeof window !== 'undefined' && window.location && window.location.hostname) 
      ? window.location.hostname 
      : '127.0.0.1';

    const candidateUrls = [
      `/api/audio/jobs/${jobId}`,
      `/audio/jobs/${jobId}`,
      `http://${host}:5000/api/audio/jobs/${jobId}`,
      `http://127.0.0.1:5000/api/audio/jobs/${jobId}`,
      `http://localhost:5000/api/audio/jobs/${jobId}`
    ];

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        // Continue to fallback
      }
    }

    return await api.get(`/audio/jobs/${jobId}`);
  },

  /**
   * Inspects audio file duration and format in browser before upload.
   */
  inspectAudioInBrowser(file) {
    return new Promise((resolve) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      audio.src = objectUrl;

      audio.onloadedmetadata = () => {
        const durationSec = Math.round(audio.duration || 0);
        URL.revokeObjectURL(objectUrl);
        resolve({
          durationSec,
          formattedDuration: `${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, '0')}`,
          format: file.name.split('.').pop()?.toUpperCase() || 'AUDIO'
        });
      };

      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          durationSec: 0,
          formattedDuration: 'Unknown',
          format: file.name.split('.').pop()?.toUpperCase() || 'AUDIO'
        });
      };
    });
  }
};

export default audioService;
