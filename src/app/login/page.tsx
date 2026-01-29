import LoginForm from './login-form';

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F3F4FF]">
            <div className="w-full max-w-[450px] p-4">
                <LoginForm />
            </div>
        </main>
    );
}
