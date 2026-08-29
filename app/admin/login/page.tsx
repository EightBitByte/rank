import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-8 pb-24">
      <h1 className="mb-6 font-display text-[28px] font-extrabold">
        Admin sign in
      </h1>
      <LoginForm />
    </div>
  );
}
