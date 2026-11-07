import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Refrigerator, Copy } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthContext } from "@/hooks/useAuthContext"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"

function Login() {

    const [copied, setCopied] = useState("");
    const [copyError, setCopyError] = useState("");
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (!copied) return;

        const timeoutId = window.setTimeout(() => setCopied(""), 1000);
        return () => window.clearTimeout(timeoutId);
    }, [copied]);

    const { login } = useAuthContext()
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");

        if (!email.trim() || !password) return;

        try {
            await login({ email, password });
            navigate("/dashboard");
        } catch {
            setErrorMessage("Wrong username or password.")
        }
    }

    async function copyDemoCredential(label, value) {
        setCopyError("");

        try {
            await navigator.clipboard.writeText(value);
            setCopied(label);
        } catch {
            setCopied("");
            setCopyError(`Could not copy ${label}. Try Again.`)
        }
    }

    return (
        <div className="flex flex-col mx-auto w-full max-w-sm min-h-dvh gap-6 p-6 items-center justify-center">

            <div className="flex flex-col gap-2 p-4 border bg-blue-500 rounded-md">
                <p className="text-white">Login with a demo account!</p>
                <div className="flex items-center justify-between gap-2">
                    <p className="whitespace-nowrap text-sm text-white"><strong>Email:</strong> demouser@example.com</p>
                    <Button className="w-14 shrink-0 px-0 text-xs bg-blue-500 text-white hover:bg-blue-600" type="button" onClick={() => copyDemoCredential("email", "demouser@example.com")}>
                        {copied === "email" ? "Copied!" : <Copy/>}
                    </Button>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className="whitespace-nowrap text-sm text-white"><strong>Password:</strong> DemoPassword</p>
                    <Button className="w-14 shrink-0 px-0 text-xs bg-blue-500 text-white hover:bg-blue-600" type="button" onClick={() => copyDemoCredential("password", "DemoPassword")}>
                        {copied === "password" ? "Copied!" : <Copy/>}
                    </Button>
                </div>
                {copyError && <p role="alert" className="text-white">{copyError}</p>}
            </div>

            {/* Logo */}
            <Link to="/" className="flex justify-center w-full">
                <Refrigerator className="w-1/3 h-auto cursor-pointer" />
            </Link>

            {/* Form */}
            <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
                {errorMessage && (
                    <div className="border border-red-200 px-2 py-3 grid gap-2 bg-red-100 rounded-lg">
                        <p className="text-sm text-red-600" role="alert">
                            {errorMessage}
                        </p>
                    </div>
                )}
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label className="text-gray-700" htmlFor="email">
                            Email<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            className="placeholder:text-gray-400 w-full"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-gray-700" htmlFor="password">
                            Password<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-center">
                    <Button type="submit" className="text-md font-bold bg-blue-500 hover:bg-blue-600 w-full px-10 py-5 hover:cursor-pointer">
                        Log In
                    </Button>
                </div>
                <Link to="/signup" className="text-sm">
                    Don't have an account?{' '}
                    <span
                        className="font-bold hover:cursor-pointer text-blue-500 hover:text-blue-600"
                    >
                        Sign Up
                    </span>
                </Link>
            </form>
        </div>
    )
}

export default Login
export const Component = Login;
