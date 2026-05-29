import AuthForm from '@/components/AuthForm';

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 bg-slate-50">
      <AuthForm type="register" />
    </div>
  );
}