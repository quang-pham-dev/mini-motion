import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { APP_CONFIG } from '@/config';
import { Loader2, Sparkles } from 'lucide-react';

interface InputSectionProps {
  title: string;
  setTitle: (title: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  error: string | null;
  isGenerating: boolean;
  onGenerateScript: () => void;
}

export function InputSection({
  title,
  setTitle,
  inputText,
  setInputText,
  error,
  isGenerating,
  onGenerateScript,
}: InputSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Text</CardTitle>
        <CardDescription>
          Enter your book summary, blog post, or any content to transform into a video
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            placeholder="Enter a title for your project"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder={`Paste your text here (minimum ${APP_CONFIG.MIN_SCRIPT_LENGTH} characters)...`}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={12}
            className="resize-none"
          />
          <p className="text-right text-sm text-gray-500">{inputText.length} characters</p>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          className="w-full"
          onClick={onGenerateScript}
          disabled={isGenerating || !inputText.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Script...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Script
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
