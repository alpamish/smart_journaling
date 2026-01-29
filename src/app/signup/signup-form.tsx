'use client';

import { useActionState } from 'react';
import { register } from '@/app/lib/actions';
import Image from 'next/image';

export default function SignUpForm() {
    const [errorMessage, formAction, isPending] = useActionState(register, undefined);

    return (
        <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-12">
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 overflow-hidden rounded-2xl">
                    <Image
                        src="/logo.jpg"
                        alt="Smart Journaling Logo"
                        width={80}
                        height={80}
                        className="object-contain"
                    />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Create account</h1>
                <p className="mt-2 text-sm font-medium text-slate-500">
                    Join Smart Journaling today!
                </p>
            </div>

            <div className="mt-8">
                <form action={formAction} className="space-y-4">
                    <div>
                        <input
                            className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div>
                        <input
                            className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Password"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-700 active:scale-[0.98] aria-disabled:opacity-50"
                        aria-disabled={isPending}
                    >
                        Sign up
                    </button>

                    {errorMessage && (
                        <p className="mt-4 text-center text-sm font-medium text-red-500">
                            {errorMessage}
                        </p>
                    )}
                </form>

                <p className="mt-8 text-center text-sm font-medium text-slate-500">
                    Already have an account?{' '}
                    <a href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
}
