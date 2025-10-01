import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Access your agency dashboard
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-sm normal-case',
              card: 'bg-slate-800/50 backdrop-blur-sm border border-slate-700',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-300',
              socialButtonsBlockButton: 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600',
              formFieldInput: 'bg-slate-700 border-slate-600 text-white',
              formFieldLabel: 'text-gray-300',
              footerActionLink: 'text-primary hover:text-primary/80',
              identityPreviewText: 'text-gray-300',
              formResendCodeLink: 'text-primary hover:text-primary/80',
            }
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}