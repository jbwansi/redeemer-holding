import React from 'react';

const BackupButton = ({
  onNotify,
}: {
  onNotify?: (msg: string, type?: 'success' | 'error') => void;
}) => {
  const handleBackup = async () => {
    try {
      const res = await fetch('/admin/backup', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN':
            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      if (res.ok) {
        // Download the file
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download =
          res.headers.get('Content-Disposition')?.split('filename=')[1]?.replaceAll('"', '') ||
          'backup.sql';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        onNotify && onNotify('Sauvegarde réussie. Le fichier a été téléchargé.', 'success');
      } else {
        onNotify &&
          onNotify(
            "Erreur lors de la sauvegarde. Vérifiez vos droits ou contactez l'administrateur.",
            'error'
          );
      }
    } catch (e) {
      onNotify && onNotify('Erreur réseau lors de la sauvegarde.', 'error');
    }
  };

  return (
    <button
      onClick={handleBackup}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Sauvegarder / Exporter la base
    </button>
  );
};

export default BackupButton;
