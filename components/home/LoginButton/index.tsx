import { GithubIcon } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function LoginButton() {
  return (
    <div className="space-y-6">
      <Button onClick={() => signIn('github')} className="h-11 px-6 text-base" variant="secondary">
        <GithubIcon className="mr-2 h-5 w-5" />
        使用 GitHub 登录
      </Button>
    </div>
  );
}
