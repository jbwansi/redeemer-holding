import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import QuillEditor from '@/components/ui/quill-editor';
import { Loader2 } from 'lucide-react';
import { useForm } from '@inertiajs/react';

const CreatePage = () => {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    content: '',
    status: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('pages.store'));
  };

  return (
    <div className=" mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Créer une Page</h1>
        <p className="text-muted-foreground">Créez une nouvelle page.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                />
                {errors.title && <p className="text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Visibilité</h3>
                  <p className="text-sm text-muted-foreground">
                    Permettre la publication de cette page.
                  </p>
                </div>
                <Switch
                  checked={data.status}
                  onCheckedChange={(checked) => setData('status', checked)}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={processing} className="text-white">
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer la Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card>
            <CardContent>
              <div>
                <Label htmlFor="content">Contenu</Label>
                <QuillEditor
                  value={data.content}
                  className="[&>.ql-container_.ql-editor]:min-h-[250px] rounded-md"
                  onChange={(value) => setData('content', value)}
                />
                {errors.content && <p className="text-red-500 mt-1">{errors.content}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default CreatePage;
