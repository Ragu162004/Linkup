const uploadFile = async (file) => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = 'chat-app-file';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  try {
    if (!file) throw new Error('No file provided for upload.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cloudinary Upload Error:', data);
      throw new Error(data?.error?.message || 'Upload failed');
    }

    return data;
  } catch (error) {
    console.error('Upload failed:', error.message || error);
    throw error;
  }
};

export default uploadFile;
