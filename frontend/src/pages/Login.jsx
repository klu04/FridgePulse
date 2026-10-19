import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Refrigerator } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthContext } from "@/hooks/useAuthContext"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"

function Login() {

    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useAuthContext()
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");

        if (!email.trim() || !password ) return;

        try {
            await login({email, password});
            navigate("/dashboard");
        } catch {
            setErrorMessage("Wrong username or password.")
        }
    }

    return (
        <div className="flex flex-col mx-auto w-full max-w-sm min-h-dvh gap-6 p-6 items-center justify-center">

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
