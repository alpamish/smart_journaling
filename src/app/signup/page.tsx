import SignUpForm from './signup-form';

export default function SignUpPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F3F4FF]">
            <div className="w-full max-w-[450px] p-4">
                <SignUpForm />
            </div>
        </main>
    );
}
