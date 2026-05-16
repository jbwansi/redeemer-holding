import React from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const DatabaseBackup = () => {
  const handleDownload = async () => {
    try {
      const response = await fetch('/admin/database/export', {
        method: 'GET',
        headers: {
          Accept: 'application/octet-stream',
        },
      });
      if (!response.ok) throw new Error('Backup failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'database-backup.sql';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Erreur lors de la sauvegarde.');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Head title="Sauvegarde de la base de données" />
      <h1 className="text-2xl font-bold mb-4">Sauvegarde de la base de données</h1>
      <p className="mb-6">
        Cliquez sur le bouton ci-dessous pour télécharger une sauvegarde locale de la base de
        données.
      </p>
      <Button onClick={handleDownload}>
        Télécharger la sauvegarde
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
};

export default DatabaseBackup;
