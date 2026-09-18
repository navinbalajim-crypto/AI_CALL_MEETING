import { api } from './api';

export const audioService = {
  /**
   * Uploads an audio file with real-time upload progress tracking.
   */
  uploadAudioFile(file, onProgress = null, userProfile = null) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      const rawName = file.name || 'uploaded_recording';
      const ext = rawName.includes('.') ? '' : (file.type?.includes('wav') ? '.wav' : '.mp3');
      const safeName = `${rawName}${ext}`;
      formData.append('audio', file, safeName);

      if (userProfile) {
        formData.append('userProfile', JSON.stringify(userProfile));
      }

      xhr.open('POST', `${api.baseUrl}/audio/upload`);

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
        reject(new Error('Network error during audio upload.'));
      };

      xhr.send(formData);
    });
  },

  /**
   * Polls job status from backend.
   */
  async getJobStatus(jobId) {
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
