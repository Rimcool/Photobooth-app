const strip = document.getElementById('photoStrip');
let photos = JSON.parse(localStorage.getItem('capturedPhotos') || '[]');

if (photos.length > 0) {
  photos.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    strip.appendChild(img);
  });
} else {
  strip.innerHTML = '<p>No photos yet! 📸</p>';
}

document.getElementById('retake').onclick = () => {
  localStorage.removeItem('capturedPhotos');
  window.electronAPI.navigate('capture');
};

document.getElementById('save').onclick = () => {
  window.electronAPI.savePhotos(photos);
  window.electronAPI.onPhotosSaved((paths) => {
    alert(`Photos saved in /photos folder! Paths: ${paths.join(', ')} 🎉`);
  });
};

document.getElementById('share').onclick = () => {
  // Simple share: save first, then copy first photo to clipboard (user pastes in chat/social)
  // For now we save first and show where files were saved.
  window.electronAPI.savePhotos(photos);
  window.electronAPI.onPhotosSaved((paths) => {
    alert(`Saved! Share these files from your photos folder:\n${paths.join('\n')}`);
  });
};

document.getElementById('print').onclick = async () => {
  await window.electronAPI.printPhotos(photos);
  alert('Sending to printer... 🖨️');
};