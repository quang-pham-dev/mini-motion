import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { FullscreenMessage } from './fullscreen-message';

export interface SignInPromptProps {
  onSignIn: () => void;
  title?: string;
  description?: string;
  subtitle?: string;
}

export function SignInPrompt({
  onSignIn,
  title = 'Sign In Required',
  description = 'Please sign in to continue',
  subtitle,
}: SignInPromptProps) {
  return (
    <FullscreenMessage>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subtitle && <p className="text-center text-gray-600">{subtitle}</p>}
          <Button className="w-full" onClick={onSignIn}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    </FullscreenMessage>
  );
}
